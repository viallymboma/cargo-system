import { format, formatDistance, formatRelative, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// Currency formatting for XAF (Central African CFA franc)
export function formatCurrency(
  amount: number,
  options?: {
    currency?: string;
    showSymbol?: boolean;
    locale?: string;
  }
): string {
  const { currency = "XAF", showSymbol = true, locale = "fr-CM" } = options || {};

  // XAF doesn't use decimals
  const formatted = new Intl.NumberFormat(locale, {
    style: showSymbol ? "currency" : "decimal",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return formatted;
}

// Short currency format (e.g., 45M XAF)
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B XAF`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M XAF`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K XAF`;
  }
  return `${amount} XAF`;
}

// Date formatting
export function formatDate(
  date: string | Date,
  formatStr: string = "d MMMM yyyy"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

// Date with time
export function formatDateTime(
  date: string | Date,
  formatStr: string = "d MMMM yyyy, HH:mm"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

// Short date format
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy");
}

// Relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

// Relative time in French
export function formatRelativeTimeFr(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
}

// Relative date (e.g., "yesterday at 10:00")
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatRelative(dateObj, new Date());
}

// Number formatting
export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("fr-CM", options).format(num);
}

// Weight formatting (kg)
export function formatWeight(weight: number, unit: string = "kg"): string {
  return `${formatNumber(weight, { maximumFractionDigits: 2 })} ${unit}`;
}

// Phone number formatting (Cameroon)
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Cameroon phone format: +237 6XX XXX XXX or 237 6XX XXX XXX
  if (cleaned.startsWith("237") && cleaned.length === 12) {
    const parts = cleaned.slice(3);
    return `+237 ${parts.slice(0, 3)} ${parts.slice(3, 6)} ${parts.slice(6)}`;
  }

  // Local format: 6XX XXX XXX
  if (cleaned.length === 9 && cleaned.startsWith("6")) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
}

// Tracking number formatting
export function formatTrackingNumber(trackingNumber: string): string {
  // Format: ST-XXXXXX-XX
  const cleaned = trackingNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (cleaned.length >= 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 8)}-${cleaned.slice(8, 10)}`;
  }
  return trackingNumber;
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Title case
export function titleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}
