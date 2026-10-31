'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@brightloop.test');
  const [password, setPassword] = useState('Admin@12345!');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-filled credentials match seed accounts
    if (email === 'admin@brightloop.test' && password === 'Admin@12345!') {
      login(
        {
          id: 'user_admin_01',
          email,
          name: 'Brightloop Administrator',
          role: 'ADMIN',
        },
        'mock-jwt-token-admin'
      );
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Check README seed accounts.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-extrabold text-lg mb-2">
            BP
          </div>
          <CardTitle className="text-xl">Sign in to BillPilot</CardTitle>
          <CardDescription>Enter your account credentials to access the console</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brightloop.test"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Seed Accounts (Development):</p>
            <ul className="space-y-1 list-disc pl-4">
              <li><span className="font-mono">admin@brightloop.test</span> (Role: ADMIN)</li>
              <li><span className="font-mono">staff@brightloop.test</span> (Role: STAFF)</li>
              <li><span className="font-mono">cust1@brightloop.test</span> (Role: CUSTOMER)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
