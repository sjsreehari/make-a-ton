export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export function saveAuth(token: string, user: StoredUser): void {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

export function getStoredUser(): StoredUser | null {
  try {
    const u = localStorage.getItem('user');
    return u ? (JSON.parse(u) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function isAdmin(user: StoredUser | null): boolean {
  return user?.role === 'ADMIN';
}

export function isStaff(user: StoredUser | null): boolean {
  return user?.role === 'STAFF' || user?.role === 'ADMIN';
}
