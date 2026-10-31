'use client';

import { useState, useEffect } from 'react';
import type { UserSession } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('billpilot_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: UserSession, token: string) => {
    localStorage.setItem('billpilot_user', JSON.stringify(userData));
    localStorage.setItem('billpilot_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('billpilot_user');
    localStorage.removeItem('billpilot_token');
    setUser(null);
  };

  return { user, isLoading, login, logout, isAuthenticated: !!user };
}
