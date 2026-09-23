"use client";

import { Switch as S } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-[1.5px] border-ink/70 bg-sunken transition-colors data-[state=checked]:border-ink data-[state=checked]:bg-mint disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <S.Thumb className="block size-5 rounded-full bg-ink shadow transition-transform ltr:translate-x-0.5 rtl:-translate-x-0.5 ltr:data-[state=checked]:translate-x-[1.35rem] rtl:data-[state=checked]:-translate-x-[1.35rem]" />
    </S.Root>
  );
}
