"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle, ThemeToggle } from "@/components/prefs";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const PANELS = {
  cobalt: "bg-cobalt text-on-cobalt",
  tomato: "bg-tomato text-on-tomato",
  sun: "bg-sun text-on-sun",
  mint: "bg-mint text-on-mint",
  plum: "bg-plum text-on-plum",
};

interface AuthFrameProps {
  accent: keyof typeof PANELS;
  title: ReactNode;
  subtitle?: ReactNode;
  tagline?: ReactNode;
  children: ReactNode;
}

export function AuthFrame({ accent, title, subtitle, tagline, children }: AuthFrameProps) {
  const { t } = useI18n();
  const href = useHref();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
      <aside className={cn("relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between", PANELS[accent])}>
        <Link href={href("/")} className="relative z-10 w-fit">
          <Logo label={t.meta.title} className="[&_rect:first-child]:fill-current [&_rect:last-child]:stroke-current" />
        </Link>
        <p className="relative z-10 max-w-sm font-display text-4xl font-medium italic leading-tight">{tagline ?? t.meta.description}</p>
        {/* The logo's two shapes, blown up */}
        <svg aria-hidden viewBox="0 0 200 200" className="absolute -bottom-16 -end-16 size-[26rem] opacity-25">
          <rect x="10" y="40" width="110" height="110" rx="36" fill="currentColor" transform="rotate(-10 65 95)" />
          <rect x="70" y="50" width="110" height="110" rx="36" fill="none" stroke="currentColor" strokeWidth="10" transform="rotate(8 125 105)" />
        </svg>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <Link href={href("/")} className="lg:invisible">
            <Logo label={t.meta.title} />
          </Link>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-4 sm:px-8">
          <div className="w-full max-w-sm animate-rise">
            <h1 className="text-[2.1rem] font-medium leading-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-ink-soft">{subtitle}</p> : null}
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-ink-faint">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Result screen for flows that end in a message (link sent, token checked…) */
export function Notice({ tone, children }: { tone: "ok" | "error" | "busy"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl px-4 py-3.5 text-[0.95rem]",
        tone === "ok" && "bg-mint/15 text-mint-ink",
        tone === "error" && "bg-tomato/12 text-tomato-ink",
        tone === "busy" && "bg-sunken text-ink-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2.5 shrink-0 rounded-full",
          tone === "ok" && "bg-mint",
          tone === "error" && "bg-tomato",
          tone === "busy" && "animate-pulse bg-ink-faint",
        )}
      />
      <div>{children}</div>
    </div>
  );
}
