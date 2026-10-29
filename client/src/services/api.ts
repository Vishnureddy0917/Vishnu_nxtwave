const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('launchloop_admin_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return (await response.text()) as unknown as T;
  }

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new ApiError(
      data.error || data.message || 'An unexpected server error occurred.',
      response.status,
      data
    );
  }

  return data;
}

export const api = {
  // Public Workshop & Registration
  register: (payload: any) =>
    request<{ success: boolean; data: any }>('/registrations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getRegistrationStatus: (referralCode: string) =>
    request<{ success: boolean; data: any }>(`/registrations/status/${referralCode}`),

  lookupReferralCode: (code: string) =>
    request<{ success: boolean; data: any }>(`/referrals/lookup/${code}`),

  getLeaderboard: (limit: number = 25) =>
    request<{ success: boolean; data: any[] }>(`/referrals/leaderboard?limit=${limit}`),

  trackEvent: (eventData: any) =>
    request<{ success: boolean; eventId: string }>('/campaigns/track', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Admin Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () =>
    request<{ success: boolean; user: any }>('/auth/me'),

  // Admin Command Center
  getDashboardData: (isDemo?: boolean) =>
    request<{ success: boolean; data: any }>(
      `/analytics/dashboard${isDemo !== undefined ? `?isDemo=${isDemo}` : ''}`
    ),

  toggleDemoMode: () =>
    request<{ success: boolean; isDemoModeActive: boolean; message: string }>(
      '/analytics/settings/toggle-demo',
      { method: 'POST' }
    ),

  // Admin Registrations
  getRegistrations: (params: Record<string, any>) => {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    }
    return request<{ success: boolean; data: any[]; pagination: any }>(
      `/registrations/admin?${query.toString()}`
    );
  },

  exportRegistrationsCsvUrl: (isDemo?: boolean) =>
    `/api/registrations/admin/export${isDemo !== undefined ? `?isDemo=${isDemo}` : ''}`,

  deleteRegistration: (id: string) =>
    request<{ success: boolean; message: string }>(`/registrations/admin/${id}`, {
      method: 'DELETE',
    }),

  // Admin Campaign Links & Channels
  getCampaignLinks: (isDemo?: boolean) =>
    request<{ success: boolean; data: any[] }>(
      `/campaigns/links${isDemo !== undefined ? `?isDemo=${isDemo}` : ''}`
    ),

  createCampaignLink: (payload: any) =>
    request<{ success: boolean; data: any }>('/campaigns/links', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  toggleCampaignLink: (id: string, isActive: boolean) =>
    request<{ success: boolean; data: any }>(`/campaigns/links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  // Admin Referrals Analytics
  getReferralsAnalytics: (isDemo?: boolean) =>
    request<{ success: boolean; data: any }>(
      `/referrals/admin/analytics${isDemo !== undefined ? `?isDemo=${isDemo}` : ''}`
    ),

  // Admin Budget Planner
  getBudget: (isDemo?: boolean) =>
    request<{ success: boolean; data: any }>(
      `/budget${isDemo !== undefined ? `?isDemo=${isDemo}` : ''}`
    ),

  recordExpense: (payload: { categoryId: string; amount: number; description: string; date?: string; confirmedExceed?: boolean }) =>
    request<{ success: boolean; data: any; warning?: boolean; requiresConfirmation?: boolean; message?: string }>(
      '/budget/expense',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  updateAllocations: (allocations: Array<{ id: string; plannedAmount: number }>, confirmedExceed?: boolean) =>
    request<{ success: boolean; data: any; warning?: boolean; requiresConfirmation?: boolean; message?: string }>(
      '/budget/allocations',
      {
        method: 'PUT',
        body: JSON.stringify({ allocations, confirmedExceed }),
      }
    ),

  exportBudgetCsvUrl: (isDemo?: boolean) =>
    `/api/budget/export${isDemo !== undefined ? `?isDemo=${isDemo}` : ''}`,

  // Admin Growth Intelligence
  getInsights: (isDemo?: boolean) =>
    request<{ success: boolean; data: any[]; summary: any }>(
      `/insights${isDemo !== undefined ? `?isDemo=${isDemo}` : ''}`
    ),

  // Admin 7-Day Strategy & Presentation Slides
  getStrategy: (isDemo?: boolean) =>
    request<{ success: boolean; data: any }>(
      `/strategy${isDemo !== undefined ? `?isDemo=${isDemo}` : ''}`
    ),

  updateDailyPlans: (dailyPlans: any[]) =>
    request<{ success: boolean; data: any[] }>('/strategy/plan', {
      method: 'PUT',
      body: JSON.stringify({ dailyPlans }),
    }),

  getPresentationSlides: () =>
    request<{ success: boolean; data: any[] }>('/strategy/slides'),
};
