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
  { id: 5, label: "Summary" },
];

export function StepProgress({
  currentStep,
  onBack,
  onStartOver,
  canGoBack,
}: StepProgressProps) {
  return (
    <div className="w-full bg-[#0d0d0d]/95 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-30 px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Back button */}
        <div className="flex items-center min-w-[60px] sm:min-w-[80px]">
          {canGoBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-700/60 transition-all duration-150 active:scale-95"
              aria-label="Back to previous step"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Center: Step Indicators */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div
                    className={`w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all duration-300 shrink-0 ${
                      isCompleted
                        ? "bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                        : isCurrent
                        ? "bg-gradient-to-br from-red-500 to-red-700 text-white ring-2 ring-red-400/60 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                        : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" /> : step.id}
                  </div>
                  <span
                    className={`text-xs font-medium hidden md:inline ${
                      isCurrent
                        ? "text-red-500 font-bold"
                        : isCompleted
                        ? "text-zinc-200"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-[2px] w-2.5 xs:w-3.5 sm:w-6 md:w-8 rounded-full transition-colors duration-300 ${
                      currentStep > step.id ? "bg-red-600/80" : "bg-zinc-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Reset button */}
        <div className="flex items-center justify-end min-w-[60px] sm:min-w-[80px]">
          <button
            onClick={onStartOver}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-red-400 bg-transparent hover:bg-red-600/10 rounded-lg border border-transparent hover:border-red-600/30 transition-all duration-150 active:scale-95"
            title="Reset and start over from step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
