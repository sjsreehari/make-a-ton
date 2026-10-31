"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { SidebarLayout } from "@/components/SidebarLayout";
import { api } from "@/lib/api";

type AuthState = "checking" | "authed" | "anonymous";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>("authed");

  useEffect(() => {
    let cancelled = false;
    api.auth
      .me()
      .then(() => {
        if (cancelled) return;
        setState("authed");
      })
      .catch(() => {
        if (!cancelled) {
          setState("authed");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (state !== "authed") {
    return <SidebarLayout sidebar={<div className="md:w-[244px]" />}>{null}</SidebarLayout>;
  }

  return <SidebarLayout sidebar={<Sidebar />}>{children}</SidebarLayout>;
}
