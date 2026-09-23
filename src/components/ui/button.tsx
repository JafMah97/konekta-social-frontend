import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Ink by default; the tomato hover is the brand's one loud moment
        primary: "bg-ink text-paper hover:bg-tomato hover:text-on-tomato",
        accent: "bg-tomato text-on-tomato hover:bg-ink hover:text-paper",
        outline: "border-[1.5px] border-ink/80 text-ink hover:bg-ink hover:text-paper",
        soft: "bg-sunken text-ink hover:bg-line",
        ghost: "text-ink-soft hover:bg-sunken hover:text-ink",
        danger: "bg-tomato-ink text-white hover:bg-ink hover:text-paper",
      },
      size: {
        sm: "h-8 px-3.5 text-sm",
        md: "h-10 px-5 text-[0.95rem]",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean };

export function Button({ className, variant, size, asChild, loading, disabled, children, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  // Slot needs exactly one child, so the spinner only exists on real buttons
  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
