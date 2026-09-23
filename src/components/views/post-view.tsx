"use client";

import { PostSkeletons } from "@/components/infinite-list";
import { PostCard } from "@/components/post/post-card";
import { PageHeader } from "@/components/shell/page-header";
import { Empty } from "@/components/ui/misc";
import { usePost } from "@/hooks/posts";
import { useI18n } from "@/lib/i18n/provider";

export function PostView({ id }: { id: string }) {
  const { t } = useI18n();
  const post = usePost(id);
  return (
    <>
      <PageHeader title={t.post.title} back />
      {post.isPending ? (
        <PostSkeletons count={1} />
      ) : post.data ? (
        <PostCard post={post.data} expanded />
      ) : (
        <Empty mark="tomato" body={t.post.notFound} />
      )}
    </>
  );
}
