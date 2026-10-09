"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Clock, ChevronDown, ChevronUp, Check, Sparkles, ArrowRight } from "lucide-react";
import { ServiceType, CarSizeType } from "@/types";
import { formatCurrency, formatDuration, isSaleActive } from "@/lib/utils";

interface Step4ServicesProps {
  services: ServiceType[];
  selectedSize: CarSizeType;
  selectedServiceIds: string[];
  onToggleService: (service: ServiceType) => void;
  onProceedToSummary: () => void;
}

export function Step4Services({
  services,
  selectedSize,
  selectedServiceIds,
  onToggleService,
  onProceedToSummary,
}: Step4ServicesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Helper to toggle description accordion
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sort services by admin-defined sortOrder
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [services]);

  // Compute displayed services:
  // When no search query: top 5 by admin order
  // When search query entered: search all services
  const displayedServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return sortedServices.slice(0, 5);
    }
    return sortedServices.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [sortedServices, searchQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-red-600/10 text-red-500 border border-red-600/30 mb-2.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] uppercase tracking-wider">
          Step 4 of 5 &bull; Individual Menu
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Choose Your Detailing Services
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 sm:mt-2 px-2">
          Pricing configured for:{" "}
          <span className="font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-600/40">
            {selectedSize.name}
          </span>
          . Select any combination of services below.
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
            placeholder="Search services (e.g. steam, ceramic, wax)..."
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

        {/* Search status notice */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1 mt-2">
          <span>
            {searchQuery
              ? `Showing ${displayedServices.length} result${
                  displayedServices.length === 1 ? "" : "s"
                } matching "${searchQuery}"`
              : `Showing top 5 recommended services. Search to browse all ${sortedServices.length} services.`}
          </span>
          {selectedServiceIds.length > 0 && (
            <span className="text-red-400 font-bold">
              {selectedServiceIds.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3.5">
        {displayedServices.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <p className="text-zinc-400 text-sm">No services matched your search.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-red-400 hover:underline font-bold"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          displayedServices.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            const isExpanded = !!expandedIds[service.id];

            // Resolve price for selected size
            const sizePriceRecord = service.prices?.find(
              (p) => p.carSizeId === selectedSize.id
            );
            const regularPrice = sizePriceRecord?.price ?? 0;
            const salePrice = sizePriceRecord?.salePrice;
            const hasSale =
              salePrice &&
              isSaleActive(
                salePrice,
                sizePriceRecord?.saleStart,
                sizePriceRecord?.saleEnd
              );
            const effectivePrice = hasSale ? salePrice : regularPrice;

            return (
              <div
                key={service.id}
                onClick={() => onToggleService(service)}
                className={`rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? "bg-gradient-to-r from-red-950/50 to-zinc-900/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                    : "glass-card border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-800/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  {/* Left: Checkbox + Service Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isSelected
                          ? "bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                          : "border border-zinc-600 bg-black group-hover:border-red-500/60"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-base sm:text-lg leading-snug">
                          {service.name}
                        </h3>
                        {hasSale && (
                          <span className="text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/40">
                            Sale
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-red-400" />
                          {formatDuration(service.durationMinutes)}
                        </span>
                        <span>&bull;</span>
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(service.id, e)}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold transition-colors"
                        >
                          <span>What&apos;s included</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="text-right shrink-0">
                    <div className="flex flex-col items-end">
                      {hasSale && (
                        <span className="text-xs text-zinc-500 line-through">
                          {formatCurrency(regularPrice)}
                        </span>
                      )}
                      <span className="text-lg sm:text-xl font-extrabold text-red-400">
                        {formatCurrency(effectivePrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable "What's included" Description */}
                {isExpanded && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 pt-3 border-t border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed bg-black/80 p-3 rounded-xl border border-zinc-800 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Treatment Details:</span>
                    </div>
                    <p className="text-zinc-300 whitespace-pre-line">
                      {service.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* In-flow Bottom Action to Step 5 */}
      {selectedServiceIds.length > 0 && (
        <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-end">
          <button
            onClick={onProceedToSummary}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <span className="whitespace-nowrap">Proceed to Quote Summary ({selectedServiceIds.length} Selected)</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}
