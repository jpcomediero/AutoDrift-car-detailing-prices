"use client";

import React from "react";

interface RedSquareLoaderProps {
  text?: string;
  className?: string;
}

export function RedSquareLoader({
  text = "Loading AutoDrift Pricing Engine...",
  className = "",
}: RedSquareLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      {/* 9-Square Grid Animation */}
      <div className="loader-grid-container mb-4">
        <div className="square" id="sq1" />
        <div className="square" id="sq2" />
        <div className="square" id="sq3" />
        <div className="square" id="sq4" />
        <div className="square" id="sq5" />
        <div className="square" id="sq6" />
        <div className="square" id="sq7" />
        <div className="square" id="sq8" />
        <div className="square" id="sq9" />
      </div>

      {text && (
        <p className="text-xs sm:text-sm font-bold text-zinc-300 tracking-wider uppercase text-center mt-2 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
