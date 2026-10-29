import { Router } from 'express';
import { z } from 'zod';
import { BudgetRepository, RegistrationRepository } from '../db/repository.js';
import { BudgetEntry, BudgetCategoryEnum } from '../db/schemas.js';
import { CsvExporter } from '../services/csvExporter.js';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const TOTAL_BUDGET_CAP = 2000;

// Admin: Get budget summary and category breakdown
router.get('/', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;
    const filter = isDemoFilter !== undefined ? { isDemo: isDemoFilter } : {};

    const [budgets, allRegistrations] = await Promise.all([
      BudgetRepository.findAll(filter),
      RegistrationRepository.findMany(filter),
    ]);

    // Map registrations to categories for CAC calculation
    const channelToBudgetMap: Record<string, BudgetEntry['category']> = {
      campus_ambassador: 'campus_ambassador',
      whatsapp: 'student_creative',
      social_organic: 'student_creative',
      college_email: 'student_creative',
      paid_experiment: 'paid_experiment',
    };

    const regsByCategory: Record<string, number> = {
      campus_ambassador: 0,
      student_creative: 0,
      paid_experiment: 0,
      contingency: 0,
    };

    for (const r of allRegistrations) {
      const cat = channelToBudgetMap[r.originalSource] || 'student_creative';
      regsByCategory[cat] = (regsByCategory[cat] || 0) + 1;
    }

    let totalPlanned = 0;
    let totalActual = 0;

    const enrichedCategories = budgets.map((b) => {
      totalPlanned += b.plannedAmount;
      totalActual += b.actualSpend;
      const attributedRegs = regsByCategory[b.category] || 0;
      const costPerRegistration = attributedRegs > 0 && b.actualSpend > 0
        ? Number((b.actualSpend / attributedRegs).toFixed(1))
        : null;

      return {
        ...b,
        remainingAmount: b.plannedAmount - b.actualSpend,
        attributedRegistrations: attributedRegs,
        costPerRegistration, // CAC in INR
      };
    });

    const totalRemaining = totalPlanned - totalActual;
    const overallCAC = allRegistrations.length > 0 && totalActual > 0
      ? Number((totalActual / allRegistrations.length).toFixed(1))
      : null;

    res.json({
      success: true,
      data: {
        summary: {
          totalBudgetCap: TOTAL_BUDGET_CAP,
          totalPlanned,
          totalActualSpend: totalActual,
          totalRemaining,
          overallCAC,
          isCapExceeded: totalPlanned > TOTAL_BUDGET_CAP,
        },
        categories: enrichedCategories,
      },
    });
  } catch (err) {
    next(err);
  }
});

const RecordExpenseSchema = z.object({
  categoryId: z.string(),
  amount: z.number().positive('Expense amount must be greater than zero'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  date: z.string().optional(),
  confirmedExceed: z.boolean().optional(),
});

// Admin: Record expense under a category
router.post('/expense', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = RecordExpenseSchema.parse(req.body);
    const budgets = await BudgetRepository.findAll({});
    const categoryEntry = budgets.find((b) => b.id === input.categoryId);

    if (!categoryEntry) {
      res.status(404).json({ success: false, error: 'Budget category not found' });
      return;
    }

    const currentTotalSpend = budgets.reduce((acc, b) => acc + b.actualSpend, 0);
    const projectedTotalSpend = currentTotalSpend + input.amount;

    if (projectedTotalSpend > TOTAL_BUDGET_CAP && !input.confirmedExceed) {
      res.status(400).json({
        success: false,
        warning: true,
        message: `Recording this expense will bring total spend to ₹${projectedTotalSpend}, exceeding the ₹${TOTAL_BUDGET_CAP} hard campaign cap by ₹${projectedTotalSpend - TOTAL_BUDGET_CAP}.`,
        requiresConfirmation: true,
      });
      return;
    }

    const expenseLog = {
      id: `exp_${Date.now()}`,
      date: input.date || new Date().toISOString().split('T')[0],
      amount: input.amount,
      description: input.description.trim(),
      loggedBy: req.user?.email || 'admin',
    };

    const newLogs = [...(categoryEntry.expenseLogs || []), expenseLog];
    const newActualSpend = (categoryEntry.actualSpend || 0) + input.amount;

    const updated = await BudgetRepository.update(categoryEntry.id, {
      actualSpend: newActualSpend,
      expenseLogs: newLogs,
    });

    res.status(201).json({
      success: true,
      data: updated,
      recordedExpense: expenseLog,
    });
  } catch (err) {
    next(err);
  }
});

const UpdateAllocationsSchema = z.object({
  allocations: z.array(
    z.object({
      id: z.string(),
      plannedAmount: z.number().min(0),
    })
  ),
  confirmedExceed: z.boolean().optional(),
});

// Admin: Update planned allocations across categories
router.put('/allocations', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { allocations, confirmedExceed } = UpdateAllocationsSchema.parse(req.body);
    const totalPlanned = allocations.reduce((acc, a) => acc + a.plannedAmount, 0);

    if (totalPlanned > TOTAL_BUDGET_CAP && !confirmedExceed) {
      res.status(400).json({
        success: false,
        warning: true,
        message: `Total planned allocation is ₹${totalPlanned}, exceeding the ₹${TOTAL_BUDGET_CAP} campaign budget cap by ₹${totalPlanned - TOTAL_BUDGET_CAP}.`,
        requiresConfirmation: true,
      });
      return;
    }

    for (const alloc of allocations) {
      await BudgetRepository.update(alloc.id, {
        plannedAmount: alloc.plannedAmount,
      });
    }

    const updatedBudgets = await BudgetRepository.findAll({});
    res.json({
      success: true,
      data: updatedBudgets,
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Export Budget Report to CSV
router.get('/export', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;
    const filter = isDemoFilter !== undefined ? { isDemo: isDemoFilter } : {};

    const budgets = await BudgetRepository.findAll(filter);

    // Flatten expense logs
    const auditRows: any[] = [];
    for (const b of budgets) {
      if (b.expenseLogs && b.expenseLogs.length > 0) {
        for (const log of b.expenseLogs) {
          auditRows.push({
            category: b.categoryLabel,
            date: log.date,
            description: log.description,
            amount: `₹${log.amount}`,
            loggedBy: log.loggedBy,
          });
        }
      } else {
        auditRows.push({
          category: b.categoryLabel,
          date: 'N/A',
          description: 'No expenses recorded yet',
          amount: '₹0',
          loggedBy: 'system',
        });
      }
    }

    const csvContent = CsvExporter.generateCsv(auditRows, [
      { key: 'category', label: 'Budget Category' },
      { key: 'date', label: 'Expense Date' },
      { key: 'description', label: 'Description & Justification' },
      { key: 'amount', label: 'Amount (INR)' },
      { key: 'loggedBy', label: 'Logged By' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="launchloop-budget-report-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
});

export default router;
