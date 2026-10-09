"use client";

import React from "react";
import Image from "next/image";
import { Check, Info } from "lucide-react";
import { CarSizeType } from "@/types";

interface Step1CarSizeProps {
  sizes: CarSizeType[];
  selectedSizeId: string | null;
  onSelectSize: (size: CarSizeType) => void;
}

export function Step1CarSize({
  sizes,
  selectedSizeId,
  onSelectSize,
}: Step1CarSizeProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          Step 1 of 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Select Your Car Size
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mt-2">
          Pricing is customized to your vehicle&apos;s dimensions to guarantee meticulous surface coverage.
        </p>
      </div>

      {/* Size Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {sizes.map((size) => {
          const isSelected = selectedSizeId === size.id;

          return (
            <div
              key={size.id}
              onClick={() => onSelectSize(size)}
              className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-cyan-950/70 to-slate-900 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.01]"
                  : "bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 shadow-lg hover:shadow-cyan-950/20"
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              {/* Vehicle Image Container */}
              <div className="relative w-full h-44 sm:h-40 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/80 mb-4 flex items-center justify-center">
                {size.imageUrl ? (
                  <Image
                    src={size.imageUrl}
                    alt={`${size.name} vehicle size`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  /* Clean Placeholder if no image uploaded yet */
                  <div className="flex flex-col items-center justify-center text-slate-600 p-4 text-center">
                    <svg
                      className="w-16 h-16 text-slate-700 mb-2 group-hover:text-cyan-500/60 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H7c-.6 0-1.1.3-1.5.7L3.2 10.1C2.5 10.5 2 11.2 2 12v4c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" />
                      <path d="M9 17h6" />
                      <circle cx="17" cy="17" r="2" />
                    </svg>
                    <span className="text-xs font-medium text-slate-500">
                      Photo pending upload
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 left-2 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
                  Tier {size.sortOrder || "1"}
                </span>
              </div>

              {/* Title & Size Guide Examples */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3
                    className={`text-xl font-bold transition-colors ${
                      isSelected ? "text-cyan-300" : "text-white group-hover:text-cyan-400"
                    }`}
                  >
                    {size.name}
                  </h3>
                </div>

                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
                  <div className="flex items-start gap-1.5 text-xs text-slate-300">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Examples: </span>
                      <span className="text-slate-400 leading-relaxed">{size.examples}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                >
                  {isSelected ? "Selected" : "Tap to choose"}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-black font-bold"
                      : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                  }`}
                >
                  {isSelected ? "Active" : "Select"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
