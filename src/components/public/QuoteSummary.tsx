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
      <div className="pb-4 border-b border-zinc-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h3 className="font-extrabold text-white text-base tracking-tight">
              Live Quote Summary
            </h3>
          </div>
          {items.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-zinc-400 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Selected Vehicle Badge */}
        {selectedSize ? (
          <div className="bg-black/80 rounded-xl p-2.5 border border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{selectedSize.name}</span>
                {carName && (
                  <span className="text-zinc-400 font-normal truncate">
                    &bull; {carName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {selectedSize.examples}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">No size selected yet</p>
        )}
      </div>

      {/* Itemized Services / Combos */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[140px] max-h-[300px]">
        {items.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No services or package chosen yet.
            <br />
            Select an option to calculate your quote.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-2 text-xs p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800/60 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-zinc-200 truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                  <span className="capitalize">{item.type}</span>
                  {item.durationMinutes && item.durationMinutes > 0 ? (
                    <span>&bull; {formatDuration(item.durationMinutes)}</span>
                  ) : null}
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <div className="text-[10px] text-zinc-500 line-through">
                      {formatCurrency(item.originalPrice)}
                    </div>
                  )}
                  <div className="font-bold text-red-400">
                    {formatCurrency(item.price)}
                  </div>
                </div>

                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-zinc-500 hover:text-red-400 p-0.5 rounded transition-colors"
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
      <div className="pt-3 border-t border-zinc-800 mt-auto">
        {totalSavings > 0 && (
          <div className="flex items-center justify-between text-xs text-red-400 font-bold mb-1">
            <span>Special Savings:</span>
            <span>-{formatCurrency(totalSavings)}</span>
          </div>
        )}

        {totalMinutes > 0 && (
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Estimated Duration:</span>
            <span>{formatDuration(totalMinutes)}</span>
          </div>
        )}

        <div className="flex items-baseline justify-between pt-2 border-t border-zinc-800">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Total Estimate
          </span>
          <span className="text-2xl font-black text-red-500 tracking-tight">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-start gap-1.5 text-[11px] text-zinc-400">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
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
        <div className="sticky top-20 glass-panel rounded-2xl p-5 border border-zinc-800 shadow-xl">
          {Content}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE STICKY BOTTOM SHEET (Visible on < lg screens) */}
      {/* ============================================================ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-zinc-800 shadow-2xl">
        {/* Minimized Bar */}
        <div
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="px-4 py-3 flex items-center justify-between cursor-pointer active:bg-zinc-800/40"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div>
              <span className="text-xs text-zinc-400">Estimated Total: </span>
              <span className="text-base font-extrabold text-red-500">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            {items.length > 0 && (
              <span className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                {items.length} item{items.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
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
          <div className="px-4 pb-6 pt-2 border-t border-zinc-800 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom-2 duration-200">
            {Content}
          </div>
        )}
      </div>
    </>
  );
}
