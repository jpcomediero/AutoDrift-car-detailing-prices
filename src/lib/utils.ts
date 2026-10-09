import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format amount to Philippine Peso currency format (₱1,500)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₱0";
  }
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("PHP", "₱").trim();
}

/**
 * Format duration in minutes to human-readable string (e.g., "45 mins", "1 hr 30 mins")
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "30 mins";
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMins} mins`;
  } else if (hours > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  } else {
    return `${remainingMins} mins`;
  }
}

/**
 * Check if a promo / sale price is currently active
 */
export function isSaleActive(
  salePrice?: number | null,
  saleStart?: Date | string | null,
  saleEnd?: Date | string | null
): boolean {
  if (salePrice === null || salePrice === undefined || salePrice <= 0) {
    return false;
  }

  const now = new Date();

  if (saleStart && new Date(saleStart) > now) {
    return false;
  }

  if (saleEnd && new Date(saleEnd) < now) {
    return false;
  }

  return true;
}

/**
 * Format date for audit logs and last updated timestamps
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}
