import { TooltipProvider } from "@/components/molecules/Tooltip";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BillPilot — Automated Subscription Management",
  description: "Subscription lifecycle, automated invoicing, payments, and AI finance operations for Brightloop Software",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="h-screen overflow-hidden font-sans antialiased bg-background text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
