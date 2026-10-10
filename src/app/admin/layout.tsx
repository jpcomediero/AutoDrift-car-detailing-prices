"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TableProperties,
  Sparkles,
  Layers,
  Car,
  History,
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { ToastProvider } from "@/components/admin/ToastContext";
import { BrandLogo } from "@/components/common/BrandLogo";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/prices", label: "Price Matrix", icon: TableProperties },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/combos", label: "Combos", icon: Sparkles },
  { href: "/admin/sizes", label: "Car Sizes", icon: Car },
  { href: "/admin/history", label: "Price History", icon: History },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render children without sidebar shell
  if (pathname === "/admin/login") {
    return <ToastProvider>{children}</ToastProvider>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row">
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR                                                */}
      {/* ============================================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-black border-r border-zinc-900 p-5 shrink-0 min-h-screen">
        {/* Brand */}
        <div className="mb-8 px-2">
          <BrandLogo
            showIcon={false}
            showBadge={true}
            badgeText="ADMIN PANEL"
          />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-red-600/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-red-400" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-900 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Calculator</span>
            </span>
            <span className="text-[10px] text-red-400 font-bold">Live &rarr;</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE TOP BAR & DRAWER                                        */}
      {/* ============================================================== */}
      <div className="md:hidden bg-black border-b border-zinc-900 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <BrandLogo
          showIcon={false}
          showBadge={false}
          logoClassName="h-7 w-auto"
        />

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-b border-zinc-900 p-4 space-y-2 animate-in slide-in-from-top-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? "bg-red-600/20 text-red-400 border border-red-500/40"
                    : "text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4 text-red-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Calculator</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN ADMIN CONTENT WRAPPER                                     */}
      {/* ============================================================== */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
    </ToastProvider>
  );
}
