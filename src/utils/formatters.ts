import {
  CHECKPOINT_LABELS,
  CURRENCY_LOCALE,
  DATE_LOCALE,
} from "@/config/messages";

export function fmt(n: number): string {
  return `$${n.toLocaleString(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtDt(dt: Date, cp: string): string {
  const d = dt.toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const t = dt.toLocaleTimeString(DATE_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const label = (CHECKPOINT_LABELS as Record<string, string>)[cp] || cp;
  return `${d} ${t} at ${label}`;
}

export function fmtDuration(days: number): string {
  return `${days} day${days !== 1 ? "s" : ""}`;
}
