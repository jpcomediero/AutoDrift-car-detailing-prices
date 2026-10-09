"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Info, Check, X, Car, Shield } from "lucide-react";
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
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [confirmingSize, setConfirmingSize] = React.useState<CarSizeType | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Close modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmingSize(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, offsetWidth } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / (offsetWidth * 0.85));
      setCurrentSlide(Math.min(Math.max(index, 0), sizes.length - 1));
    }
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth * 0.85;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
      setCurrentSlide(index);
    }
  };

  const handleCardClick = (size: CarSizeType) => {
    setConfirmingSize(size);
  };

  const handleProceedConfirmed = () => {
    if (confirmingSize) {
      onSelectSize(confirmingSize);
      setConfirmingSize(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Step Header */}
      <div className="text-center mb-5 sm:mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-red-600/10 text-red-500 border border-red-600/30 mb-2.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] uppercase tracking-wider">
          Step 1 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Select Your Car Size
        </h2>
        <p className="text-zinc-400 text-xs sm:text-base max-w-lg mx-auto mt-1.5 sm:mt-2 px-2">
          Pricing is tailored to your vehicle&apos;s dimensions to guarantee meticulous surface coverage.
        </p>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden flex items-center justify-center gap-1.5 mt-3 text-[11px] font-semibold text-red-400/90 animate-pulse">
          <span>&larr;</span>
          <span>Swipe to explore vehicle sizes</span>
          <span>&rarr;</span>
        </div>
      </div>

      {/* Swipeable on Mobile, Responsive Grid on Tablet/Desktop */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-4 px-2 sm:px-0 -mx-2 sm:mx-0 scrollbar-none"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {sizes.map((size, idx) => {
          const isSelected = selectedSizeId === size.id;

          return (
            <div
              key={size.id}
              onClick={() => handleCardClick(size)}
              className={`w-[85vw] max-w-[340px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink group relative rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between active:scale-[0.98] border-2 ${
                isSelected
                  ? "bg-gradient-to-b from-red-950/50 via-zinc-900 to-black border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.35)]"
                  : "bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800 hover:border-red-500/50 shadow-lg hover:shadow-red-950/20"
              }`}
            >
              {/* Top part: Image and Info */}
              <div>
                {/* Vehicle Image Container */}
                <div className="relative w-full h-44 sm:h-40 rounded-xl overflow-hidden bg-black border border-zinc-800 mb-4 flex items-center justify-center">
                  {size.imageUrl ? (
                    <Image
                      src={size.imageUrl}
                      alt={`${size.name} vehicle size`}
                      fill
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    /* Clean Placeholder if no image uploaded yet */
                    <div className="flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                      <svg
                        className="w-16 h-16 text-zinc-700 mb-2 group-hover:text-red-500/70 transition-colors"
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
                      <span className="text-xs font-medium text-zinc-500">
                        Photo pending upload
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-2 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-zinc-300 border border-white/10">
                    Tier {size.sortOrder || "1"}
                  </span>
                </div>

                {/* Title & Size Guide Examples */}
                <div className="mb-4">
                  <h3
                    className={`text-xl font-bold transition-colors mb-2 ${
                      isSelected ? "text-red-400" : "text-white group-hover:text-red-400"
                    }`}
                  >
                    {size.name}
                  </h3>

                  <div className="bg-black/70 rounded-lg p-2.5 border border-zinc-800">
                    <div className="flex items-start gap-1.5 text-xs text-zinc-300">
                      <Info className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-zinc-200">Examples: </span>
                        <span className="text-zinc-400 leading-relaxed">{size.examples}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Card Confirm & Proceed Action Button */}
              <div className="pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(size);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md ${
                    isSelected
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      : "bg-zinc-800 group-hover:bg-red-600 text-zinc-200 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  }`}
                >
                  <span>Select &amp; Proceed with {size.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Pagination Dots */}
      <div className="sm:hidden flex items-center justify-center gap-2 pt-2">
        {sizes.map((size, idx) => (
          <button
            key={size.id}
            onClick={() => scrollToCard(idx)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === idx
                ? "w-6 h-2 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : "w-2 h-2 bg-zinc-800 hover:bg-zinc-700"
            }`}
            aria-label={`Go to size slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ============================================================== */}
      {/* CONFIRMATION MODAL                                              */}
      {/* ============================================================== */}
      {confirmingSize && (
        <div
          onClick={() => setConfirmingSize(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-black rounded-2xl border-2 border-red-500/70 p-5 sm:p-6 shadow-[0_0_40px_rgba(239,68,68,0.35)] animate-in zoom-in-95 duration-200 relative text-zinc-100"
          >
            {/* Close Button */}
            <button
              onClick={() => setConfirmingSize(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 block">
                  Confirm Car Size
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white truncate">
                  {confirmingSize.name}
                </h3>
              </div>
            </div>

            {/* Modal Body / Vehicle Details */}
            <div className="space-y-3 mb-6">
              {confirmingSize.imageUrl && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black border border-zinc-800">
                  <Image
                    src={confirmingSize.imageUrl}
                    alt={confirmingSize.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/80 text-zinc-300 border border-white/10">
                    Tier {confirmingSize.sortOrder || "1"}
                  </span>
                </div>
              )}

              <div className="bg-black/70 rounded-xl p-3 border border-zinc-800 text-xs">
                <div className="text-zinc-300 font-semibold mb-1 flex items-center gap-1.5 text-red-400">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Vehicle Category Reference:</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  {confirmingSize.examples}
                </p>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  You will be able to input and verify your specific car model in Step 2 with Gemini AI.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleProceedConfirmed}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all active:scale-95 whitespace-nowrap"
              >
                <span className="whitespace-nowrap">Yes, Proceed to Step 2</span>
                <Check className="w-4 h-4 stroke-[3] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setConfirmingSize(null)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors whitespace-nowrap"
              >
                <span className="whitespace-nowrap">Cancel / Choose Another</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
