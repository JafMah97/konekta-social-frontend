import { cn } from "@/lib/utils";

/** Two overlapping rounded squares: two people, one link. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect x="3" y="7" width="17" height="17" rx="6" fill="var(--tomato)" transform="rotate(-8 11.5 15.5)" />
      <rect x="12" y="8" width="17" height="17" rx="6" fill="none" stroke="var(--ink)" strokeWidth="2.6" transform="rotate(6 20.5 16.5)" />
    </svg>
  );
}

export function Logo({ className, label = "Konekta" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-[1.45rem] font-semibold italic leading-none tracking-tight">{label}</span>
    </span>
  );
}
