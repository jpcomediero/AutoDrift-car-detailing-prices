"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Shield, Wrench, RefreshCw, Lock } from "lucide-react";
import Link from "next/link";
import { CarSizeType, ServiceType, ComboType, PublicPricingData } from "@/types";
import { StepProgress } from "./StepProgress";
import { Step1CarSize } from "./Step1CarSize";
import { Step2CarName } from "./Step2CarName";
import { Step3TypeSelection } from "./Step3TypeSelection";
import { Step4Services } from "./Step4Services";
import { Step4Combos } from "./Step4Combos";
import { QuoteSummary, SelectedQuoteItem } from "./QuoteSummary";
import { isSaleActive } from "@/lib/utils";

export function CarDetailingApp() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicPricingData | null>(null);

  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User selections
  const [selectedSize, setSelectedSize] = useState<CarSizeType | null>(null);
  const [carName, setCarName] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"NORMAL" | "COMBO" | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedComboId, setSelectedComboId] = useState<string | null>(null);

  // Load catalog live from DB
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/data", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch data");
      const json: PublicPricingData = await res.json();
      setData(json);

      // Default select first size if none selected yet
      if (json.sizes?.length > 0 && !selectedSize) {
        setSelectedSize(json.sizes[0]);
      }
    } catch (err) {
      console.error("Error loading pricing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Fire anonymous view event
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "VIEW", itemType: "LANDING_PAGE" }),
    }).catch(() => {});
  }, []);

  // Helper: Log selection analytics
  const logAnalytics = (
    eventType: string,
    itemType?: string,
    itemId?: string,
    sizeId?: string
  ) => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        itemType,
        itemId,
        carSizeId: sizeId || selectedSize?.id,
      }),
    }).catch(() => {});
  };

  // Step 1: Size chosen
  const handleSelectSize = (size: CarSizeType) => {
    setSelectedSize(size);
    logAnalytics("SELECT", "SIZE", size.id, size.id);
    setCurrentStep(2);
  };

  // Step 2: Car model confirmed
  const handleConfirmCarName = (name: string, confirmedSize: CarSizeType) => {
    setCarName(name);
    setSelectedSize(confirmedSize);
    logAnalytics("SIZE_CHOSEN", "SIZE", confirmedSize.id, confirmedSize.id);
    setCurrentStep(3);
  };

  const handleSkipCarName = () => {
    setCurrentStep(3);
  };

  // Step 3: Type chosen
  const handleSelectType = (type: "NORMAL" | "COMBO") => {
    setSelectedType(type);
    logAnalytics("SELECT", "TYPE", type);
    setCurrentStep(4);
  };

  // Step 4A: Normal Service toggle
  const handleToggleService = (service: ServiceType) => {
    setSelectedServiceIds((prev) => {
      const exists = prev.includes(service.id);
      const updated = exists
        ? prev.filter((id) => id !== service.id)
        : [...prev, service.id];

      if (!exists) {
        logAnalytics("SELECT", "SERVICE", service.id);
      }
      return updated;
    });
  };

  // Step 4B: Combo select
  const handleSelectCombo = (combo: ComboType) => {
    setSelectedComboId(combo.id);
    logAnalytics("SELECT", "COMBO", combo.id);
  };

  // Navigation: Back button
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Navigation: Start over
  const handleStartOver = () => {
    setCurrentStep(1);
    setCarName("");
    setSelectedType(null);
    setSelectedServiceIds([]);
    setSelectedComboId(null);
    if (data?.sizes?.[0]) {
      setSelectedSize(data.sizes[0]);
    }
  };

  // Construct item list for summary panel
  const quoteItems: SelectedQuoteItem[] = [];

  if (selectedSize) {
    if (selectedType === "NORMAL") {
      selectedServiceIds.forEach((id) => {
        const svc = data?.services.find((s) => s.id === id);
        if (svc) {
          const priceRecord = svc.prices?.find((p) => p.carSizeId === selectedSize.id);
          const regularPrice = priceRecord?.price ?? 0;
          const salePrice = priceRecord?.salePrice;
          const hasSale =
            salePrice &&
            isSaleActive(salePrice, priceRecord?.saleStart, priceRecord?.saleEnd);

          quoteItems.push({
            id: svc.id,
            name: svc.name,
            type: "service",
            price: hasSale ? salePrice : regularPrice,
            originalPrice: hasSale ? regularPrice : undefined,
            durationMinutes: svc.durationMinutes,
          });
        }
      });
    } else if (selectedType === "COMBO" && selectedComboId) {
      const combo = data?.combos.find((c) => c.id === selectedComboId);
      if (combo) {
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

        // Sum individual services for regular price comparison
        let totalRegularSvcPrice = 0;
        combo.services?.forEach((s) => {
          const fullSvc = data?.services.find((item) => item.id === s.id) || s;
          const pRec = fullSvc.prices?.find((p) => p.carSizeId === selectedSize.id);
          totalRegularSvcPrice += pRec?.price ?? 0;
        });

        quoteItems.push({
          id: combo.id,
          name: combo.name,
          type: "combo",
          price: hasSale ? saleComboPrice : regularComboPrice,
          originalPrice:
            totalRegularSvcPrice > (hasSale ? saleComboPrice : regularComboPrice)
              ? totalRegularSvcPrice
              : undefined,
        });
      }
    }
  }

  const handleRemoveItem = (id: string) => {
    if (selectedType === "NORMAL") {
      setSelectedServiceIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedComboId(null);
    }
  };

  const handleClearAll = () => {
    setSelectedServiceIds([]);
    setSelectedComboId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-300 tracking-wide uppercase">
          Loading AutoDrift Pricing Engine...
        </p>
      </div>
    );
  }

  const sizes = data?.sizes || [];
  const services = data?.services || [];
  const combos = data?.combos || [];

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col text-slate-100">
      {/* ============================================================== */}
      {/* BRAND TOP BAR                                                  */}
      {/* ============================================================== */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider text-white">
                  AUTODRIFT
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Detailing Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Live Pricing &amp; Custom Quote Calculator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh live pricing from database"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
              aria-label="Refresh pricing"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* STEP PROGRESS NAVIGATION                                       */}
      {/* ============================================================== */}
      <StepProgress
        currentStep={currentStep}
        onBack={handleBack}
        onStartOver={handleStartOver}
        canGoBack={currentStep > 1}
      />

      {/* ============================================================== */}
      {/* MAIN STEP CONTAINER WITH RESPONSIVE QUOTE PANEL               */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Step Flow Area */}
          <div className="flex-1 w-full min-w-0 pb-24 lg:pb-8">
            {/* STEP 1: CHOOSE SIZE */}
            {currentStep === 1 && (
              <Step1CarSize
                sizes={sizes}
                selectedSizeId={selectedSize?.id || null}
                onSelectSize={handleSelectSize}
              />
            )}

            {/* STEP 2: CAR NAME + CLAUDE AI RECOMMENDATION */}
            {currentStep === 2 && selectedSize && (
              <Step2CarName
                selectedSize={selectedSize}
                sizes={sizes}
                initialCarName={carName}
                onConfirm={handleConfirmCarName}
                onSkip={handleSkipCarName}
              />
            )}

            {/* STEP 3: TYPE SELECTION (NORMAL VS COMBO) */}
            {currentStep === 3 && (
              <Step3TypeSelection
                selectedType={selectedType}
                onSelectType={handleSelectType}
                serviceCount={services.length}
                comboCount={combos.length}
              />
            )}

            {/* STEP 4A: NORMAL SERVICES LIST */}
            {currentStep === 4 && selectedType === "NORMAL" && selectedSize && (
              <Step4Services
                services={services}
                selectedSize={selectedSize}
                selectedServiceIds={selectedServiceIds}
                onToggleService={handleToggleService}
              />
            )}

            {/* STEP 4B: COMBO PACKAGES LIST */}
            {currentStep === 4 && selectedType === "COMBO" && selectedSize && (
              <Step4Combos
                combos={combos}
                allServices={services}
                selectedSize={selectedSize}
                selectedComboId={selectedComboId}
                onSelectCombo={handleSelectCombo}
              />
            )}
          </div>

          {/* QUOTE SUMMARY PANEL (Side panel on desktop / Sticky bottom sheet on mobile) */}
          <QuoteSummary
            selectedSize={selectedSize}
            carName={carName}
            items={quoteItems}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
          />
        </div>
      </main>

      {/* ============================================================== */}
      {/* FOOTER                                                         */}
      {/* ============================================================== */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">
              AutoDrift Studio &bull; Premium Ceramic Coating &amp; Paint Correction
            </span>
          </div>
          <p className="text-slate-400">
            Real-time live prices &bull; No booking required for instant estimate
          </p>
        </div>
      </footer>
    </div>
  );
}
