import {
  OverviewData,
  TransactionItem,
  GoalItem,
  RecurringItem,
  SpendingInsightsData,
  AffordabilityResult,
  HorizonForecast,
} from '../types/index.js';
import {
  savePendingTransaction,
  getPendingTransactions,
  removePendingTransaction,
  cacheApiResponse,
  getCachedApiResponse,
} from '../utils/db.js';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('money_os_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('money_os_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('money_os_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cacheKey = `cache_${endpoint}_${options.method || 'GET'}`;

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Clear token if invalid
        // clearAuthToken();
      }
      const err = await res.json().catch(() => ({ message: 'Network request failed' }));
      throw new Error(err.message || `Request failed with status ${res.status}`);
    }

    const json = await res.json();
    const data = json.data !== undefined ? json.data : json;

    // Cache successful GET requests
    if (!options.method || options.method === 'GET') {
      cacheApiResponse(cacheKey, data);
    }

    return data as T;
  } catch (error: any) {
    // If offline or network failed, attempt to return cached response for GET
    if (!options.method || options.method === 'GET') {
      const cached = await getCachedApiResponse(cacheKey);
      if (cached) {
        console.warn(`[API] Operating offline. Serving cached response for ${endpoint}`);
        return cached as T;
      }
    }
    throw error;
  }
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  register: async (name: string, email: string, password: string, currency?: string) => {
    const res = await request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, currency }),
    });
    setAuthToken(res.token);
    return res;
  },

  getMe: () => request<any>('/auth/me'),

  // Money Engine
  getOverview: () => request<OverviewData>('/money/overview'),
  getSafeToSpend: () => request<any>('/money/safe-to-spend'),
  getHealthScore: () => request<any>('/money/health'),
  getRunway: () => request<any>('/money/runway'),
  getForecast: (horizon?: string) => request<Record<string, HorizonForecast> | HorizonForecast>(`/money/forecast${horizon ? `?horizon=${horizon}` : ''}`),

  // Decision Engine: Can I afford this?
  checkAffordability: (itemName: string, itemPrice: number, category?: string) =>
    request<AffordabilityResult>('/affordability/check', {
      method: 'POST',
      body: JSON.stringify({ itemName, itemPrice, category }),
    }),

  // Transactions
  getTransactions: (filter?: { type?: string; category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filter?.type) params.append('type', filter.type);
    if (filter?.category) params.append('category', filter.category);
    if (filter?.search) params.append('search', filter.search);
    const qs = params.toString();
    return request<TransactionItem[]>(`/transactions${qs ? `?${qs}` : ''}`);
  },

  createTransaction: async (tx: Partial<TransactionItem>) => {
    try {
      return await request<TransactionItem>('/transactions', {
        method: 'POST',
        body: JSON.stringify(tx),
      });
    } catch (err) {
      if (!navigator.onLine) {
        console.warn('[Offline] Queueing transaction for later sync');
        return await savePendingTransaction(tx);
      }
      throw err;
    }
  },

  updateTransaction: (id: string, tx: Partial<TransactionItem>) =>
    request<TransactionItem>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tx),
    }),

  deleteTransaction: (id: string) =>
    request<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    }),

  // Goals
  getGoals: (status?: string) =>
    request<GoalItem[]>(`/goals${status ? `?status=${status}` : ''}`),

  createGoal: (goal: Partial<GoalItem>) =>
    request<GoalItem>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),

  updateGoal: (id: string, goal: Partial<GoalItem>) =>
    request<GoalItem>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    }),

  deleteGoal: (id: string) =>
    request<{ message: string }>(`/goals/${id}`, {
      method: 'DELETE',
    }),

  // Recurring
  getRecurring: () => request<RecurringItem[]>('/recurring'),

  createRecurring: (rec: Partial<RecurringItem>) =>
    request<RecurringItem>('/recurring', {
      method: 'POST',
      body: JSON.stringify(rec),
    }),

  deleteRecurring: (id: string) =>
    request<{ message: string }>(`/recurring/${id}`, {
      method: 'DELETE',
    }),

  // Insights
  getInsights: () => request<SpendingInsightsData>('/insights'),

  // Profile & Setup
  getProfile: () => request<{ user: any; financial: any }>('/profile'),

  updateProfile: (data: any) =>
    request<any>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // AI Assistant Chatbot
  sendChatMessage: (message: string) =>
    request<{
      reply: string;
      cardType?: string;
      cardData?: any;
      quickReplies?: string[];
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Reset Demo
  resetDemoData: () =>
    request<{ message: string }>('/seed/reset', {
      method: 'POST',
    }),

  // Sync Offline Queue
  syncOfflineQueue: async () => {
    if (!navigator.onLine) return;
    const pending = await getPendingTransactions();
    for (const item of pending) {
      try {
        const { localId, pendingSync, _id, ...cleanTx } = item as any;
        await request('/transactions', {
          method: 'POST',
          body: JSON.stringify(cleanTx),
        });
        await removePendingTransaction(localId);
      } catch (e) {
        console.error('Failed to sync offline item', e);
      }
    }
  },
};
