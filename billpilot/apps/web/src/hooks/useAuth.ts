'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearAuth, type StoredUser } from '@/lib/auth';

export function useAuth(requiredRole?: 'ADMIN' | 'STAFF') {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.replace('/login');
      return;
    }
    if (requiredRole === 'ADMIN' && u.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }
    if (requiredRole === 'STAFF' && u.role === 'CUSTOMER') {
      router.replace('/my/subscriptions');
      return;
    }
    setUser(u);
    setLoading(false);
  }, [router, requiredRole]);

  function logout() {
    clearAuth();
    router.replace('/login');
  }

  return { user, loading, logout };
}
