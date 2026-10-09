"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Clock, ChevronDown, ChevronUp, Check, Sparkles } from "lucide-react";
import { ServiceType, CarSizeType } from "@/types";
import { formatCurrency, formatDuration, isSaleActive } from "@/lib/utils";

interface Step4ServicesProps {
  services: ServiceType[];
  selectedSize: CarSizeType;
  selectedServiceIds: string[];
  onToggleService: (service: ServiceType) => void;
}

export function Step4Services({
  services,
  selectedSize,
  selectedServiceIds,
  onToggleService,
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          Step 4 of 4 &bull; Individual Menu
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Choose Your Detailing Services
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Pricing configured for:{" "}
          <span className="font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
            {selectedSize.name}
          </span>
          . Select any combination of services below.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all services (e.g. steam, ceramic, wax, polish)..."
            className="w-full pl-11 pr-10 py-3.5 bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search status notice */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 mt-2">
          <span>
            {searchQuery
              ? `Showing ${displayedServices.length} result${
                  displayedServices.length === 1 ? "" : "s"
                } matching "${searchQuery}"`
              : `Showing top 5 recommended services. Search to browse all ${sortedServices.length} services.`}
          </span>
          {selectedServiceIds.length > 0 && (
            <span className="text-cyan-400 font-semibold">
              {selectedServiceIds.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3.5">
        {displayedServices.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No services matched your search.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
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
                    ? "bg-gradient-to-r from-cyan-950/60 to-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                    : "glass-card border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  {/* Left: Checkbox + Service Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isSelected
                          ? "bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                          : "border border-slate-600 bg-slate-950/80 group-hover:border-cyan-500/50"
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
                          <span className="text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Sale
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          {formatDuration(service.durationMinutes)}
                        </span>
                        <span>&bull;</span>
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(service.id, e)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
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
                        <span className="text-xs text-slate-500 line-through">
                          {formatCurrency(regularPrice)}
                        </span>
                      )}
                      <span className="text-lg sm:text-xl font-extrabold text-cyan-400">
                        {formatCurrency(effectivePrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable "What's included" Description */}
                {isExpanded && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-1.5 text-cyan-300 font-semibold mb-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Treatment Details:</span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-line">
                      {service.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
