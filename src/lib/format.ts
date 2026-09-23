import type { Lang } from "./i18n/config";

const locale = (lang: Lang) => (lang === "ar" ? "ar" : "en");

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "3h ago" style, or an absolute date once a post is older than a week */
export function timeAgo(iso: string, lang: Lang, nowLabel: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return nowLabel;
  if (seconds > 60 * 60 * 24 * 7) return shortDate(iso, lang);
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: "auto", style: "narrow" });
  for (const [unit, size] of UNITS) {
    if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit);
  }
  return rtf.format(-Math.max(1, Math.floor(seconds / 60)), "minute");
}

export function shortDate(iso: string, lang: Lang): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(locale(lang), {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function monthYear(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(locale(lang), { month: "long", year: "numeric" });
}

/** 1234 → "1.2K" */
export function compact(n: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang), { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
