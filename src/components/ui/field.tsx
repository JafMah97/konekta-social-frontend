import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border-[1.5px] border-line bg-surface px-3.5 text-[0.95rem] text-ink placeholder:text-ink-faint transition-colors hover:border-ink-faint focus:border-ink focus:outline-none aria-invalid:border-tomato-ink disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 resize-y py-2.5 leading-relaxed", className)} {...props} />;
}

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: string;
  children: (props: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
  className?: string;
}

/** Label + control + hint/error, wired together for screen readers */
export function Field({ label, hint, error, optional, children, className }: FieldProps) {
  const id = useId();
  const describedBy = error || hint ? `${id}-desc` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {optional ? <span className="text-xs font-normal text-ink-faint">{optional}</span> : null}
      </label>
      {children({ id, ...(error ? { "aria-invalid": true as const } : {}), "aria-describedby": describedBy })}
      {error ? (
        <p id={describedBy} className="text-[0.8rem] text-tomato-ink">
          {error}
        </p>
      ) : hint ? (
        <p id={describedBy} className="text-[0.8rem] text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl bg-tomato/12 px-3.5 py-2.5 text-sm text-tomato-ink">
      {children}
    </p>
  );
}
