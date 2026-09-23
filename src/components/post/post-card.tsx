"use client";

import { Bookmark, Heart, Link2, MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { useDeletePost, useToggleLike, useToggleSave } from "@/hooks/posts";
import { useViewer } from "@/hooks/people";
import { useErrorMessage } from "@/hooks/use-error-message";
import { mediaUrl } from "@/lib/api/client";
import type { Post } from "@/lib/api/types";
import { compact, timeAgo } from "@/lib/format";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { Comments } from "./comments";
import { EditPostDialog } from "./edit-post-dialog";
import { VISIBILITY_ICON } from "./visibility";

interface PostCardProps {
  post: Post;
  /** On a post's own page comments start open and the text isn't clamped */
  expanded?: boolean;
}

export function PostCard({ post, expanded = false }: PostCardProps) {
  const { lang, t } = useI18n();
  const href = useHref();
  const router = useRouter();
  const viewer = useViewer();
  const [showComments, setShowComments] = useState(expanded);
  const [liked, setLiked] = useState(false); // drives the pop animation only
  const like = useToggleLike();
  const save = useToggleSave();
  const errorMessage = useErrorMessage();

  const isOwn = viewer?.id === post.author.id;
  const postPath = `/posts/${post.id}`;
  const image = mediaUrl(post.image);
  const VisIcon = post.visibility !== "PUBLIC" ? VISIBILITY_ICON[post.visibility] : null;

  // Guests get sent to sign in, then back here
  const requireViewer = () => {
    if (viewer) return true;
    router.push(`${href("/auth/login")}?next=${encodeURIComponent(postPath)}`);
    return false;
  };

  const onLike = () => {
    if (!requireViewer() || like.isPending) return;
    if (!post.isLiked) setLiked(true);
    like.mutate(post, { onError: (e) => toast.error(errorMessage(e)) });
  };
  const onSave = () => {
    if (!requireViewer() || save.isPending) return;
    save.mutate(post, {
      onSuccess: (p) => toast(p.isSaved ? t.post.savedToast : t.post.unsavedToast),
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  return (
    <article className="px-4 pb-3 pt-4 sm:px-5">
      <header className="flex items-start gap-3">
        <Link href={href(`/users/${post.author.id}`)} className="shrink-0">
          <Avatar user={post.author} />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <Link href={href(`/users/${post.author.id}`)} className="block truncate font-semibold hover:underline">
            {post.author.fullName || post.author.username}
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-faint">
            <span dir="ltr">@{post.author.username}</span>
            <span aria-hidden>·</span>
            <Link href={href(postPath)} className="hover:underline" title={new Date(post.createdAt).toLocaleString(lang)}>
              <time dateTime={post.createdAt}>{timeAgo(post.createdAt, lang, t.time.now)}</time>
            </Link>
            {VisIcon && <VisIcon className="size-3.5" aria-label={t.composer.visibilities[post.visibility]} />}
          </p>
        </div>
        <PostMenu post={post} isOwn={isOwn} />
      </header>

      {post.content && (
        <p dir="auto" className={cn("mt-3 whitespace-pre-wrap break-words text-[1.02rem] leading-relaxed", !expanded && "line-clamp-[12]")}>
          {post.content}
        </p>
      )}

      {image && (
        <Link href={href(postPath)} className="mt-3 block overflow-hidden rounded-2xl border border-line bg-sunken">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote user media */}
          <img src={image} alt="" loading="lazy" className={cn("w-full object-cover", expanded ? "max-h-[80vh] object-contain" : "max-h-[32rem]")} />
        </Link>
      )}

      <footer className="-ms-2 mt-2 flex items-center gap-1 text-sm">
        <button
          type="button"
          onClick={onLike}
          aria-pressed={post.isLiked}
          aria-label={post.isLiked ? t.post.unlike : t.post.like}
          className={cn(
            "group inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 tabular transition-colors hover:bg-tomato/12",
            post.isLiked ? "text-tomato-ink" : "text-ink-soft hover:text-tomato-ink",
          )}
        >
          <Heart
            onAnimationEnd={() => setLiked(false)}
            className={cn("size-[1.15rem]", post.isLiked && "fill-tomato text-tomato", liked && "animate-pop")}
          />
          {post.likesCount > 0 && compact(post.likesCount, lang)}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          aria-expanded={showComments}
          aria-label={t.post.comments}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 tabular transition-colors hover:bg-cobalt/12 hover:text-cobalt-ink",
            showComments ? "text-cobalt-ink" : "text-ink-soft",
          )}
        >
          <MessageCircle className="size-[1.15rem]" />
          {post.commentsCount > 0 && compact(post.commentsCount, lang)}
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-pressed={post.isSaved}
          aria-label={post.isSaved ? t.post.unsave : t.post.save}
          className={cn(
            "ms-auto inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-sun/25",
            post.isSaved ? "text-sun-ink" : "text-ink-soft hover:text-sun-ink",
          )}
        >
          <Bookmark className={cn("size-[1.15rem]", post.isSaved && "fill-sun text-sun-ink")} />
        </button>
      </footer>

      {showComments && <Comments postId={post.id} />}
    </article>
  );
}

function PostMenu({ post, isOwn }: { post: Post; isOwn: boolean }) {
  const { lang, t } = useI18n();
  const href = useHref();
  const router = useRouter();
  const remove = useDeletePost();
  const errorMessage = useErrorMessage();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/${lang}/posts/${post.id}`);
    toast(t.post.linkCopied);
  };

  return (
    <>
      <Menu modal={false}>
        <MenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t.post.options} className="-me-1.5">
            <MoreHorizontal />
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem icon={<Link2 />} onSelect={copyLink}>
            {t.post.copyLink}
          </MenuItem>
          {isOwn && (
            <>
              <MenuSeparator />
              <MenuItem icon={<Pencil />} onSelect={() => setEditing(true)}>
                {t.post.edit}
              </MenuItem>
              <MenuItem icon={<Trash2 />} destructive onSelect={() => setDeleting(true)}>
                {t.post.delete}
              </MenuItem>
            </>
          )}
        </MenuContent>
      </Menu>
      {isOwn && <EditPostDialog post={post} open={editing} onOpenChange={setEditing} />}
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t.post.deleteTitle}
        description={t.post.deleteBody}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(post.id, {
            onSuccess: () => {
              setDeleting(false);
              toast(t.post.deleted);
              // Leave the page of a post that no longer exists
              if (window.location.pathname.endsWith(`/posts/${post.id}`)) router.replace(href("/feed"));
            },
            onError: (e) => toast.error(errorMessage(e)),
          })
        }
      />
    </>
  );
}

