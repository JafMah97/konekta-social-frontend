import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Each person gets one of the palette's accents, derived from their id, so
// their initials, cover fallback and small marks are always the same color.
const SWATCHES = ["tomato", "cobalt", "sun", "mint", "plum"] as const;
export type Swatch = (typeof SWATCHES)[number];

export function swatchFor(id: string): Swatch {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return SWATCHES[Math.abs(hash) % SWATCHES.length];
}

export function initials(name: string | null | undefined, fallback: string): string {
  const source = (name?.trim() || fallback).split(/\s+/);
  const letters = source.length > 1 ? source[0][0] + source[source.length - 1][0] : source[0].slice(0, 2);
  return letters.toUpperCase();
}
