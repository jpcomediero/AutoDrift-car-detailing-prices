"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown, Car, Sparkles, AlertCircle, Trash2 } from "lucide-react";
import { CarSizeType } from "@/types";
import { formatCurrency, formatDuration } from "@/lib/utils";

export interface SelectedQuoteItem {
  id: string;
  name: string;
  type: "service" | "combo";
  price: number;
  originalPrice?: number;
  durationMinutes?: number;
}

interface QuoteSummaryProps {
  selectedSize: CarSizeType | null;
  carName: string;
  items: SelectedQuoteItem[];
  onRemoveItem?: (id: string) => void;
  onClearAll?: () => void;
}

export function QuoteSummary({
  selectedSize,
  carName,
  items,
  onRemoveItem,
  onClearAll,
}: QuoteSummaryProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalOriginalPrice = items.reduce(
    (sum, item) => sum + (item.originalPrice || item.price),
    0
  );
  const totalSavings = Math.max(0, totalOriginalPrice - totalPrice);
  const totalMinutes = items.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);

  // Content block shared between desktop panel and mobile sheet
  const Content = (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-extrabold text-white text-base tracking-tight">
              Live Quote Summary
            </h3>
          </div>
          {items.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Selected Vehicle Badge */}
        {selectedSize ? (
          <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{selectedSize.name}</span>
                {carName && (
                  <span className="text-slate-400 font-normal truncate">
                    &bull; {carName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {selectedSize.examples}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No size selected yet</p>
        )}
      </div>

      {/* Itemized Services / Combos */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[140px] max-h-[300px]">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No services or package chosen yet.
            <br />
            Select an option to calculate your quote.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-2 text-xs p-2 rounded-lg bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-200 truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="capitalize">{item.type}</span>
                  {item.durationMinutes && item.durationMinutes > 0 ? (
                    <span>&bull; {formatDuration(item.durationMinutes)}</span>
                  ) : null}
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <div className="text-[10px] text-slate-500 line-through">
                      {formatCurrency(item.originalPrice)}
                    </div>
                  )}
                  <div className="font-bold text-cyan-400">
                    {formatCurrency(item.price)}
                  </div>
                </div>

                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals & Breakdown */}
      <div className="pt-3 border-t border-slate-800 mt-auto">
        {totalSavings > 0 && (
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span>Special Savings:</span>
            <span>-{formatCurrency(totalSavings)}</span>
          </div>
        )}

        {totalMinutes > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Estimated Duration:</span>
            <span>{formatDuration(totalMinutes)}</span>
          </div>
        )}

        <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/60">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Total Estimate
          </span>
          <span className="text-2xl font-black text-cyan-400 tracking-tight">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-start gap-1.5 text-[11px] text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Prices may vary depending on the vehicle&apos;s condition.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP SIDE PANEL (Hidden on mobile, sticky on lg screens) */}
      {/* ============================================================ */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-20 glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
          {Content}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE STICKY BOTTOM SHEET (Visible on < lg screens) */}
      {/* ============================================================ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1322]/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl">
        {/* Minimized Bar */}
        <div
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="px-4 py-3 flex items-center justify-between cursor-pointer active:bg-slate-800/40"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <span className="text-xs text-slate-400">Estimated Total: </span>
              <span className="text-base font-extrabold text-cyan-400">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            {items.length > 0 && (
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {items.length} item{items.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/30"
          >
            <span>{isMobileExpanded ? "Hide Details" : "View Quote"}</span>
            {isMobileExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Expanded Sheet Content */}
        {isMobileExpanded && (
          <div className="px-4 pb-6 pt-2 border-t border-slate-800/60 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom-2 duration-200">
            {Content}
          </div>
        )}
      </div>
    </>
  );
}
