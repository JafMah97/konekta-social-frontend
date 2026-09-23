"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/api/client";
import { cn, initials, swatchFor } from "@/lib/utils";

const SIZES = {
  xs: "size-7 text-[0.65rem]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
  xl: "size-28 text-3xl sm:size-32",
};

const FILLS = {
  tomato: "bg-tomato text-on-tomato",
  cobalt: "bg-cobalt text-on-cobalt",
  sun: "bg-sun text-on-sun",
  mint: "bg-mint text-on-mint",
  plum: "bg-plum text-on-plum",
};

interface AvatarProps {
  user: { id: string; username: string; fullName?: string | null; profileImage?: string | null };
  size?: keyof typeof SIZES;
  className?: string;
}

export function Avatar({ user, size = "md", className }: AvatarProps) {
  const src = mediaUrl(user.profileImage);
  const [failed, setFailed] = useState(false);
  const base = cn("relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full", SIZES[size], className);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote user media, sizes vary
      <img src={src} alt="" className={cn(base, "bg-sunken object-cover")} onError={() => setFailed(true)} />
    );
  }
  return (
    <span aria-hidden className={cn(base, FILLS[swatchFor(user.id)], "font-display font-semibold")}>
      {initials(user.fullName, user.username)}
    </span>
  );
}
