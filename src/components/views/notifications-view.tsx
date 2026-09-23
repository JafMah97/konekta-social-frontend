"use client";

import { Bell, CheckCheck, Heart, MessageCircle, UserCheck, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InfiniteList, PeopleSkeletons } from "@/components/infinite-list";
import { PageHeader } from "@/components/shell/page-header";
import { FollowRequestsPanel } from "@/components/shell/right-rail";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/misc";
import { useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from "@/hooks/notifications";
import type { AppNotification } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const TYPE_MARK: Record<string, { icon: typeof Heart; className: string }> = {
  like_post: { icon: Heart, className: "bg-tomato text-on-tomato" },
  comment_liked: { icon: Heart, className: "bg-tomato text-on-tomato" },
  comment: { icon: MessageCircle, className: "bg-cobalt text-on-cobalt" },
  follow: { icon: UserPlus, className: "bg-mint text-on-mint" },
  follow_request: { icon: UserPlus, className: "bg-plum text-on-plum" },
  follow_accepted: { icon: UserCheck, className: "bg-mint text-on-mint" },
};

export function NotificationsView() {
  const { t } = useI18n();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const list = useNotifications(unreadOnly);
  const unread = useUnreadCount(true).data ?? 0;
  const markAll = useMarkAllRead();
  const items = list.data?.pages.flatMap((p) => p.notifications) ?? [];

  return (
    <>
      <PageHeader
        title={t.notifications.title}
        action={
          unread > 0 && (
            <Button variant="ghost" size="sm" loading={markAll.isPending} onClick={() => markAll.mutate()}>
              <CheckCheck />
              <span className="hidden sm:inline">{t.notifications.markAllRead}</span>
            </Button>
          )
        }
      />
      <div className="flex gap-1.5 border-b border-line px-4 py-2.5 sm:px-5" role="tablist">
        {[
          { value: false, label: t.notifications.all },
          { value: true, label: t.notifications.unread },
        ].map((tab) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={unreadOnly === tab.value}
            onClick={() => setUnreadOnly(tab.value)}
            className={cn(
              "h-8 rounded-full px-4 text-sm transition-colors",
              unreadOnly === tab.value ? "bg-ink font-medium text-paper" : "text-ink-soft hover:bg-sunken",
            )}
          >
            {tab.label}
            {tab.value && unread > 0 ? <span className="ms-1.5 tabular opacity-70">{unread}</span> : null}
          </button>
        ))}
      </div>

      <div className="border-b border-line p-3 empty:hidden xl:hidden">
        <FollowRequestsPanel />
      </div>

      <InfiniteList
        {...list}
        items={items}
        getKey={(n) => n.id}
        render={(n) => <NotificationRow n={n} />}
        skeleton={<PeopleSkeletons />}
        empty={<Empty mark="plum" body={unreadOnly ? t.notifications.emptyUnread : t.notifications.empty} />}
      />
    </>
  );
}

function NotificationRow({ n }: { n: AppNotification }) {
  const { lang, t } = useI18n();
  const href = useHref();
  const router = useRouter();
  const markRead = useMarkRead();
  const remove = useDeleteNotification();
  const mark = TYPE_MARK[n.type] ?? { icon: Bell, className: "bg-sun text-on-sun" };
  const Icon = mark.icon;
  const verb = t.notifications.types[n.type as keyof typeof t.notifications.types] ?? t.notifications.types.other;

  const open = () => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.link) router.push(href(n.link));
  };

  return (
    <div className={cn("group relative flex gap-3 px-4 py-3.5 transition-colors hover:bg-sunken/60 sm:px-5", !n.isRead && "bg-sun/10")}>
      {!n.isRead && <span aria-hidden className="absolute start-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-tomato" />}
      <div className="relative shrink-0">
        {n.actor ? <Avatar user={n.actor} /> : <span className="block size-11 rounded-full bg-sunken" />}
        <span className={cn("absolute -bottom-1 -end-1 flex size-5 items-center justify-center rounded-full ring-2 ring-paper", mark.className)}>
          <Icon className="size-3" />
        </span>
      </div>
      <button type="button" onClick={open} className="min-w-0 flex-1 text-start">
        <p className="leading-snug">
          <b className="font-semibold">{n.actor?.fullName || n.actor?.username}</b> {verb}
        </p>
        {n.messageText && <p dir="auto" className="mt-1 line-clamp-2 text-sm text-ink-soft">“{n.messageText}”</p>}
        <p className="mt-1 text-xs text-ink-faint">{timeAgo(n.createdAt, lang, t.time.now)}</p>
      </button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t.notifications.delete}
        onClick={() => remove.mutate(n.id)}
        className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-60"
      >
        <X />
      </Button>
    </div>
  );
}
