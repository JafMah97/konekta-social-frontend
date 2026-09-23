"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dictionary } from "./dictionaries/en";
import type { Lang } from "./config";

const I18nContext = createContext<{ lang: Lang; t: Dictionary } | null>(null);

export function I18nProvider({ lang, dict, children }: { lang: Lang; dict: Dictionary; children: ReactNode }) {
  return <I18nContext.Provider value={{ lang, t: dict }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Builds a path in the current language: href("/feed") → "/ar/feed" */
export function useHref() {
  const { lang } = useI18n();
  return (path: string) => `/${lang}${path === "/" ? "" : path}`;
}
