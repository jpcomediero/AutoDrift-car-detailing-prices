"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TableProperties,
  Layers,
  Sparkles,
  Car,
  Clock,
  ArrowRight,
  TrendingUp,
  History,
  ShieldAlert,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface DashboardStats {
  serviceCount: number;
  comboCount: number;
  sizeCount: number;
  lastUpdated: string;
  recentHistory: {
    id: string;
    itemType: string;
    itemName: string;
    carSizeName: string;
    oldPrice: number;
    newPrice: number;
    changedBy: string;
    changedAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [priceRes, historyRes] = await Promise.all([
        fetch("/api/admin/prices"),
        fetch("/api/admin/price-history"),
      ]);

      const priceData = await priceRes.json();
      const historyData = await historyRes.json();

      setStats({
        serviceCount: priceData.services?.length || 0,
        comboCount: priceData.combos?.length || 0,
        sizeCount: priceData.sizes?.length || 0,
        lastUpdated: priceData.lastUpdated || new Date().toISOString(),
        recentHistory: Array.isArray(historyData) ? historyData.slice(0, 5) : [],
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Welcome & Last Updated Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pricing Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time management for AutoDrift detailing packages, car sizes, and live prices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block font-medium">Prices Last Updated</span>
              <span className="text-cyan-300 font-bold">
                {stats?.lastUpdated ? formatDate(stats.lastUpdated) : "Live Database"}
              </span>
            </div>
          </div>

          <button
            onClick={loadDashboard}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh dashboard stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Services */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Services
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {stats?.serviceCount ?? "—"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Individual treatments available</p>
        </div>

        {/* Metric 2: Combos */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Combo Packages
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {stats?.comboCount ?? "—"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Bundled discount offerings</p>
        </div>

        {/* Metric 3: Car Sizes */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Car Sizes
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {stats?.sizeCount ?? "—"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Categories (Small to XXL+)</p>
        </div>

        {/* Metric 4: Real-time Sync Status */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Live Sync
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Instant Live
          </div>
          <p className="text-xs text-slate-500 mt-1">Zero redeployments needed</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Management Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/prices"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TableProperties className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-cyan-300 text-base mb-1 flex items-center justify-between">
              <span>Price Matrix Editor</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Edit pricing across all sizes inline, configure promo sales, and save changes instantly.
            </p>
          </Link>

          <Link
            href="/admin/services"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-cyan-300 text-base mb-1 flex items-center justify-between">
              <span>Services Management</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add services, reorder which top 5 show publicly, edit durations and &ldquo;What&apos;s included&rdquo;.
            </p>
          </Link>

          <Link
            href="/admin/combos"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-amber-300 text-base mb-1 flex items-center justify-between">
              <span>Combo Package Builder</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select bundled treatments with auto-computed regular total and customer savings per car size.
            </p>
          </Link>

          <Link
            href="/admin/sizes"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-indigo-300 text-base mb-1 flex items-center justify-between">
              <span>Manage Car Sizes</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload size guide images to Supabase Storage, update vehicle examples, or add new sizes.
            </p>
          </Link>

          <Link
            href="/admin/history"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-purple-300 text-base mb-1 flex items-center justify-between">
              <span>Price History Log</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect comprehensive audit trails tracking who changed which price and when.
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-emerald-300 text-base mb-1 flex items-center justify-between">
              <span>Analytics &amp; Popularity</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review most chosen sizes, most selected treatments, and package popularity breakdown.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Price Changes History Snippet */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white text-base">Recent Price Adjustments</h2>
          </div>
          <Link
            href="/admin/history"
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            View all history &rarr;
          </Link>
        </div>

        {stats?.recentHistory && stats.recentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Previous Price</th>
                  <th className="py-2.5 px-3">New Price</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recentHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{h.itemName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {h.itemType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 font-medium">{h.carSizeName}</td>
                    <td className="py-2.5 px-3 text-slate-400 line-through">
                      {formatCurrency(h.oldPrice)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {formatCurrency(h.newPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{h.changedBy}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {formatDate(h.changedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4">
            No price change records logged yet. Edit prices in the Price Matrix to generate logs.
          </p>
        )}
      </div>
    </div>
  );
}
