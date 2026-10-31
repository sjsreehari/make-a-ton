"use client";

import { useState } from "react";
import {
  Users,
  Building,
  KeyRound,
  CheckCircle2,
  Shield,
  Plus,
  Radio,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  status: "ACTIVE" | "DEACTIVATED";
}

const INITIAL_STAFF: StaffMember[] = [
  { id: "usr-1", name: "Super Admin", email: "admin@brightloop.test", role: "ADMIN", status: "ACTIVE" },
  { id: "usr-2", name: "Staff Operations", email: "staff@brightloop.test", role: "STAFF", status: "ACTIVE" },
  { id: "usr-3", name: "Rohan Sharma (Customer)", email: "cust1@brightloop.test", role: "CUSTOMER", status: "ACTIVE" },
];

export default function SettingsPage() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [notice, setNotice] = useState<string | null>(null);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail || !newStaffName) return;

    const created: StaffMember = {
      id: `usr-${Date.now()}`,
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      status: "ACTIVE",
    };
    setStaff([...staff, created]);
    setNewStaffName("");
    setNewStaffEmail("");
    setNotice(`New staff member ${created.name} (${created.role}) created successfully!`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization & Staff Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer staff roles, GST billing credentials, and integration endpoints.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Staff Management (Admin Only) [REQ 1.5] */}
      <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-foreground">Staff & User Management</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Admin Access Only
          </span>
        </div>

        {/* Create Staff Form */}
        <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-muted-foreground block mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Aditi Rao"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-foreground"
            />
          </div>
          <div>
            <label className="text-muted-foreground block mb-1">Work Email</label>
            <input
              type="email"
              placeholder="aditi@brightloop.test"
              value={newStaffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-foreground"
            />
          </div>
          <div>
            <label className="text-muted-foreground block mb-1">Assigned Role</label>
            <select
              value={newStaffRole}
              onChange={(e) => setNewStaffRole(e.target.value as "ADMIN" | "STAFF")}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-foreground font-medium"
            >
              <option value="STAFF">STAFF (Quotes, Invoices, Subs)</option>
              <option value="ADMIN">ADMIN (Full Permissions)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              + Create Staff
            </button>
          </div>
        </form>

        {/* Staff Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-muted/30">
                <th className="py-2.5 px-4 font-medium">Name</th>
                <th className="py-2.5 px-4 font-medium">Email</th>
                <th className="py-2.5 px-4 font-medium">Role</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-foreground">{s.name}</td>
                  <td className="py-2.5 px-4 font-mono text-zinc-300">{s.email}</td>
                  <td className="py-2.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {s.role !== "ADMIN" && (
                      <button
                        onClick={() => {
                          setStaff(staff.filter((m) => m.id !== s.id));
                        }}
                        className="text-red-400 hover:underline text-[11px]"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization GSTIN & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <Building className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-foreground">Company Entity & GSTIN</h3>
          </div>
          <div className="space-y-2 font-mono">
            <div>
              <span className="text-muted-foreground block text-[11px]">Legal Entity</span>
              <p className="text-foreground font-medium">Brightloop Software Private Limited</p>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">GSTIN Number</span>
              <p className="text-indigo-400 font-bold">29ABCDE1234F1Z5</p>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Base Currency & Country</span>
              <p className="text-foreground">INR (₹) · India</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-foreground">Integration Endpoints</h3>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
              <span>Razorpay Webhook:</span>
              <span className="font-mono text-emerald-400">/api/v1/webhooks/razorpay</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
              <span>Twilio WhatsApp Webhook:</span>
              <span className="font-mono text-emerald-400">/api/v1/webhooks/twilio/whatsapp</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
              <span>Anthropic AI Engine:</span>
              <span className="font-mono text-indigo-400">claude-sonnet-4-5 active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
