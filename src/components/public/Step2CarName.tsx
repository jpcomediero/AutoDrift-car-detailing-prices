"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Car, ShieldCheck } from "lucide-react";
import { CarSizeType } from "@/types";
import { CarRecommendationResult } from "@/lib/anthropic";

interface Step2CarNameProps {
  selectedSize: CarSizeType;
  sizes: CarSizeType[];
  initialCarName: string;
  onConfirm: (carName: string, confirmedSize: CarSizeType) => void;
  onSkip: () => void;
}

export function Step2CarName({
  selectedSize,
  sizes,
  initialCarName,
  onConfirm,
  onSkip,
}: Step2CarNameProps) {
  const [carName, setCarName] = useState(initialCarName);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CarRecommendationResult | null>(null);
  const [hasValidated, setHasValidated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = carName.trim();
    if (!query) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/recommend-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carName: query }),
      });

      if (!res.ok) {
        throw new Error("API call failed");
      }

      const data: CarRecommendationResult = await res.json();
      setResult(data);
      setHasValidated(true);
    } catch (err) {
      console.warn("Size validation fallback triggered:", err);
      // Fallback never blocks the flow
      setResult({
        recognized: false,
        recommendedSize: selectedSize.name,
        confidence: "low",
        reason: "Network response delayed. You can proceed with your chosen size.",
      });
      setHasValidated(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Find recommended size object
  const recommendedSizeObj = sizes.find(
    (s) => s.name.toLowerCase() === result?.recommendedSize?.toLowerCase()
  ) || selectedSize;

  const isMatch =
    result?.recognized &&
    result.recommendedSize.toLowerCase() === selectedSize.name.toLowerCase();

  const isMismatch =
    result?.recognized &&
    result.recommendedSize.toLowerCase() !== selectedSize.name.toLowerCase();

  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/10 text-red-500 border border-red-600/30 mb-3 shadow-[0_0_15px_rgba(239,68,68,0.2)] uppercase tracking-wider">
          Step 2 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          What car do you drive?
        </h2>
        <p className="text-zinc-400 text-sm mt-2">
          Currently selected size:{" "}
          <span className="font-bold text-red-400 bg-red-950/50 px-2.5 py-0.5 rounded-full border border-red-600/40">
            {selectedSize.name}
          </span>
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="car-name-input"
              className="block text-sm font-semibold text-zinc-200 mb-2 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-red-500" />
                Car Make &amp; Model
              </span>
              <span className="text-xs text-zinc-500">e.g., Year, Brand, Model</span>
            </label>
            <div className="relative">
              <input
                id="car-name-input"
                type="text"
                value={carName}
                onChange={(e) => {
                  setCarName(e.target.value);
                  if (hasValidated) setHasValidated(false);
                }}
                placeholder="e.g., Toyota Fortuner 2022"
                className="w-full px-4 py-3.5 bg-black/90 border border-zinc-700/90 focus:border-red-500 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-base transition-all"
                autoFocus
              />
            </div>
          </div>

          {!hasValidated && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !carName.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-200 active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span className="whitespace-nowrap">Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white shrink-0" />
                    <span className="whitespace-nowrap">Verify Car Size</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onConfirm(carName.trim() || selectedSize.name, selectedSize)}
                className="w-full sm:w-auto px-4 py-3 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors whitespace-nowrap text-center"
              >
                <span className="whitespace-nowrap">Proceed with {selectedSize.name} without verification &rarr;</span>
              </button>
            </div>
          )}
        </form>

        {/* Validation Feedback States */}
        {hasValidated && result && (
          <div className="mt-6 pt-6 border-t border-zinc-800 animate-in fade-in duration-300">
            {/* Condition 1: Perfect Match */}
            {isMatch && (
              <div className="rounded-xl p-4 bg-zinc-900/90 border border-red-500/50 text-zinc-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      Confirmed! Perfect size match.
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                      {result.reason || `${carName} matches your selected size (${selectedSize.name}).`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onConfirm(carName, selectedSize)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95"
                >
                  <span>Confirm &amp; Continue to Step 3</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Condition 2: Recommendation Differs from Selected Size */}
            {isMismatch && (
              <div className="rounded-xl p-4 bg-zinc-900/90 border border-red-500/60 text-zinc-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-400 text-sm sm:text-base">
                      Size Recommendation Suggestion
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                      Your <span className="font-semibold text-white">{carName}</span> is usually classified as{" "}
                      <span className="font-bold text-white bg-red-950/80 px-2 py-0.5 rounded border border-red-500/50">
                        {result.recommendedSize}
                      </span>
                      . Switch to {result.recommendedSize}?
                    </p>
                    {result.reason && (
                      <p className="text-xs text-zinc-400 mt-1 italic">&ldquo;{result.reason}&rdquo;</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => onConfirm(carName, recommendedSizeObj)}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95 whitespace-nowrap"
                  >
                    <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                    <span className="whitespace-nowrap">Use recommended ({result.recommendedSize})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onConfirm(carName, selectedSize)}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs sm:text-sm border border-zinc-700 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span className="whitespace-nowrap">Keep my selection ({selectedSize.name})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Condition 3: Not Recognized or API Error (Never block flow) */}
            {!isMatch && !isMismatch && (
              <div className="rounded-xl p-4 bg-zinc-900 border border-zinc-700 text-zinc-300">
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base">
                      Ready to continue!
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      {result.reason || "We will apply pricing for your selected size: " + selectedSize.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onConfirm(carName || selectedSize.name, selectedSize)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95 whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">Confirm &amp; Continue with {selectedSize.name}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
