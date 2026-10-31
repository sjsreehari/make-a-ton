const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ accessToken: string; user: { id: string; name: string; email: string; role: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      ),
    signup: (data: object) =>
      apiFetch<{ accessToken: string; user: object }>(
        '/auth/signup',
        { method: 'POST', body: JSON.stringify(data) },
      ),
    me: () => apiFetch<{ id: string; name: string; email: string; role: string }>('/auth/me'),
    logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    forgotPassword: (email: string) =>
      apiFetch<void>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (token: string, password: string) =>
      apiFetch<void>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  },
  plans: {
    list: (p = 1, l = 20) => apiFetch<unknown>(`/plans?page=${p}&limit=${l}`),
  },
  subscriptions: {
    list: (params?: string) => apiFetch<unknown>(`/subscriptions?${params ?? ''}`),
    get: (id: string) => apiFetch<unknown>(`/subscriptions/${id}`),
  },
  invoices: {
    list: (params?: string) => apiFetch<unknown>(`/invoices?${params ?? ''}`),
    get: (id: string) => apiFetch<unknown>(`/invoices/${id}`),
  },
  payments: {
    list: (params?: string) => apiFetch<unknown>(`/payments?${params ?? ''}`),
  },
  products: {
    list: (params?: string) => apiFetch<unknown>(`/catalog/products?${params ?? ''}`),
  },
  discounts: {
    list: () => apiFetch<unknown>('/discounts'),
  },
  taxes: {
    list: () => apiFetch<unknown>('/tax'),
  },
  staff: {
    list: () => apiFetch<unknown>('/users?role=STAFF'),
  },
  auditLog: {
    list: (params?: string) => apiFetch<unknown>(`/audit?${params ?? ''}`),
  },
  dashboard: {
    summary: () => apiFetch<unknown>('/reports/summary'),
  },
  health: {
    check: () => apiFetch<unknown>('/health'),
  },
};
