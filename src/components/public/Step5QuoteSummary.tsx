"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  RotateCcw,
  Check,
  Flame,
  Trash2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CarSizeType } from "@/types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { SelectedQuoteItem } from "./QuoteSummary";

interface Step5QuoteSummaryProps {
  selectedSize: CarSizeType | null;
  carName: string;
  items: SelectedQuoteItem[];
  onRemoveItem: (id: string) => void;
  onModify: () => void;
  onStartOver: () => void;
}

export function Step5QuoteSummary({
  selectedSize,
  carName,
  items,
  onRemoveItem,
  onModify,
  onStartOver,
}: Step5QuoteSummaryProps) {
  const [copied, setCopied] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalOriginalPrice = items.reduce(
    (sum, item) => sum + (item.originalPrice || item.price),
    0
  );
  const totalSavings = Math.max(0, totalOriginalPrice - totalPrice);
  const totalMinutes = items.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);

  const handleCopyQuote = async () => {
    const lines = [
      "========================================",
      "🚗 AUTODRIFT PRECISION CAR DETAILING QUOTE",
      "========================================",
      `Vehicle: ${carName || "N/A"} (${selectedSize?.name || "Standard Size"})`,
      `Size Category: ${selectedSize?.name} - ${selectedSize?.examples || ""}`,
      "----------------------------------------",
      "SELECTED SERVICES & PACKAGES:",
      ...items.map(
        (it) => `• ${it.name} (${it.type.toUpperCase()}) - ${formatCurrency(it.price)}`
      ),
      "----------------------------------------",
      totalSavings > 0 ? `Special Savings: -${formatCurrency(totalSavings)}` : "",
      totalMinutes > 0 ? `Estimated Duration: ${formatDuration(totalMinutes)}` : "",
      `TOTAL ESTIMATE: ${formatCurrency(totalPrice)}`,
      "========================================",
      "Prices may vary depending on the vehicle's actual condition.",
      "Generated live via AutoDrift Quote Engine",
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Quote copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-red-600/10 text-red-500 border border-red-600/30 mb-2.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] uppercase tracking-wider">
          Step 5 of 5 &bull; Final Estimate
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Your Official Detailing Quote
        </h2>
        <p className="text-zinc-400 text-xs sm:text-base max-w-lg mx-auto mt-1.5 sm:mt-2 px-2">
          Review your customized detailing estimate below. Save, copy, or print your breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Left 2 Cols: Breakdown & Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Selected Vehicle Card */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-zinc-800">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-950/70 border border-red-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-0.5">
                  Vehicle Details
                </span>
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {carName || `${selectedSize?.name || "Vehicle"} Category`}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-xs text-zinc-400">
                  <span className="font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700 text-[11px]">
                    Tier {selectedSize?.sortOrder || "1"}: {selectedSize?.name}
                  </span>
                  <span className="text-xs text-zinc-400 leading-snug">{selectedSize?.examples}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Services / Packages Card */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 border border-zinc-800">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-white text-sm sm:text-base">Selected Treatments ({items.length})</h3>
              </div>
              <button
                onClick={onModify}
                className="text-xs text-red-400 hover:text-red-300 font-bold hover:underline"
              >
                + Modify Selections
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-sm">
                No treatments or packages selected.
                <button
                  onClick={onModify}
                  className="mt-3 block mx-auto text-xs text-red-400 font-bold hover:underline"
                >
                  Return to Step 4 to select services
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-black/70 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm sm:text-base">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-zinc-400 mt-0.5">
                          <span className="capitalize font-semibold text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">
                            {item.type}
                          </span>
                          {item.durationMinutes && item.durationMinutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-red-400" />
                              {formatDuration(item.durationMinutes)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-zinc-500 line-through block">
                            {formatCurrency(item.originalPrice)}
                          </span>
                        )}
                        <span className="text-base font-extrabold text-white">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                        title={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Price Summary Total & Actions Card */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-zinc-800 shadow-xl">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 pb-3 border-b border-zinc-800">
              Total Summary Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Items Selected:</span>
                <span className="font-bold text-white">{items.length} item{items.length === 1 ? "" : "s"}</span>
              </div>

              {totalMinutes > 0 && (
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Estimated Total Time:</span>
                  <span className="font-bold text-white">{formatDuration(totalMinutes)}</span>
                </div>
              )}

              {totalSavings > 0 && (
                <div className="flex items-center justify-between text-red-400 font-bold bg-red-950/40 p-2.5 rounded-xl border border-red-500/30">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-red-400" />
                    Special Package Savings:
                  </span>
                  <span>-{formatCurrency(totalSavings)}</span>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800 mt-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Estimated Grand Total
                </span>
                <div className="text-3xl sm:text-4xl font-black text-red-500 tracking-tight">
                  {formatCurrency(totalPrice)}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-5 p-3 rounded-xl bg-black/60 border border-zinc-800 flex items-start gap-2 text-[11px] text-zinc-400">
              <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Prices may vary depending on the vehicle&apos;s actual condition upon physical inspection.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5">
              <button
                onClick={handleCopyQuote}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-[0.98] whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Quote Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Copy Full Quote Breakdown</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Print / Save PDF</span>
              </button>

              <button
                onClick={onStartOver}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs text-zinc-400 hover:text-red-400 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Start New Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
