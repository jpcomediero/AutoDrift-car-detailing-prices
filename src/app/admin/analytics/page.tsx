"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Car,
  Eye,
  CheckCircle2,
  RefreshCw,
  Flame,
} from "lucide-react";

interface AnalyticsResponse {
  range: string;
  totalEvents: number;
  totalViews: number;
  totalSelections: number;
  topServices: { id: string; name: string; count: number }[];
  topCombos: { id: string; name: string; count: number }[];
  topSizes: { id: string; name: string; count: number }[];
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>Customer Demand &amp; Popularity Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Anonymous real-time insights into most selected detailing treatments and popular vehicle sizes.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setRange("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              range === "7d"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange("30d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              range === "30d"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setRange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              range === "all"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Interactions</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{data?.totalEvents ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Logged anonymous events</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Calculator Views</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-400">{data?.totalViews ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Quote builder sessions</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Item Selections</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {data?.totalSelections ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Services &amp; combos picked</p>
        </div>
      </div>

      {/* Visual Bar Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Most Selected Services */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white text-base">Most Selected Services</h2>
          </div>

          <div className="space-y-3.5">
            {data?.topServices && data.topServices.length > 0 ? (
              data.topServices.map((item, idx) => {
                const max = data.topServices[0]?.count || 1;
                const pct = Math.max(8, Math.round((item.count / max) * 100));

                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate max-w-xs">
                        #{idx + 1} {item.name}
                      </span>
                      <span className="font-bold text-cyan-400 shrink-0 ml-2">
                        {item.count} selection{item.count === 1 ? "" : "s"}
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No service selection data in this time window yet.
              </p>
            )}
          </div>
        </div>

        {/* Chart 2: Most Viewed / Selected Combos */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-white text-base">Most Popular Combos</h2>
          </div>

          <div className="space-y-3.5">
            {data?.topCombos && data.topCombos.length > 0 ? (
              data.topCombos.map((item, idx) => {
                const max = data.topCombos[0]?.count || 1;
                const pct = Math.max(8, Math.round((item.count / max) * 100));

                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate max-w-xs">
                        #{idx + 1} {item.name}
                      </span>
                      <span className="font-bold text-amber-400 shrink-0 ml-2">
                        {item.count} selection{item.count === 1 ? "" : "s"}
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No combo selection data in this time window yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Most Chosen Car Sizes */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-4 h-4 text-indigo-400" />
          <h2 className="font-bold text-white text-base">Vehicle Size Distribution</h2>
        </div>

        <div className="space-y-3.5">
          {data?.topSizes && data.topSizes.length > 0 ? (
            data.topSizes.map((item, idx) => {
              const max = data.topSizes[0]?.count || 1;
              const pct = Math.max(8, Math.round((item.count / max) * 100));

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      Tier {idx + 1} &bull; {item.name}
                    </span>
                    <span className="font-bold text-indigo-400">
                      {item.count} car{item.count === 1 ? "" : "s"}
                    </span>
                  </div>
                  {/* Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              No vehicle size selections recorded in this period yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
