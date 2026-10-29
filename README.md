# LaunchLoop AI 🚀

> **Turn one registration into a campus-wide movement.**  
> A complete, integrated student acquisition, viral referral engine, and campaign operations platform built for NxtWave's Growth Challenge.

---

## 🌟 The Challenge

* **Workshop Title:** “Build Your First AI Project in 60 Minutes”
* **Organizer:** NxtWave
* **Audience:** Final-year engineering students across India (CSE, IT, AI/DS, ECE)
* **Goal:** Acquire **500 verified registrations** within **7 days**
* **Budget Ceiling:** **₹2,000 total budget** (Hard Cap)
* **Target Blended CAC:** **₹4.00 per student**
* **Core Constraint:** Run completely locally with zero external databases, zero paid AI APIs, zero subscriptions, and zero cloud accounts.

LaunchLoop AI is not merely a landing page. It is a full-stack acquisition platform featuring an interactive workshop preview, a collision-resistant referral engine, an executive Command Center with real-time telemetry, a disciplined ₹2,000 budget planner, and an explainable, deterministic growth recommendation system.

---

## 🛠️ Technology Stack

### Frontend
* **Core:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Glassmorphism design tokens
* **Icons:** Lucide Icons
* **Charts & Telemetry:** Recharts (Responsive Area, Bar, Line, and Donut charts)
* **Forms & Validation:** React Hook Form, Zod

### Backend
* **Runtime:** Node.js (v20+ / v26)
* **Framework:** Express.js, TypeScript
* **Security & Auth:** bcryptjs (10 rounds), JWT bearer tokens, Helmet security headers, in-memory sliding-window rate limiters
* **Validation:** Zod schemas for all inbound payloads

### Local NoSQL Document Database
* **Architecture:** Custom, persistent, file-based NoSQL document repository.
* **Storage Location:** JSON files inside the root `data/` directory.
* **Operations:** `insertOne`, `findOne`, `findMany`, `updateOne`, `deleteOne`, `countDocuments`, `aggregate`.
* **Guarantees:** Atomic temp-file persistence with OS rename, in-memory write serialization mutex, unique constraints enforcement, and automatic corruption recovery.
* **Strict Independence:** Zero MongoDB, Firebase, Supabase, PostgreSQL, MySQL, SQLite, Redis, or external database servers.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* Node.js v18+ (tested on Node v26)
* npm v9+

### 2. Installation
Clone or navigate to the repository directory and install all workspace dependencies:
```bash
npm install
```

### 3. Initialize Local NoSQL Database
Initialize the safe, local file-based database collections:
```bash
npm run db:init
```

### 4. Seed Deterministic Demo Data (Recommended for Presentations)
Populate 285 realistic synthetic registrations, 52 verified referrals, 1,140 visits, and ₹950 in expenses across the 7-day timeline:
```bash
npm run db:seed
```

### 5. Launch Application
Run both the Express backend API and the Vite React frontend concurrently:
```bash
npm run dev
```

