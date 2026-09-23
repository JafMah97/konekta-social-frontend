"use client";

import { Bell, Compass, Home, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ComposeDialog } from "@/components/post/composer";
import { LanguageToggle, ThemeToggle } from "@/components/prefs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/hooks/notifications";
import { useMe } from "@/hooks/people";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useLiveNotifications } from "@/hooks/use-live-notifications";
import { ApiError } from "@/lib/api/client";
import type { Me } from "@/lib/api/types";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./account-menu";
import { Badge, SideNavLink, useIsActive, useNavItems } from "./nav-items";
import { RightRail } from "./right-rail";

// Pages a signed-out visitor may still open (shared links)
const PUBLIC_PREFIXES = ["/posts/", "/users/"];

export function AppShell({ children }: { children: ReactNode }) {
  const me = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const href = useHref();
  const rest = pathname.replace(/^\/(en|ar)/, "");
  const isPublic = PUBLIC_PREFIXES.some((p) => rest.startsWith(p));
  const unauthorized = me.error instanceof ApiError && me.error.status === 401;

  // The cookie is there but the API rejects it (revoked or expired): drop it
  // so the route guard stops treating this visitor as signed in.
  useEffect(() => {
    if (!unauthorized) return;
    void fetch("/api/client-session", { method: "DELETE" }).then(() => {
      if (!isPublic) router.replace(`${href("/auth/login")}?next=${encodeURIComponent(rest)}`);
    });
  }, [unauthorized, isPublic, rest, href, router]);

  useLiveNotifications(!!me.data);

  if (me.data) return <SignedInShell me={me.data}>{children}</SignedInShell>;
  if (unauthorized && isPublic) return <GuestShell>{children}</GuestShell>;
  if (me.error && !unauthorized) return <ShellError error={me.error} retry={() => me.refetch()} />;
  return <ShellLoading />;
}

function ShellError({ error, retry }: { error: unknown; retry: () => void }) {
  const { t } = useI18n();
  const errorMessage = useErrorMessage();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <LogoMark className="size-12" />
      <p className="max-w-sm text-ink-soft">{errorMessage(error)}</p>
      <Button variant="outline" onClick={retry}>
        {t.common.retry}
      </Button>
    </div>
  );
}

function ShellLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LogoMark className="size-12 animate-pulse" />
    </div>
  );
}

function SignedInShell({ me, children }: { me: Me; children: ReactNode }) {
  const { t } = useI18n();
  const href = useHref();
  const items = useNavItems(me);
  const isActive = useIsActive();
  const [composing, setComposing] = useState(false);

  return (
    <div className="mx-auto flex max-w-[1260px] justify-center">
      {/* Side rail: icons on tablets, icons + labels on desktop */}
      <aside className="sticky top-0 hidden h-dvh w-[5.25rem] shrink-0 flex-col items-center px-3 py-5 md:flex lg:w-64 lg:items-stretch">
        <Link href={href("/feed")} className="mb-6 px-2">
          <LogoMark className="lg:hidden" />
          <Logo label={t.meta.title} className="hidden lg:inline-flex" />
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {items.map((item) => (
            <SideNavLink key={item.path} item={item} active={isActive(item.path)} />
          ))}
        </nav>
        <Button variant="accent" size="lg" onClick={() => setComposing(true)} className="mt-5 max-lg:size-12 max-lg:px-0" aria-label={t.nav.newPost}>
          <Plus className="lg:hidden" />
          <span className="hidden lg:inline">{t.nav.newPost}</span>
        </Button>
        <div className="mt-auto">
          <AccountMenu
            me={me}
            align="start"
            trigger={
              <button type="button" className="flex w-full items-center gap-3 rounded-full p-1.5 text-start transition-colors hover:bg-sunken lg:pe-3">
                <Avatar user={me} size="sm" />
                <span className="hidden min-w-0 leading-tight lg:block">
                  <span className="block truncate text-sm font-semibold">{me.fullName}</span>
                  <span className="block truncate text-xs text-ink-faint" dir="ltr">@{me.username}</span>
                </span>
              </button>
            }
          />
        </div>
      </aside>

      <main className="min-h-dvh w-full min-w-0 max-w-[640px] pb-24 [--sticky-top:3.5rem] md:border-x md:border-line md:pb-10 md:[--sticky-top:0px]">
        <MobileTopBar me={me} />
        {!me.emailVerified && <VerifyBanner email={me.email} />}
        {children}
      </main>

      <aside className="sticky top-0 hidden h-dvh w-[22rem] shrink-0 overflow-y-auto px-5 py-5 scrollbar-none xl:block">
        <RightRail />
      </aside>

      <MobileTabBar me={me} onCompose={() => setComposing(true)} />
      <ComposeDialog me={me} open={composing} onOpenChange={setComposing} />
    </div>
  );
}

function VerifyBanner({ email }: { email: string }) {
  const { t } = useI18n();
  const href = useHref();
  return (
    <div className="flex items-center gap-3 border-b border-line bg-sun/25 px-4 py-2.5 text-sm sm:px-5">
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-sun-ink" />
      <p className="flex-1">{t.banner.verify}</p>
      <Link href={`${href("/auth/verify-email")}?email=${encodeURIComponent(email)}`} className="link shrink-0 font-semibold">
        {t.banner.verifyAction}
      </Link>
    </div>
  );
}

function MobileTopBar({ me }: { me: Me }) {
  const { t } = useI18n();
  const href = useHref();
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur-md md:hidden">
      <Link href={href("/feed")}>
        <Logo label={t.meta.title} />
      </Link>
      <AccountMenu
        me={me}
        trigger={
          <button type="button" aria-label={t.nav.profile} className="rounded-full">
            <Avatar user={me} size="sm" />
          </button>
        }
      />
    </div>
  );
}

function MobileTabBar({ me, onCompose }: { me: Me; onCompose: () => void }) {
  const { t } = useI18n();
  const href = useHref();
  const isActive = useIsActive();
  const unread = useUnreadCount(true).data ?? 0;

  const tab = (path: string, label: string, icon: ReactNode, badge = 0) => (
    <Link
      href={href(path)}
      aria-label={label}
      aria-current={isActive(path) ? "page" : undefined}
      className={cn("relative flex h-12 flex-1 items-center justify-center rounded-full", isActive(path) ? "text-ink" : "text-ink-faint")}
    >
      {icon}
      {isActive(path) && <span className="absolute bottom-1 size-1 rounded-full bg-tomato" />}
      <Badge count={badge} className="absolute end-[calc(50%-1.4rem)] top-1" />
    </Link>
  );

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-1 border-t border-line bg-paper/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden"
    >
      {tab("/feed", t.nav.home, <Home className="size-6" />)}
      {tab("/explore", t.nav.explore, <Compass className="size-6" />)}
      <div className="flex flex-1 justify-center">
        <Button variant="accent" size="icon" onClick={onCompose} aria-label={t.nav.newPost} className="size-12">
          <Plus className="size-6" />
        </Button>
      </div>
      {tab("/notifications", t.nav.notifications, <Bell className="size-6" />, unread)}
      {tab(`/users/${me.id}`, t.nav.profile, <User className="size-6" />)}
    </nav>
  );
}

function GuestShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const href = useHref();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-4">
          <Link href={href("/")}>
            <Logo label={t.meta.title} />
          </Link>
          <div className="flex items-center gap-1">
            <LanguageToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href={href("/auth/login")}>{t.nav.signIn}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={href("/auth/register")}>{t.nav.createAccount}</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-dvh max-w-[640px] pb-16 [--sticky-top:3.5rem] md:border-x md:border-line">{children}</main>
    </div>
  );
}
