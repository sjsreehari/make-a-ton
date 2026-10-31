"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building,
  KeyRound,
  CheckCircle2,
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";
import { api, Customer } from "@/lib/api";

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // New Staff Form
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"ADMIN" | "STAFF">("STAFF");

  // New Customer Form
  const [showCustModal, setShowCustModal] = useState(false);
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("+91 98765 43210");
  const [custCompany, setCustCompany] = useState("");
  const [custGstin, setCustGstin] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, cRes] = await Promise.all([
        api.users.list({ limit: 50 }),
        api.users.customers({ limit: 50 }),
      ]);
      setUsers(uRes.data || []);
      setCustomers(cRes.data || []);
    } catch (err: any) {
      console.error("Failed to load users from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail || !newStaffName) return;

    try {
      await api.users.createStaff({
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole,
      });

      setNewStaffName("");
      setNewStaffEmail("");
      setNotice(`New staff member ${newStaffName} (${newStaffRole}) saved in MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to create staff member in MySQL");
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Remove or deactivate staff member "${name}"?`)) return;
    try {
      await api.users.deleteStaff(id);
      setNotice(`Staff member "${name}" removed/deactivated in MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete staff member");
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail) return;

    try {
      await api.users.createCustomer({
        name: custName,
        email: custEmail,
        phone: custPhone,
        company: custCompany,
        gstin: custGstin,
      });

      setShowCustModal(false);
      setCustName("");
      setCustEmail("");
      setCustCompany("");
      setCustGstin("");
      setNotice(`Customer "${custName}" created in MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to create customer in MySQL");
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Delete customer profile "${name}"?`)) return;
    try {
      const res = await api.users.deleteCustomer(id);
      if (!res.success) {
        alert(res.message || "Cannot delete customer with active records");
        return;
      }
      setNotice(`Customer "${name}" removed from MySQL!`);
      await fetchData();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete customer");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization & Staff Settings</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MySQL Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer staff roles, customer profiles, GST billing credentials, and integration endpoints.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh MySQL Data
        </button>
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
        <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <input
            type="text"
            placeholder="Full Name"
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
            required
            className="px-3 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="email@brightloop.test"
            value={newStaffEmail}
            onChange={(e) => setNewStaffEmail(e.target.value)}
            required
            className="px-3 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={newStaffRole}
            onChange={(e) => setNewStaffRole(e.target.value as any)}
            className="px-3 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="STAFF">Staff (Quotes, Invoices)</option>
            <option value="ADMIN">Admin (Full Access)</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Plus className="size-3.5" />
            Create Staff in MySQL
          </button>
        </form>

        {/* Staff Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-muted/30">
                <th className="py-2.5 px-3 font-medium">Name</th>
                <th className="py-2.5 px-3 font-medium">Email</th>
                <th className="py-2.5 px-3 font-medium">Role</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2 px-3 font-medium text-foreground">{u.name}</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono">{u.email}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                        u.role === "ADMIN"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : u.role === "STAFF"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10">
                      {u.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleDeleteStaff(u.id, u.name)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Deactivate staff"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profiles Management */}
      <div className="p-5 rounded-xl border border-border bg-card/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Building className="size-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground">Customer Profiles in MySQL ({customers.length})</h2>
          </div>
          <button
            onClick={() => setShowCustModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <Plus className="size-3.5" />
            New Customer
          </button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-muted/30">
                <th className="py-2.5 px-3 font-medium">Customer Name</th>
                <th className="py-2.5 px-3 font-medium">Company</th>
                <th className="py-2.5 px-3 font-medium">Email</th>
                <th className="py-2.5 px-3 font-medium">Credit Balance</th>
                <th className="py-2.5 px-3 font-medium">Active Subs</th>
                <th className="py-2.5 px-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {customers.slice(0, 10).map((c) => (
                <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2 px-3 font-medium text-foreground">{c.name}</td>
                  <td className="py-2 px-3 text-zinc-300">{c.company || "Individual"}</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono">{c.email}</td>
                  <td className="py-2 px-3 font-mono text-emerald-400 font-bold">
                    ₹{Number(c.creditBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 font-mono text-indigo-400">{c.activeSubscriptionsCount} active</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleDeleteCustomer(c.id, c.name)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete customer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Customer */}
      {showCustModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground">Create Customer Profile (MySQL)</h3>
              <button onClick={() => setShowCustModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Mehta"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vikram@enterprise.test"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="Mehta Innovations"
                    value={custCompany}
                    onChange={(e) => setCustCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">GSTIN</label>
                  <input
                    type="text"
                    placeholder="27AABCU9603R1ZX"
                    value={custGstin}
                    onChange={(e) => setCustGstin(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Phone (WhatsApp enabled)</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
                  className="px-4 py-2 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Save to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
