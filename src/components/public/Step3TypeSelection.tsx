"use client";

import React from "react";
import { Sparkles, Layers, ArrowRight, Flame, Check } from "lucide-react";

interface Step3TypeSelectionProps {
  selectedType: "NORMAL" | "COMBO" | null;
  onSelectType: (type: "NORMAL" | "COMBO") => void;
  serviceCount: number;
  comboCount: number;
}

export function Step3TypeSelection({
  selectedType,
  onSelectType,
  serviceCount,
  comboCount,
}: Step3TypeSelectionProps) {
  // Local active type selection state so user can pick/switch before confirming
  const [activeType, setActiveType] = React.useState<"NORMAL" | "COMBO">(
    selectedType || "COMBO"
  );

  const handleConfirm = () => {
    onSelectType(activeType);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-red-600/10 text-red-500 border border-red-600/30 mb-2.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] uppercase tracking-wider">
          Step 3 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          How would you like to build your quote?
        </h2>
        <p className="text-zinc-400 text-xs sm:text-base max-w-md mx-auto mt-1.5 sm:mt-2 px-2">
          Choose standalone individual treatments or bundle up for maximum package savings.
        </p>
      </div>

      {/* Two Big Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Option 1: Normal / Individual */}
        <div
          onClick={() => setActiveType("NORMAL")}
          className={`group relative rounded-2xl p-5 sm:p-7 cursor-pointer transition-all duration-300 flex flex-col justify-between border-2 active:scale-[0.98] ${
            activeType === "NORMAL"
              ? "bg-gradient-to-b from-red-950/50 via-zinc-900 to-black border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]"
              : "glass-card border-zinc-800 hover:border-red-500/50 hover:shadow-red-950/30"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  activeType === "NORMAL"
                    ? "bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                    : "bg-zinc-800 text-red-400 group-hover:bg-red-600/20 group-hover:text-red-300"
                }`}
              >
                <Layers className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {serviceCount} Individual Services
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
              Normal Services
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Pick and choose only what your car needs. Hand-wash, paint decontamination, glass rain repellent, interior steam, leather conditioning, and more.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400">
              {activeType === "NORMAL" ? "Selected Option" : "Multi-select customizable"}
            </span>
            <div
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeType === "NORMAL"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700"
              }`}
            >
              <span>{activeType === "NORMAL" ? "Selected" : "Choose Individual"}</span>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Option 2: Combo Packages */}
        <div
          onClick={() => setActiveType("COMBO")}
          className={`group relative rounded-2xl p-5 sm:p-7 cursor-pointer transition-all duration-300 flex flex-col justify-between border-2 active:scale-[0.98] ${
            activeType === "COMBO"
              ? "bg-gradient-to-b from-red-950/50 via-zinc-900 to-black border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]"
              : "glass-card border-zinc-800 hover:border-red-500/50 hover:shadow-red-950/30"
          }`}
        >
          {/* Savings Badge */}
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-red-400/40">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>Best Value &bull; Up to 25% Off</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  activeType === "COMBO"
                    ? "bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                    : "bg-zinc-800 text-red-400 group-hover:bg-red-600/20 group-hover:text-red-300"
                }`}
              >
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {comboCount} Curated Packages
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
              Combo Packages
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Complete bumper-to-bumper detailing packages bundled together at heavily discounted rates. Ideal for complete vehicle renewal and ceramic protection.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400">
              {activeType === "COMBO" ? "Selected Option" : "Bundled package savings"}
            </span>
            <div
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeType === "COMBO"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700"
              }`}
            >
              <span>{activeType === "COMBO" ? "Selected" : "Choose Packages"}</span>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Confirmation Bar */}
      <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left text-xs sm:text-sm text-zinc-400">
          Option chosen:{" "}
          <span className="font-bold text-white bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-700 text-red-400">
            {activeType === "NORMAL" ? "Individual Normal Services" : "Curated Combo Packages"}
          </span>
        </div>
        <button
          onClick={handleConfirm}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-200 active:scale-95 whitespace-nowrap"
        >
          <span className="whitespace-nowrap">Confirm &amp; Proceed to {activeType === "NORMAL" ? "Services" : "Packages"}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}
