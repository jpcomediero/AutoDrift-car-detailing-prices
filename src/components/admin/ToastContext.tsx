"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: {
    type?: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      type = "success",
      title,
      message,
      duration = 4000,
    }: {
      type?: ToastType;
      title: string;
      message?: string;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: "warning", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Floating Snackbar Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl p-4 sm:p-4.5 border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-4 fade-in duration-200 relative overflow-hidden flex items-start justify-between gap-3 ${
                isSuccess
                  ? "bg-zinc-950/95 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)] text-zinc-100"
                  : isError
                  ? "bg-zinc-950/95 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.35)] text-zinc-100"
                  : isWarning
                  ? "bg-zinc-950/95 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] text-zinc-100"
                  : "bg-zinc-950/95 border-zinc-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] text-zinc-100"
              }`}
            >
              {/* Left Accent Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                )}
                {isError && (
                  <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                    <AlertCircle className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                )}
                {isWarning && (
                  <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <AlertTriangle className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                )}
                {!isSuccess && !isError && !isWarning && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300">
                    <Info className="w-4.5 h-4.5" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-1">
                <h4
                  className={`font-black text-sm tracking-tight ${
                    isSuccess
                      ? "text-emerald-400"
                      : isError
                      ? "text-red-400"
                      : isWarning
                      ? "text-amber-400"
                      : "text-white"
                  }`}
                >
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed whitespace-pre-line">
                    {toast.message}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Subtle animated timer line at the bottom */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-[3px] ${
                  isSuccess
                    ? "bg-emerald-500/80"
                    : isError
                    ? "bg-red-500/80"
                    : isWarning
                    ? "bg-amber-500/80"
                    : "bg-zinc-600"
                }`}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
