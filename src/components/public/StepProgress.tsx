"use client";

import React from "react";
import { Check, RotateCcw, ArrowLeft } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  onBack: () => void;
  onStartOver: () => void;
  canGoBack: boolean;
}

const STEPS = [
  { id: 1, label: "Size" },
  { id: 2, label: "Vehicle" },
  { id: 3, label: "Type" },
  { id: 4, label: "Services" },
];

export function StepProgress({
  currentStep,
  onBack,
  onStartOver,
  canGoBack,
}: StepProgressProps) {
  return (
    <div className="w-full bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Back button or placeholder */}
        <div className="flex items-center gap-2">
          {canGoBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700/60 transition-all duration-150 active:scale-95"
              aria-label="Back to previous step"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-16" />
          )}
        </div>

        {/* Center: Step Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      isCompleted
                        ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                        : isCurrent
                        ? "bg-gradient-to-br from-cyan-400 to-cyan-600 text-black ring-2 ring-cyan-300/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        : "bg-slate-800 text-slate-500 border border-slate-700/50"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isCurrent
                        ? "text-cyan-400 font-semibold"
                        : isCompleted
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-[2px] w-4 sm:w-8 rounded-full transition-colors duration-300 ${
                      currentStep > step.id ? "bg-cyan-500/80" : "bg-slate-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Start Over button */}
        <button
          onClick={onStartOver}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-150 active:scale-95"
          title="Reset and start over from step 1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
