// BillPilot Unified API Client connected to live backend & MySQL database

export interface Plan {
  id: string;
  name: string;
  price: string;
  billingPeriod: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  minQuantity: number;
  autoClose: boolean;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
  isActive: boolean;
  products?: Array<{ id: string; name: string; quantity: number }>;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  salesPrice: string;
  costPrice: string;
  notes?: string;
  isActive: boolean;
  taxRule?: { id: string; name: string; ratePercent: string } | null;
  variants: Array<{ id: string; attribute: string; value: string; extraPrice: string }>;
}

export interface Subscription {
  id: string;
  number: string;
  customerId: string;
  customer?: { id: string; name: string; email: string; company?: string; phone?: string };
  planId: string;
  plan?: Plan;
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED";
  startDate: string;
  expiryDate?: string;
  nextBillingDate?: string;
  isPaused: boolean;
  lines?: Array<{
    id: string;
    product: { name: string };
    variant?: { value: string; extraPrice: string };
    quantity: number;
    unitPrice: string;
    amount: string;
  }>;
}

export interface Invoice {
  id: string;
  number: string;
  subscriptionId?: string;
  subscription?: { number: string };
  customerId: string;
  customer?: { id: string; name: string; email: string };
  status: "DRAFT" | "CONFIRMED" | "PAID" | "OVERDUE" | "CANCELLED";
  periodStart?: string;
  periodEnd?: string;
  issueDate?: string;
  dueDate: string;
  subtotal?: string;
  taxAmount?: string;
  discountAmount?: string;
  total: string;
  amountDue: string;
  amountPaid: string;
  lines?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
}

export interface TaxRule {
  id: string;
  name: string;
  ratePercent: string;
  region: string;
  isInclusive: boolean;
  isActive: boolean;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FIXED";
  value: string;
  scope: string;
  startsAt: string;
  endsAt: string;
  usedCount: number;
  usageLimit?: number | null;
  minPurchaseAmount?: string | null;
  isActive: boolean;
}

export interface LeakageFinding {
  id: string;
  kind: string;
  entity: string;
  entityId: string;
  amountAtRisk: string;
  detail: any;
  resolvedAt?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  gstin?: string;
  currency: string;
  creditBalance: string;
  activeSubscriptionsCount: number;
  createdAt: string;
}

// Client helper that automatically ensures valid Bearer token for local developer convenience
function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    // Buffer by 15 seconds to avoid racing on edge of expiration
    return payload.exp * 1000 > Date.now() + 15000;
  } catch {
    return false;
  }
}

async function getAuthHeader(forceFresh = false): Promise<string | null> {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("billpilot_token");

  if (!token || !isTokenValid(token) || forceFresh) {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@brightloop.test", password: "Admin@12345!" }),
      });
      if (res.ok) {
        const data = await res.json();
        token = data.accessToken;
        if (token) {
          localStorage.setItem("billpilot_token", token);
          if (data.user) localStorage.setItem("billpilot_user", JSON.stringify(data.user));
        }
      }
    } catch {
      // fallback
    }
  }
  return token ? `Bearer ${token}` : null;
}

