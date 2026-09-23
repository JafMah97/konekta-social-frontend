"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { PersonSummary } from "@/lib/api/types";
import { useHref } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { FollowButton } from "./follow-button";

interface PersonRowProps {
  person: PersonSummary;
  meta?: ReactNode;
  action?: ReactNode;
  showBio?: boolean;
  className?: string;
}

export function PersonRow({ person, meta, action, showBio = true, className }: PersonRowProps) {
  const href = useHref();
  return (
    <div className={cn("flex items-start gap-3 px-4 py-3.5 sm:px-5", className)}>
      <Link href={href(`/users/${person.id}`)} className="shrink-0">
        <Avatar user={person} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <Link href={href(`/users/${person.id}`)} className="min-w-0 leading-tight">
            <span className="block truncate font-semibold hover:underline">{person.fullName || person.username}</span>
            <span className="block truncate text-sm text-ink-faint" dir="ltr">
              @{person.username}
            </span>
          </Link>
          {action ?? (
            <FollowButton user={person} initial={person.isFollowedByCurrentUser ? "following" : "none"} />
          )}
        </div>
        {showBio && person.bio ? <p dir="auto" className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{person.bio}</p> : null}
        {meta ? <p className="mt-1 text-xs text-ink-faint">{meta}</p> : null}
      </div>
    </div>
  );
}
