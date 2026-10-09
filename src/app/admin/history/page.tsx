"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface HistoryRecord {
  id: string;
  itemType: "SERVICE" | "COMBO";
  itemId: string;
  itemName: string;
  carSizeId: string;
  carSizeName: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedAt: string;
}

export default function PriceHistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "SERVICE" | "COMBO">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      const url =
        filterType === "ALL"
          ? "/api/admin/price-history"
          : `/api/admin/price-history?itemType=${filterType}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading price history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filterType]);

  const filteredHistory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return history;

    return history.filter(
      (h) =>
        h.itemName.toLowerCase().includes(q) ||
        h.carSizeName.toLowerCase().includes(q) ||
        h.changedBy.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-purple-400" />
            <span>Price Change Audit History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete immutable log of all price updates across individual services and combos.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh history"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Toolbar: Filter pills and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === "ALL"
                ? "bg-purple-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Changes ({history.length})
          </button>
          <button
            onClick={() => setFilterType("SERVICE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === "SERVICE"
                ? "bg-purple-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Services Only
          </button>
          <button
            onClick={() => setFilterType("COMBO")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === "COMBO"
                ? "bg-purple-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Combos Only
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item, size, admin..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-purple-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0b101d] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-3">Car Size</th>
                <th className="py-3 px-4 text-right">Price Change</th>
                <th className="py-3 px-4 text-right">Admin User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 italic">
                    No price history entries recorded yet.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => {
                  const isIncrease = rec.newPrice > rec.oldPrice;
                  const delta = rec.newPrice - rec.oldPrice;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(rec.changedAt)}</span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            rec.itemType === "SERVICE"
                              ? "bg-cyan-950/80 text-cyan-400 border border-cyan-500/30"
                              : "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {rec.itemType}
                        </span>
                      </td>

                      {/* Item Name */}
                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                        {rec.itemName}
                      </td>

                      {/* Car Size */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                          {rec.carSizeName}
                        </span>
                      </td>

                      {/* Price Transition */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-slate-500 line-through">
                            {formatCurrency(rec.oldPrice)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="font-black text-white text-sm">
                            {formatCurrency(rec.newPrice)}
                          </span>

                          {rec.oldPrice > 0 && (
                            <span
                              className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isIncrease
                                  ? "bg-red-950/60 text-red-400 border border-red-500/30"
                                  : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {isIncrease ? (
                                <TrendingUp className="w-2.5 h-2.5" />
                              ) : (
                                <TrendingDown className="w-2.5 h-2.5" />
                              )}
                              <span>
                                {isIncrease ? "+" : ""}
                                {formatCurrency(delta)}
                              </span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Admin User */}
                      <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{rec.changedBy}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
