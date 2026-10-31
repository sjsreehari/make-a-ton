export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
}

export interface MetricSummary {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
}

