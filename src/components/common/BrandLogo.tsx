"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";

interface BrandIconProps {
  className?: string;
  iconClassName?: string;
}

export function BrandIcon({
  className = "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20",
  iconClassName = "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10",
}: BrandIconProps) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl shrink-0 flex items-center justify-center bg-zinc-900/80 border border-zinc-800 shadow-[0_0_20px_rgba(239,68,68,0.25)] ${className}`}
      >
        <img
          src="/images/icon.png"
          alt="AutoDrift Icon"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Graceful fallback if /images/icon.png is not uploaded yet
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] shrink-0 ${className}`}
    >
      <Sparkles className={`${iconClassName} text-white stroke-[2.5]`} />
    </div>
  );
}

interface BrandLogoProps {
  className?: string;
  showIcon?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  subtitle?: string;
  iconClassName?: string;
  logoClassName?: string;
}

export function BrandLogo({
  className = "",
  showIcon = true,
  showBadge = false,
  badgeText = "Studio",
  subtitle,
  iconClassName = "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20",
  logoClassName = "h-11 sm:h-14 md:h-16 lg:h-20 w-auto object-contain",
}: BrandLogoProps) {
  const [logoImgError, setLogoImgError] = useState(false);

  return (
    <div className={`flex items-center gap-3 sm:gap-4 min-w-0 ${className}`}>
      {/* Emblem / Icon Badge (Optional) */}
      {showIcon && <BrandIcon className={iconClassName} />}

      {/* Brand Text or Custom Logo Image */}
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          {!logoImgError ? (
            <img
              src="/images/logo.png"
              alt="AutoDrift Logo"
              className={`${logoClassName} max-w-[280px] sm:max-w-[400px] md:max-w-[520px]`}
              onError={() => setLogoImgError(true)}
            />
          ) : (
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-wider text-white">
              AUTODRIFT
            </span>
          )}

          {showBadge && badgeText && (
            <span className="text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-md bg-red-600/20 text-red-500 border border-red-600/40 shrink-0">
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-400 font-medium truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
