"use client";

import { DropdownMenu as M } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Menu = M.Root;
export const MenuTrigger = M.Trigger;

export function MenuContent({ className, children, align = "end", ...props }: ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content
        align={align}
        sideOffset={6}
        className={cn(
          "z-50 min-w-48 rounded-2xl border border-line bg-surface p-1.5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.3)] animate-rise",
          className,
        )}
        {...props}
      >
        {children}
      </M.Content>
    </M.Portal>
  );
}

interface ItemProps extends ComponentProps<typeof M.Item> {
  icon?: ReactNode;
  destructive?: boolean;
}

export function MenuItem({ icon, destructive, className, children, ...props }: ItemProps) {
  return (
    <M.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-none data-[highlighted]:bg-sunken [&_svg]:size-4",
        destructive ? "text-tomato-ink" : "text-ink",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </M.Item>
  );
}

export const MenuSeparator = () => <M.Separator className="my-1 h-px bg-line" />;

export function MenuLabel({ children }: { children: ReactNode }) {
  return <M.Label className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-ink-faint">{children}</M.Label>;
}

export const MenuRadioGroup = M.RadioGroup;

export function MenuRadioItem({ className, children, ...props }: ComponentProps<typeof M.RadioItem>) {
  return (
    <M.RadioItem
      className={cn(
        "flex cursor-pointer select-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm outline-none data-[highlighted]:bg-sunken data-[state=checked]:font-semibold",
        className,
      )}
      {...props}
    >
      {children}
      <M.ItemIndicator>
        <span className="block size-2 rounded-full bg-tomato" />
      </M.ItemIndicator>
    </M.RadioItem>
  );
}
