// API client for MapFin backend

// Use relative URL for Vercel deployment, fallback to local for dev
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001/api'
  : '/api';

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Sheet names as constants
export const SHEETS = {
  PEOPLE: 'People',
  NET_WORTH: 'NetWorthEntries',
  LIABILITIES: 'Liabilities',
  EXPENSES: 'Expenses',
  INCOME: 'Income',
  BUDGETS: 'Budgets',
  GOALS: 'Goals',
  CATEGORIES: 'Categories',
  CARDS: 'Cards',
  TAGS: 'Tags',
} as const;

// Generic CRUD operations
export const api = {
  // Get all records from a sheet
  getAll: <T>(sheet: string) => fetchApi<T[]>(`/${sheet}`),

  // Get a single record by ID
  getById: <T extends { id: string }>(sheet: string, id: string) =>
    fetchApi<T[]>(`/${sheet}`).then(
      (records) => records.find((r) => r.id === id)
    ),

  // Create a new record
  create: <T>(sheet: string, data: Partial<T>) =>
    fetchApi<{ success: boolean; id: string; data: T }>(`/${sheet}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update a record
  update: <T>(sheet: string, id: string, data: Partial<T>) =>
    fetchApi<{ success: boolean; data: T }>(`/${sheet}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete a record
  delete: (sheet: string, id: string) =>
    fetchApi<{ success: boolean }>(`/${sheet}/${id}`, {
      method: 'DELETE',
    }),

  // Health check
  health: () => fetchApi<{ status: string; timestamp: string }>('/health'),
};

// Type-safe API helpers for each entity
export const peopleApi = {
  getAll: () => api.getAll<import('@/types').Person>(SHEETS.PEOPLE),
  create: (data: Partial<import('@/types').Person>) => api.create(SHEETS.PEOPLE, data),
  update: (id: string, data: Partial<import('@/types').Person>) => api.update(SHEETS.PEOPLE, id, data),
  delete: (id: string) => api.delete(SHEETS.PEOPLE, id),
};

export const netWorthApi = {
  getAll: () => api.getAll<import('@/types').NetWorthEntry>(SHEETS.NET_WORTH),
  create: (data: Partial<import('@/types').NetWorthEntry>) => api.create(SHEETS.NET_WORTH, data),
  update: (id: string, data: Partial<import('@/types').NetWorthEntry>) => api.update(SHEETS.NET_WORTH, id, data),
  delete: (id: string) => api.delete(SHEETS.NET_WORTH, id),
};

export const liabilitiesApi = {
  getAll: () => api.getAll<import('@/types').Liability>(SHEETS.LIABILITIES),
  create: (data: Partial<import('@/types').Liability>) => api.create(SHEETS.LIABILITIES, data),
  update: (id: string, data: Partial<import('@/types').Liability>) => api.update(SHEETS.LIABILITIES, id, data),
  delete: (id: string) => api.delete(SHEETS.LIABILITIES, id),
};

// Helper to parse tags JSON string
function parseTags(tagsStr: unknown): import('@/types').Tag[] | undefined {
  if (!tagsStr || tagsStr === '') return undefined;
  try {
    return JSON.parse(tagsStr as string);
  } catch {
    return undefined;
  }
}

export const expensesApi = {
  getAll: async () => {
    const data = await api.getAll<import('@/types').Expense & { tags?: string }>(SHEETS.EXPENSES);
    // Parse tags JSON string back to array
    return data.map(expense => ({
      ...expense,
      tags: parseTags(expense.tags),
    })) as import('@/types').Expense[];
  },
  create: (data: Partial<import('@/types').Expense>) => {
    const payload = {
      ...data,
      tags: data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : undefined,
    };
    return api.create(SHEETS.EXPENSES, payload);
  },
  update: (id: string, data: Partial<import('@/types').Expense>) => {
    const payload = {
      ...data,
      tags: data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : undefined,
    };
    return api.update(SHEETS.EXPENSES, id, payload);
  },
  delete: (id: string) => api.delete(SHEETS.EXPENSES, id),
};

export const incomeApi = {
  getAll: () => api.getAll<import('@/types').Income>(SHEETS.INCOME),
  create: (data: Partial<import('@/types').Income>) => api.create(SHEETS.INCOME, data),
  update: (id: string, data: Partial<import('@/types').Income>) => api.update(SHEETS.INCOME, id, data),
  delete: (id: string) => api.delete(SHEETS.INCOME, id),
};

export const budgetsApi = {
  getAll: () => api.getAll<import('@/types').Budget>(SHEETS.BUDGETS),
  create: (data: Partial<import('@/types').Budget>) => api.create(SHEETS.BUDGETS, data),
  update: (id: string, data: Partial<import('@/types').Budget>) => api.update(SHEETS.BUDGETS, id, data),
  delete: (id: string) => api.delete(SHEETS.BUDGETS, id),
};

export const goalsApi = {
  getAll: () => api.getAll<import('@/types').Goal>(SHEETS.GOALS),
  create: (data: Partial<import('@/types').Goal>) => api.create(SHEETS.GOALS, data),
  update: (id: string, data: Partial<import('@/types').Goal>) => api.update(SHEETS.GOALS, id, data),
  delete: (id: string) => api.delete(SHEETS.GOALS, id),
};

export const categoriesApi = {
  getAll: () => api.getAll<{ id: string; name: string }>(SHEETS.CATEGORIES),
  create: (data: { id?: string; name: string }) => api.create(SHEETS.CATEGORIES, data),
  update: (id: string, data: { name: string }) => api.update(SHEETS.CATEGORIES, id, data),
  delete: (id: string) => api.delete(SHEETS.CATEGORIES, id),
};

export const cardsApi = {
  getAll: () => api.getAll<import('@/types').Card>(SHEETS.CARDS),
  create: (data: Partial<import('@/types').Card>) => api.create(SHEETS.CARDS, data),
  update: (id: string, data: Partial<import('@/types').Card>) => api.update(SHEETS.CARDS, id, data),
  delete: (id: string) => api.delete(SHEETS.CARDS, id),
};

export const tagsApi = {
  getAll: () => api.getAll<import('@/types').Tag>(SHEETS.TAGS),
  create: (data: Partial<import('@/types').Tag>) => api.create(SHEETS.TAGS, data),
  update: (id: string, data: Partial<import('@/types').Tag>) => api.update(SHEETS.TAGS, id, data),
  delete: (id: string) => api.delete(SHEETS.TAGS, id),
};
