"use client";

import Link from "next/link";
import { InfiniteList } from "@/components/infinite-list";
import { Composer } from "@/components/post/composer";
import { PostCard } from "@/components/post/post-card";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/misc";
import { useViewer } from "@/hooks/people";
import { useFeed, useSavedPosts } from "@/hooks/posts";
import { useHref, useI18n } from "@/lib/i18n/provider";

export function FeedView() {
  const { t } = useI18n();
  const href = useHref();
  const me = useViewer()!;
  const feed = useFeed();
  const items = feed.data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <>
      <PageHeader title={t.feed.title} />
      <div className="border-b border-line px-4 py-4 sm:px-5">
        <Composer me={me} />
      </div>
      <InfiniteList
        {...feed}
        items={items}
        getKey={(p) => p.id}
        render={(p) => <PostCard post={p} />}
        empty={
          <Empty
            mark="cobalt"
            title={t.feed.emptyTitle}
            body={t.feed.emptyBody}
            action={
              <Button asChild>
                <Link href={href("/explore")}>{t.feed.emptyCta}</Link>
              </Button>
            }
          />
        }
      />
    </>
  );
}

export function SavedView() {
  const { t } = useI18n();
  const saved = useSavedPosts();
  const items = saved.data?.pages.flatMap((p) => p.posts) ?? [];
  return (
    <>
      <PageHeader title={t.saved.title} subtitle={t.saved.subtitle} />
      <InfiniteList
        {...saved}
        items={items}
        getKey={(p) => p.id}
        render={(p) => <PostCard post={p} />}
        empty={<Empty mark="sun" body={t.saved.empty} />}
      />
    </>
  );
}
