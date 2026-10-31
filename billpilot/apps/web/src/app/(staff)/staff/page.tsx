import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StaffManagementPage() {
  const staff = [
    { name: 'Brightloop Administrator', email: 'admin@brightloop.test', role: 'ADMIN', status: 'ACTIVE' },
    { name: 'Operations Staff', email: 'staff@brightloop.test', role: 'STAFF', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Staff Members</h1>
      <Card>
        <CardHeader>
          <CardTitle>Team Permissions</CardTitle>
          <CardDescription>Internal operators and role-based access control</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {staff.map((s) => (
              <div key={s.email} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{s.role}</Badge>
                  <Badge variant="success">{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
