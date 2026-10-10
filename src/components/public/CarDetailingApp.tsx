"use client";

import React, { useState, useEffect } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { RedSquareLoader } from "@/components/common/RedSquareLoader";
import { Sparkles, Shield, RefreshCw, Lock } from "lucide-react";
import Link from "next/link";
import { CarSizeType, ServiceType, ComboType, PublicPricingData } from "@/types";
import { StepProgress } from "./StepProgress";
import { Step1CarSize } from "./Step1CarSize";
import { Step2CarName } from "./Step2CarName";
import { Step3TypeSelection } from "./Step3TypeSelection";
import { Step4Services } from "./Step4Services";
import { Step4Combos } from "./Step4Combos";
import { Step5QuoteSummary } from "./Step5QuoteSummary";
import type { SelectedQuoteItem } from "./QuoteSummary";
import { isSaleActive } from "@/lib/utils";

export function CarDetailingApp() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicPricingData | null>(null);

  // Stepper state: 1 (Size), 2 (Vehicle), 3 (Type), 4 (Services/Combos), 5 (Quote Summary)
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

  // Step 4 -> Step 5: Proceed to final quote summary
  const handleProceedToSummary = () => {
    setCurrentStep(5);
    logAnalytics("VIEW_SUMMARY", "SUMMARY", selectedSize?.id);
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
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <RedSquareLoader text="Loading AutoDrift Pricing Engine..." />
      </div>
    );
  }

  const sizes = data?.sizes || [];
  const services = data?.services || [];
  const combos = data?.combos || [];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col text-zinc-100">
      {/* ============================================================== */}
      {/* BRAND TOP BAR */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <BrandLogo showIcon={false} />

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={loadData}
              title="Refresh live pricing from database"
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
              aria-label="Refresh pricing"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <Link
              href="/admin/login"
              className="flex items-center gap-1 sm:gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
              <span className="hidden xs:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* STEP PROGRESS NAVIGATION (5 STEPS)                             */}
      {/* ============================================================== */}
      <StepProgress
        currentStep={currentStep}
        onBack={handleBack}
        onStartOver={handleStartOver}
        canGoBack={currentStep > 1}
      />

      {/* ============================================================== */}
      {/* MAIN STEP CONTAINER                                            */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6">
        {currentStep === 5 ? (
          /* STEP 5: DEDICATED FULL-PAGE QUOTE SUMMARY */
          <Step5QuoteSummary
            selectedSize={selectedSize}
            carName={carName}
            items={quoteItems}
            onRemoveItem={handleRemoveItem}
            onModify={() => setCurrentStep(4)}
            onStartOver={handleStartOver}
          />
        ) : currentStep === 1 ? (
          /* STEP 1: FULL-WIDTH CENTERED CAR SIZE SELECTION */
          <div className="w-full pb-16">
            <Step1CarSize
              sizes={sizes}
              selectedSizeId={selectedSize?.id || null}
              onSelectSize={handleSelectSize}
            />
          </div>
        ) : currentStep === 2 && selectedSize ? (
          /* STEP 2: FULL-WIDTH CENTERED VEHICLE NAME + GEMINI AI */
          <div className="w-full pb-16">
            <Step2CarName
              selectedSize={selectedSize}
              sizes={sizes}
              initialCarName={carName}
              onConfirm={handleConfirmCarName}
              onSkip={handleSkipCarName}
            />
          </div>
        ) : currentStep === 3 ? (
          /* STEP 3: FULL-WIDTH CENTERED TYPE SELECTION */
          <div className="w-full pb-16">
            <Step3TypeSelection
              selectedType={selectedType}
              onSelectType={handleSelectType}
              serviceCount={services.length}
              comboCount={combos.length}
            />
          </div>
        ) : (
          /* STEP 4: FULL-WIDTH CENTERED SERVICES & COMBOS */
          <div className="w-full pb-20">
            {/* STEP 4A: NORMAL SERVICES LIST */}
            {selectedType === "NORMAL" && selectedSize && (
              <Step4Services
                services={services}
                selectedSize={selectedSize}
                selectedServiceIds={selectedServiceIds}
                onToggleService={handleToggleService}
                onProceedToSummary={handleProceedToSummary}
              />
            )}

            {/* STEP 4B: COMBO PACKAGES LIST */}
            {selectedType === "COMBO" && selectedSize && (
              <Step4Combos
                combos={combos}
                allServices={services}
                selectedSize={selectedSize}
                selectedComboId={selectedComboId}
                onSelectCombo={handleSelectCombo}
                onProceedToSummary={handleProceedToSummary}
              />
            )}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* FOOTER                                                         */}
      {/* ============================================================== */}
      <footer className="border-t border-zinc-900 bg-zinc-950/90 py-6 px-4 text-center text-xs text-zinc-500 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            <span className="text-zinc-400">
              AutoDrift Studio &bull; Precision Detailing &amp; Paint Protection
            </span>
          </div>
          <p className="text-zinc-500">
            Real-time live prices &bull; No booking required for instant estimate
          </p>
        </div>
      </footer>
    </div>
  );
}