* **Frontend Application:** [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** [http://localhost:5000](http://localhost:5000)
* **Admin Portal Login:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 🔐 Administrator Credentials

For evaluation and demonstration purposes, a default admin account is pre-configured during database initialization:

* **Email:** `admin@launchloop.ai`
* **Password:** `Admin@LaunchLoop2026!`
* **Admin Dashboard URL:** [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 🧭 Application Routes

### Public Student Experience
| Route | Description |
| :--- | :--- |
| `/` | Workshop landing page with hero, interactive CSS project preview, outcomes, audience, and FAQ. |
| `/register` | Direct registration form with validation, referral auto-fill, and privacy controls. |
| `/registration/success` | Confirmation screen with unique referral code, shareable link, WhatsApp 1-click CTA, and verified counts. |
| `/r/:referralCode` | Referral-aware entrypoint that attributes clicks, stores attribution, and redirects to registration. |
| `/leaderboard` | Public referral leaderboard displaying student ranks, badges, and colleges with privacy masking. |

### Protected Admin Command Center
| Route | Description |
| :--- | :--- |
| `/admin/login` | Administrator authentication with bcrypt password verification and JWT token issuance. |
| `/admin` | Command Center with 8 real-time KPI cards, daily acquisition charts, conversion rates, and college distribution. |
| `/admin/registrations` | Searchable, paginated registration management with channel filters and formula-injection-proof CSV exports. |
| `/admin/channels` | Acquisition channel telemetry & UTM Campaign Link Generator with click and conversion tracking. |
| `/admin/referrals` | Referral engine analytics: viral factor ($K$), active ambassadors, and proposed incentive tiers. |
| `/admin/budget` | ₹2,000 Budget Planner with category allocations, itemized expense logs, cap enforcement, and CSV audit export. |
| `/admin/insights` | Explainable Growth Intelligence: 6 deterministic rules with transparent mathematical thresholds and explanation drawers. |
| `/admin/strategy` | Seven-day campaign strategy with daily targets, actuals, decision rules, and a 5-slide challenge presentation viewer. |

---

## 🧪 Automated Testing

LaunchLoop AI includes an automated 17-point test suite verifying every mandatory requirement:

```bash
npm test
```

### Verified Test Cases:
1. `✓` Successfully registers a student with valid inputs
2. `✓` Rejects invalid registration with bad email and missing required fields
3. `✓` Prevents duplicate registrations with the same email address
4. `✓` Generates unique, collision-resistant referral codes (`LL-XXXXX`)
5. `✓` Attributes new registration to the referring student
6. `✓` Rejects self-referral attempts safely without recording referral credit
7. `✓` Prevents duplicate referral credit on the same registration
8. `✓` Accurately attributes acquisition source and UTM parameters
9. `✓` Enforces ₹2,000 budget cap and requires explicit confirmation if exceeded
10. `✓` Authenticates administrator with valid password and issues JWT
11. `✓` Blocks unauthorized access to admin endpoints without valid token
12. `✓` Accurately calculates dashboard KPIs, pacing, and conversion rates
13. `✓` Verifies data persists across store re-instantiation (restart simulation)
14. `✓` Safely serializes concurrent writes without data loss or race conditions
15. `✓` Detects corrupted JSON file, preserves it with timestamp, and recovers safely
16. `✓` Safely isolates demo records from live records and supports clean reset
17. `✓` Exports CSV with formula injection sanitization on unsafe leading characters

---

## 💾 Local Database Scripts & Commands

All database reads and writes go through the local file-based repository:

```bash
# Initialize clean database collections
npm run db:init

# Load deterministic synthetic demo data
npm run db:seed

# Reset demo data safely (preserves real student registrations)
npm run db:reset

# Create a timestamped backup in backups/
npm run db:backup

# Restore database from latest backup snapshot
npm run db:restore
```

---

## 🛡️ Security, Privacy & Integrity

1. **Password Hashing:** Passwords hashed with `bcryptjs` using 10 salt rounds.
2. **Server-Side Authorization:** Protected routes verify JWT Bearer tokens on the server.
3. **Spreadsheet Formula Injection Sanitization:** Cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are sanitized with leading apostrophes to prevent Dynamic Data Exchange (DDE) execution in Excel or Sheets.
4. **Rate Limiting:** In-memory sliding-window limiters guard against automated brute-force attacks and DDoS.
5. **Student Privacy Protection:** No personal emails or phone numbers are ever exposed on public leaderboards. Display names are sanitized (e.g., "Rahul S.") and participants can opt out at any time.

---

## 📚 Complete Submission Documentation

* **[Growth Plan (docs/GROWTH_PLAN.md)](docs/GROWTH_PLAN.md):** Target audience, psychology, 7-day acquisition trajectory, and budget breakdown.
* **[Five Presentation Slides (docs/GROWTH_PLAN_SLIDES.md)](docs/GROWTH_PLAN_SLIDES.md):** Concise, presentation-ready content for all 5 slides.
* **[AI Learning Notes (docs/AI_LEARNING_NOTES.md)](docs/AI_LEARNING_NOTES.md):** Three grounded engineering decisions formatted as *What I asked → What AI initially suggested → What I changed → Why*.
* **[Architecture Document (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md):** NoSQL engine mechanics, sequence diagrams, concurrency mutex, and scaling limitations.

---

## ⚖️ Known Limitations & Honest Architecture Notes

* **Single-Process Scope:** This local file-based NoSQL database is engineered for single-process evaluation. It does not provide multi-process distributed locks.
* **Memory Working Set:** Entire JSON collections are loaded into memory for sub-millisecond filtering. Suitable for up to 100,000 records; enterprise workloads would migrate to PostgreSQL or MongoDB.
* **Rule Engine Transparency:** The Growth Intelligence engine uses deterministic Bayesian heuristics rather than paid generative LLM APIs, providing 100% predictable, auditable recommendations with zero subscription costs.
