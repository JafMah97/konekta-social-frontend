"use client";

import { CalendarDays, Link2, Lock, MapPin } from "lucide-react";
import Link from "next/link";
import { InfiniteList } from "@/components/infinite-list";
import { FollowButton } from "@/components/people/follow-button";
import { PostCard } from "@/components/post/post-card";
import { PageHeader } from "@/components/shell/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Empty, Skeleton } from "@/components/ui/misc";
import { useProfile, useViewer } from "@/hooks/people";
import { useFeed } from "@/hooks/posts";
import { ApiError, mediaUrl } from "@/lib/api/client";
import type { Profile } from "@/lib/api/types";
import { compact, monthYear } from "@/lib/format";
import { fmt } from "@/lib/i18n/config";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { cn, swatchFor } from "@/lib/utils";

const COVER_FILL = {
  tomato: "bg-tomato text-on-tomato",
  cobalt: "bg-cobalt text-on-cobalt",
  sun: "bg-sun text-on-sun",
  mint: "bg-mint text-on-mint",
  plum: "bg-plum text-on-plum",
};

export function ProfileView({ id }: { id: string }) {
  const { t } = useI18n();
  const profile = useProfile(id);
  const status = profile.error instanceof ApiError ? profile.error.status : undefined;

  if (profile.isPending) return <ProfileSkeleton />;

  if (status === 403) {
    return (
      <>
        <PageHeader title={t.profile.privateTitle} back />
        <Cover id={id} image={null} />
        <div className="flex flex-col items-center px-6 pb-16 pt-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-ink text-paper">
            <Lock className="size-6" />
          </span>
          <h2 className="mt-4 text-2xl font-semibold">{t.profile.privateTitle}</h2>
          <p className="mt-1.5 max-w-xs text-sm text-ink-soft">{t.profile.privateBody}</p>
          <FollowButton user={{ id, username: "" }} initial="none" size="md" className="mt-6" />
        </div>
      </>
    );
  }

  if (!profile.data) {
    return (
      <>
        <PageHeader title={t.nav.profile} back />
        <Empty mark="tomato" body={status === 404 ? t.profile.notFound : t.common.somethingWrong} />
      </>
    );
  }

  return <LoadedProfile profile={profile.data} />;
}

function LoadedProfile({ profile }: { profile: Profile }) {
  const { lang, t } = useI18n();
  const href = useHref();
  const viewer = useViewer();
  const isOwn = viewer?.id === profile.id;
  const posts = useFeed(profile.id);
  const items = posts.data?.pages.flatMap((p) => p.posts) ?? [];
  const website = profile.website?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <>
      <PageHeader title={profile.fullName} subtitle={fmt("{n} " + t.profile.posts, { n: compact(profile.postsCount, lang) })} back />
      <Cover id={profile.id} image={profile.coverImage} />

      <section className="border-b border-line px-4 pb-5 sm:px-5">
        <div className="flex items-end justify-between gap-3">
          <Avatar user={profile} size="xl" className="-mt-14 ring-4 ring-paper sm:-mt-16" />
          <div className="pb-1">
            {isOwn ? (
              <Button asChild variant="outline" size="sm">
                <Link href={href("/settings")}>{t.profile.editProfile}</Link>
              </Button>
            ) : (
              <FollowButton
                user={profile}
                initial={profile.isFollowedByCurrentUser ? "following" : "none"}
                followsYou={profile.isFollowingCurrentUser}
                size="md"
              />
            )}
          </div>
        </div>

        <h2 className="mt-3 flex items-center gap-2 text-[1.9rem] font-semibold leading-tight">
          {profile.fullName}
          {profile.isPrivate && <Lock className="size-5 text-ink-faint" aria-label={t.settings.privacy.private} />}
        </h2>
        <p className="flex items-center gap-2 text-ink-faint">
          <span dir="ltr">@{profile.username}</span>
          {profile.isFollowingCurrentUser && !isOwn && (
            <span className="rounded-md bg-sunken px-1.5 py-0.5 text-xs font-medium text-ink-soft">{t.profile.followsYou}</span>
          )}
        </p>

        {profile.bio && <p dir="auto" className="mt-3 whitespace-pre-wrap text-[1.02rem] leading-relaxed">{profile.bio}</p>}

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-soft">
          {profile.location && (
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {profile.location}
            </li>
          )}
          {website && (
            <li className="flex items-center gap-1.5">
              <Link2 className="size-4" />
              <a href={profile.website!} target="_blank" rel="noreferrer nofollow" className="link text-cobalt-ink" dir="ltr">
                {website}
              </a>
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {fmt(t.profile.joined, { date: monthYear(profile.createdAt, lang) })}
          </li>
        </ul>

        <div className="mt-4 flex gap-5 text-[0.95rem]">
          <Link href={href(`/users/${profile.id}/following`)} className="hover:underline">
            <b className="font-semibold tabular">{compact(profile.followingCount, lang)}</b>{" "}
            <span className="text-ink-soft">{t.profile.following}</span>
          </Link>
          <Link href={href(`/users/${profile.id}/followers`)} className="hover:underline">
            <b className="font-semibold tabular">{compact(profile.followersCount, lang)}</b>{" "}
            <span className="text-ink-soft">{t.profile.followers}</span>
          </Link>
        </div>
      </section>

      <InfiniteList
        {...posts}
        items={items}
        getKey={(p) => p.id}
        render={(p) => <PostCard post={p} />}
        empty={<Empty mark={swatchFor(profile.id)} body={isOwn ? t.profile.noPostsOwn : t.profile.noPosts} />}
      />
    </>
  );
}

/** Uploaded cover, or a color field in the person's own swatch */
function Cover({ id, image }: { id: string; image: string | null }) {
  const src = mediaUrl(image);
  const swatch = swatchFor(id);
  return (
    <div className={cn("relative h-40 overflow-hidden sm:h-52", !src && COVER_FILL[swatch])}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote user media
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <svg aria-hidden viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" className="size-full opacity-30">
          <rect x="250" y="20" width="120" height="120" rx="38" fill="currentColor" transform="rotate(-12 310 80)" />
          <rect x="300" y="40" width="120" height="120" rx="38" fill="none" stroke="currentColor" strokeWidth="8" transform="rotate(9 360 100)" />
          <circle cx="60" cy="140" r="46" fill="none" stroke="currentColor" strokeWidth="8" />
        </svg>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-16 rounded-none" />
      <Skeleton className="h-40 rounded-none sm:h-52" />
      <div className="px-5">
        <Skeleton className="-mt-14 size-28 rounded-full ring-4 ring-paper" />
        <Skeleton className="mt-4 h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-28" />
        <Skeleton className="mt-5 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    </div>
  );
}
