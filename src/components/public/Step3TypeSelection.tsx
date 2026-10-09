"use client";

import React from "react";
import { Sparkles, Layers, ArrowRight, Flame } from "lucide-react";

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
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          Step 3 of 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          How would you like to build your quote?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mt-2">
          Choose standalone individual treatments or bundle up for maximum package savings.
        </p>
      </div>

      {/* Two Big Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Normal / Individual */}
        <div
          onClick={() => onSelectType("NORMAL")}
          className={`group relative rounded-2xl p-7 cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
            selectedType === "NORMAL"
              ? "bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] scale-[1.01]"
              : "glass-card border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-950/30"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  selectedType === "NORMAL"
                    ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                    : "bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300"
                }`}
              >
                <Layers className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {serviceCount} Individual Services
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
              Normal Services
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Pick and choose only what your car needs. Hand-wash, paint decontamination, glass rain repellent, interior steam, leather conditioning, and more.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400">Multi-select customizable</span>
            <div
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedType === "NORMAL"
                  ? "bg-cyan-500 text-black shadow-md"
                  : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
              }`}
            >
              <span>Select Individual</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Option 2: Combo Packages */}
        <div
          onClick={() => onSelectType("COMBO")}
          className={`group relative rounded-2xl p-7 cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
            selectedType === "COMBO"
              ? "bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] scale-[1.01]"
              : "glass-card border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-950/30"
          }`}
        >
          {/* Savings Badge */}
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-black" />
            <span>Best Value &bull; Up to 25% Off</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  selectedType === "COMBO"
                    ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                    : "bg-slate-800 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300"
                }`}
              >
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {comboCount} Curated Packages
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
              Combo Packages
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Complete bumper-to-bumper detailing packages bundled together at heavily discounted rates. Ideal for complete vehicle renewal and ceramic protection.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Bundled package savings</span>
            <div
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedType === "COMBO"
                  ? "bg-cyan-500 text-black shadow-md"
                  : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
              }`}
            >
              <span>Explore Combos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
