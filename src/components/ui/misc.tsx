import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-sunken", className)} />;
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-card border border-line bg-surface", className)}>{children}</section>;
}

interface EmptyProps {
  title?: ReactNode;
  body: ReactNode;
  action?: ReactNode;
  mark?: "tomato" | "cobalt" | "sun" | "mint" | "plum";
}

const MARKS = {
  tomato: "bg-tomato",
  cobalt: "bg-cobalt",
  sun: "bg-sun",
  mint: "bg-mint",
  plum: "bg-plum",
};

/** Empty/zero state: a small stack of colored chips instead of a stock illustration */
export function Empty({ title, body, action, mark = "sun" }: EmptyProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div aria-hidden className="relative mb-5 h-10 w-16">
        <span className="absolute start-0 top-2 size-8 rounded-full bg-sunken" />
        <span className={cn("absolute start-4 top-0 size-8 rotate-12 rounded-[10px]", MARKS[mark])} />
        <span className="absolute start-9 top-3 size-6 rounded-full border-2 border-ink" />
      </div>
      {title ? <h3 className="font-display text-xl font-semibold">{title}</h3> : null}
      <p className="mt-1.5 max-w-xs text-sm text-ink-soft">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
