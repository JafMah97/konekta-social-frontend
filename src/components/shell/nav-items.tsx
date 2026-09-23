"use client";

import { Bell, Bookmark, Compass, Home, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useUnreadCount } from "@/hooks/notifications";
import { useHref, useI18n } from "@/lib/i18n/provider";
import type { Me } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

export function useNavItems(me: Me): NavItem[] {
  const { t } = useI18n();
  const unread = useUnreadCount(true).data ?? 0;
  return [
    { path: "/feed", label: t.nav.home, icon: Home },
    { path: "/explore", label: t.nav.explore, icon: Compass },
    { path: "/notifications", label: t.nav.notifications, icon: Bell, badge: unread },
    { path: "/saved", label: t.nav.saved, icon: Bookmark },
    { path: `/users/${me.id}`, label: t.nav.profile, icon: User },
    { path: "/settings", label: t.nav.settings, icon: Settings },
  ];
}

export function useIsActive() {
  const pathname = usePathname();
  const href = useHref();
  return (path: string) => {
    const full = href(path);
    return pathname === full || pathname.startsWith(`${full}/`);
  };
}

export function Badge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato px-1.5 text-[0.7rem] font-semibold text-on-tomato tabular",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SideNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const href = useHref();
  const Icon = item.icon;
  return (
    <Link
      href={href(item.path)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3.5 rounded-full px-3.5 py-2.5 text-[1.02rem] transition-colors lg:pe-5",
        active ? "bg-ink font-semibold text-paper" : "text-ink-soft hover:bg-sunken hover:text-ink",
      )}
    >
      <span className="relative">
        <Icon className="size-[1.35rem]" />
        {item.badge ? <Badge count={item.badge} className="absolute -end-2.5 -top-2 lg:hidden" /> : null}
      </span>
      <span className="hidden lg:inline">{item.label}</span>
      {item.badge ? <Badge count={item.badge} className="ms-auto hidden lg:inline-flex" /> : null}
    </Link>
  );
}