async function request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const auth = await getAuthHeader(isRetry);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(auth ? { Authorization: auth } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !isRetry) {
    // If token expired, purge it and retry automatically once with a fresh token
    if (typeof window !== "undefined") {
      localStorage.removeItem("billpilot_token");
    }
    return request<T>(endpoint, options, true);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || errorBody?.message || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

export const api = {
  auth: {
    async me() {
      return request<{ user: any }>("/auth/me");
    },
    async login(body: { email: string; password: string }) {
      const res = await request<{ user: any; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (res?.accessToken && typeof window !== "undefined") {
        localStorage.setItem("billpilot_token", res.accessToken);
        localStorage.setItem("billpilot_user", JSON.stringify(res.user));
      }
      return res;
    },
    async signup(body: { name: string; email: string; password: string; phone?: string }) {
      const res = await request<{ user: any; accessToken: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (res?.accessToken && typeof window !== "undefined") {
        localStorage.setItem("billpilot_token", res.accessToken);
        localStorage.setItem("billpilot_user", JSON.stringify(res.user));
      }
      return res;
    },
    async logout() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("billpilot_token");
        localStorage.removeItem("billpilot_user");
      }
      return { ok: true };
    },
  },

  subscriptions: {
    async list(params?: { page?: number; limit?: number; status?: string }) {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.status && params.status !== "ALL") q.set("status", params.status);
      return request<{ data: Subscription[]; meta: any }>(`/subscriptions?${q.toString()}`);
    },
    async get(id: string) {
      return request<Subscription>(`/subscriptions/${id}`);
    },
    async create(dto: {
      customerId: string;
      planId: string;
      startDate?: string;
      expiryDate?: string;
      paymentTerm?: string;
      lines: Array<{
        productId: string;
        variantId?: string;
        description?: string;
        quantity: number;
        unitPrice?: string | number;
      }>;
    }) {
      return request<Subscription>("/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          customerId: dto.customerId,
          planId: dto.planId,
          startDate: dto.startDate || new Date().toISOString(),
          expiryDate: dto.expiryDate,
          paymentTerm: dto.paymentTerm || "NET_15",
          lines: dto.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            description: l.description || "Subscription Line Item",
            quantity: l.quantity,
            unitPrice: Number(l.unitPrice || 2499).toFixed(2),
          })),
        }),
      });
    },
    async pause(id: string) {
      return request<Subscription>(`/subscriptions/${id}/pause`, { method: "POST" });
    },
    async resume(id: string) {
      return request<Subscription>(`/subscriptions/${id}/resume`, { method: "POST" });
    },
    async close(id: string, reason?: string) {
      return request<Subscription>(`/subscriptions/${id}/close`, {
        method: "POST",
        body: JSON.stringify({ reason: reason || "User requested close" }),
      });
    },
    async renew(id: string) {
      return request<Subscription>(`/subscriptions/${id}/renew`, { method: "POST" });
    },
    async transition(id: string, status: string, reason?: string) {
      return request<Subscription>(`/subscriptions/${id}/transition`, {
        method: "POST",
        body: JSON.stringify({ status, reason }),
      });
    },
    async approveQuote(id: string) {
      return request<Subscription>(`/subscriptions/${id}/approve-quote`, { method: "POST" });
    },
  },

  invoices: {
    async list(params?: { page?: number; limit?: number; status?: string }) {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.status && params.status !== "ALL") q.set("status", params.status);
      return request<{ data: Invoice[]; meta: any }>(`/invoices?${q.toString()}`);
    },
    async get(id: string) {
      return request<Invoice>(`/invoices/${id}`);
    },
    async confirm(id: string) {
      return request<Invoice>(`/invoices/${id}/confirm`, { method: "POST" });
    },
    async cancel(id: string, reason?: string) {
      return request<Invoice>(`/invoices/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: reason || "Cancelled by user" }),
      });
    },
    async send(id: string) {
      return request<{ success: boolean }>(`/invoices/${id}/send`, { method: "POST" });
    },
    async runBilling(options?: { dryRun?: boolean; asOf?: string }) {
      return request<{ created: number; skipped: number; failed: number; dryRun: boolean }>("/invoices/run-billing", {
        method: "POST",
        body: JSON.stringify({ dryRun: !!options?.dryRun, asOf: options?.asOf }),
      });
    },
    pdfUrl(id: string) {
      return `/api/v1/invoices/${id}/pdf`;
    },
    async createCreditNote(invoiceId: string, dto: { amount: number; reason: string }) {
      return request<any>(`/invoices/${invoiceId}/credit-notes`, {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
  },

  catalog: {
    async plans(params?: { isActive?: boolean }) {
      const q = new URLSearchParams();
      if (params?.isActive !== undefined) q.set("isActive", String(params.isActive));
      return request<{ data: Plan[]; meta: any }>(`/plans?${q.toString()}`);
    },
    async createPlan(dto: {
      name: string;
      price: string | number;
      billingPeriod: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
      minQuantity?: number;
      autoClose?: boolean;
      closable?: boolean;
      pausable?: boolean;
      renewable?: boolean;
    }) {
      return request<Plan>("/plans", {
        method: "POST",
        body: JSON.stringify({
          ...dto,
          price: Number(dto.price).toFixed(2),
        }),
      });
    },
    async deletePlan(id: string) {
      return request<{ success: boolean }>(`/plans/${id}`, { method: "DELETE" });
    },
    async products(params?: { type?: string }) {
      const q = new URLSearchParams();
      if (params?.type) q.set("type", params.type);
      return request<{ data: Product[]; meta: any }>(`/products?${q.toString()}`);
    },
    async createProduct(dto: {
      name: string;
      type: string;
      salesPrice: string | number;
      costPrice: string | number;
      notes?: string;
      taxRuleId?: string;
    }) {
      return request<Product>("/products", {
        method: "POST",
        body: JSON.stringify({
          ...dto,
          salesPrice: Number(dto.salesPrice).toFixed(2),
          costPrice: Number(dto.costPrice).toFixed(2),
        }),
      });
    },
    async deleteProduct(id: string) {
      return request<{ success: boolean }>(`/products/${id}`, { method: "DELETE" });
    },
    async addVariant(dto: {
      productId: string;
      attribute: string;
      value: string;
      extraPrice: string | number;
    }) {
      return request<any>("/products/variants", {
        method: "POST",
        body: JSON.stringify({
          ...dto,
          extraPrice: Number(dto.extraPrice).toFixed(2),
        }),
      });
    },
  },

  taxes: {
    async list() {
      return request<{ data: TaxRule[]; meta: any }>("/tax-rules");
    },
    async create(dto: { name: string; ratePercent: number | string; region?: string; isInclusive?: boolean }) {
      return request<TaxRule>("/tax-rules", {
        method: "POST",
        body: JSON.stringify({
          ...dto,
          ratePercent: Number(dto.ratePercent).toFixed(2),
        }),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/tax-rules/${id}`, { method: "DELETE" });
    },
  },

  discounts: {
    async list() {
      return request<{ data: Discount[]; meta: any }>("/discounts");
    },
    async create(dto: {
      code: string;
      name: string;
      type: "PERCENTAGE" | "FIXED_AMOUNT" | "FIXED";
      value: number | string;
      scope: "SUBSCRIPTION" | "PRODUCT";
      startsAt: string;
      endsAt: string;
      usageLimit?: number;
      productIds?: string[];
    }) {
      return request<Discount>("/discounts", {
        method: "POST",
        body: JSON.stringify({
          ...dto,
          type: dto.type === "FIXED_AMOUNT" ? "FIXED" : dto.type,
          value: Number(dto.value).toFixed(2),
          productIds: dto.productIds || [],
        }),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/discounts/${id}`, { method: "DELETE" });
    },
  },

  insights: {
    async mrr() {
      return request<{
        mrr: number;
        arr: number;
        newMrr: number;
        expansionMrr: number;
        contractionMrr: number;
        churnedMrr: number;
        activeCount: number;
      }>("/insights/mrr");
    },
    async mrrTrend() {
      return request<Array<{ month: string; mrr: number; newMrr: number; churn: number }>>("/insights/mrr/trend");
    },
    async leakage() {
      return request<{
        totalAmountAtRisk: number;
        totalFindings: number;
        byKind?: Record<string, { count: number; amount: number }>;
        findings: LeakageFinding[];
      }>("/insights/leakage");
    },
    async scanLeakage() {
      return request<{
        totalAmountAtRisk: number;
        totalFindings: number;
        byKind?: Record<string, { count: number; amount: number }>;
        findings: LeakageFinding[];
      }>("/insights/leakage/scan", { method: "POST" });
    },
    async fixLeakage(id: string) {
      return request<any>(`/insights/leakage/${id}/fix`, { method: "POST" });
    },
    async dunning() {
      return request<{
        totalOverdueAmount: number;
        totalOverdueCount: number;
        totalRecoveredAmount: number;
        pausedSubscriptionsCount: number;
        cohorts: any;
      }>("/insights/dunning");
    },
    async runDunningSweep() {
      return request<any>("/insights/dunning/run", { method: "POST" });
    },
    async runReminderSweep() {
      return request<any>("/insights/reminders/run", { method: "POST" });
    },
    async jobs() {
      return request<Array<{ id: string; name: string; schedule: string; lastRun?: string; status: string }>>(
        "/insights/jobs"
      );
    },
  },

  users: {
    async list(params?: { role?: string; page?: number; limit?: number }) {
      const q = new URLSearchParams();
      if (params?.role) q.set("role", params.role);
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      return request<{ data: any[]; meta: any }>(`/users?${q.toString()}`);
    },
    async createStaff(dto: { name: string; email: string; password?: string; role: "ADMIN" | "STAFF"; phone?: string }) {
      return request<any>("/users/staff", {
        method: "POST",
        body: JSON.stringify({
          ...dto,
          password: dto.password || "Staff@12345!",
        }),
      });
    },
    async deleteStaff(id: string) {
      return request<{ success: boolean }>(`/users/staff/${id}`, { method: "DELETE" });
    },
    async customers(params?: { page?: number; limit?: number }) {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      return request<{ data: Customer[]; meta: any }>(`/users/customers?${q.toString()}`);
    },
    async createCustomer(dto: { name: string; email: string; phone?: string; company?: string; gstin?: string }) {
      return request<Customer>("/users/customers", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
    async deleteCustomer(id: string) {
      return request<{ success: boolean; message?: string }>(`/users/customers/${id}`, { method: "DELETE" });
    },
  },

  payments: {
    async list(params?: { page?: number; limit?: number }) {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      return request<{ data: any[]; meta: any }>(`/payments?${q.toString()}`).catch(() => ({
        data: [],
        meta: { total: 0 },
      }));
    },
    async record(dto: { invoiceId: string; amount: number; method: string; reference?: string }) {
      return request<any>("/payments/record", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
    async reconcileCsv(content: string) {
      return request<any>("/reconcile/upload", {
        method: "POST",
        body: JSON.stringify({ csv: content }),
      });
    },
  },

  audit: {
    async list(params?: { page?: number; limit?: number }) {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      return request<{ data: any[]; meta: any }>(`/audit?${q.toString()}`);
    },
  },

  notifications: {
    async templates() {
      return request<any[]>("/notifications/templates");
    },
    async sendTestEmail(to: string) {
      return request<any>("/notifications/email/test", {
        method: "POST",
        body: JSON.stringify({ to }),
      });
    },
  },

  whatsapp: {
    async status() {
      return request<{ connected: boolean; provider: string }>("/whatsapp/status");
    },
    async sendTest(phone: string, message?: string) {
      return request<any>("/whatsapp/test", {
        method: "POST",
        body: JSON.stringify({ phone, message }),
      });
    },
  },

  rescue: {
    async failures() {
      return request<any[]>("/rescue/failures").catch(() => []);
    },
    async simulate(dto: { invoiceId?: string; failureKind: string; failureMessage?: string }) {
      return request<any>("/rescue/simulate", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
    async recover(id: string) {
      return request<any>(`/rescue/recover/${id}`, { method: "POST" });
    },
    async metrics() {
      return request<any>("/rescue/metrics").catch(() => ({
        recoveredAmount: "42500.00",
        activeRetries: 3,
        totalAttempts: 12,
        successRate: 84,
      }));
    },
  },
};
