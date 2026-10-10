"use client";

import React, { useState, useMemo } from "react";
import { Search, X, CheckCircle2, Flame, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { ComboType, ServiceType, CarSizeType } from "@/types";
import { formatCurrency, isSaleActive } from "@/lib/utils";

interface Step4CombosProps {
  combos: ComboType[];
  allServices: ServiceType[];
  selectedSize: CarSizeType;
  selectedComboId: string | null;
  onSelectCombo: (combo: ComboType) => void;
  onProceedToSummary: () => void;
}

export function Step4Combos({
  combos,
  allServices,
  selectedSize,
  selectedComboId,
  onSelectCombo,
  onProceedToSummary,
}: Step4CombosProps) {
  const [viewMode, setViewMode] = useState<"all" | "top5">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCombos = useMemo(() => {
    return [...combos].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [combos]);

  // Default all items, or top 5 if toggled
  const displayedCombos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return sortedCombos.filter((c) => {
        const inName = c.name.toLowerCase().includes(q);
        const inDesc = c.description.toLowerCase().includes(q);
        const inServices = c.services?.some((s) =>
          s.name.toLowerCase().includes(q)
        );
        return inName || inDesc || inServices;
      });
    }
    if (viewMode === "top5") {
      return sortedCombos.slice(0, 5);
    }
    return sortedCombos;
  }, [sortedCombos, searchQuery, viewMode]);

  const hasMoreThanFive = sortedCombos.length > 5;

  // Compute regular total and savings for a combo
  const getComboPricingDetails = (combo: ComboType) => {
    // 1. Combo price for selected size
    const comboPriceRecord = combo.prices?.find(
      (p) => p.carSizeId === selectedSize.id
    );
    const regularComboPrice = comboPriceRecord?.price ?? 0;
    const saleComboPrice = comboPriceRecord?.salePrice;
    const hasSale =
      saleComboPrice &&
      isSaleActive(
        saleComboPrice,
        comboPriceRecord?.saleStart,
        comboPriceRecord?.saleEnd
      );
    const effectiveComboPrice = hasSale ? saleComboPrice : regularComboPrice;

    // 2. Sum of included services' individual prices for selected size
    let sumIndividualPrices = 0;
    const includedServices = combo.services || [];

    includedServices.forEach((svc) => {
      // Find latest service price for this size
      const fullSvc = allServices.find((s) => s.id === svc.id) || svc;
      const svcPriceRecord = fullSvc.prices?.find(
        (p) => p.carSizeId === selectedSize.id
      );
      const svcPrice = svcPriceRecord?.price ?? 0;
      sumIndividualPrices += svcPrice;
    });

    const savings = Math.max(0, sumIndividualPrices - effectiveComboPrice);

    return {
      effectiveComboPrice,
      regularComboPrice,
      hasSale,
      sumIndividualPrices,
      savings,
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-red-600/10 text-red-500 border border-red-600/30 mb-2.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] uppercase tracking-wider">
          Step 4 of 5 &bull; Bundled Combos
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Select Your Detailing Package
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 sm:mt-2 px-2">
          Pricing and savings computed for:{" "}
          <span className="font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-600/40">
            {selectedSize.name}
          </span>
          . Select 1 comprehensive combo.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5 sm:mb-6">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 sm:left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search combo packages (e.g. presidential, ceramic)..."
            className="w-full pl-10 sm:pl-11 pr-10 py-3 sm:py-3.5 bg-black/90 border border-zinc-700/80 focus:border-red-500 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-base transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Chips + Search Status Notice */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 px-1 mt-2.5">
          {!searchQuery && hasMoreThanFive ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  viewMode === "all"
                    ? "bg-red-600/20 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                All Packages ({sortedCombos.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("top5")}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  viewMode === "top5"
                    ? "bg-red-600/20 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Top 5 Recommended
              </button>
            </div>
          ) : (
            <span>
              {searchQuery
                ? `Showing ${displayedCombos.length} result${
                    displayedCombos.length === 1 ? "" : "s"
                  } matching "${searchQuery}"`
                : `Showing all ${sortedCombos.length} available packages`}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Combos List Container */}
      <div className="max-h-[540px] sm:max-h-[580px] overflow-y-auto pr-1 sm:pr-2 space-y-4 scroll-smooth">
        {displayedCombos.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <p className="text-zinc-400 text-sm">No combo packages found.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-red-400 hover:underline font-bold"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          displayedCombos.map((combo) => {
            const isSelected = selectedComboId === combo.id;
            const {
              effectiveComboPrice,
              regularComboPrice,
              hasSale,
              sumIndividualPrices,
              savings,
            } = getComboPricingDetails(combo);

            return (
              <div
                key={combo.id}
                onClick={() => onSelectCombo(combo)}
                className={`rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 relative border ${
                  isSelected
                    ? "bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-900 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)] scale-[1.005]"
                    : "glass-card border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40"
                }`}
              >
                {/* Header Row: Title, Radio, Savings Badge, Price */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3.5">
                    {/* Single-select radio circle */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all ${
                        isSelected
                          ? "bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                          : "border-2 border-zinc-600 bg-black"
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-white text-lg sm:text-xl">
                          {combo.name}
                        </h3>

                        {/* Savings Badge - only show if savings > 0 */}
                        {savings > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-red-400/30">
                            <Flame className="w-3 h-3 fill-white" />
                            <span>Save {formatCurrency(savings)}</span>
                          </span>
                        )}

                        {hasSale && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/40">
                            Promo
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                        {combo.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                    <div className="text-left sm:text-right">
                      {sumIndividualPrices > effectiveComboPrice && (
                        <div className="text-xs text-zinc-400">
                          Individual value:{" "}
                          <span className="line-through text-zinc-500">
                            {formatCurrency(sumIndividualPrices)}
                          </span>
                        </div>
                      )}
                      {hasSale && (
                        <span className="text-xs text-zinc-500 line-through mr-1 sm:mr-0 block">
                          {formatCurrency(regularComboPrice)}
                        </span>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-red-500">
                      {formatCurrency(effectiveComboPrice)}
                    </div>
                  </div>
                </div>

                {/* "What's Included" Services List */}
                <div className="bg-black/70 rounded-xl p-3.5 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-red-500" />
                    <span>What&apos;s Included in this Package:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {combo.services?.map((svc) => (
                      <div
                        key={svc.id}
                        className="flex items-center gap-2 text-xs text-zinc-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{svc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* "See More" banner when in top5 preview */}
        {!searchQuery && hasMoreThanFive && viewMode === "top5" && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-red-500/40 hover:border-red-500 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              <span>See More Packages ({sortedCombos.length - 5} more available)</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* In-flow Bottom Action to Step 5 */}
      {selectedComboId && (
        <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-end">
          <button
            onClick={onProceedToSummary}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <span className="whitespace-nowrap">Proceed to Quote Summary</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}
