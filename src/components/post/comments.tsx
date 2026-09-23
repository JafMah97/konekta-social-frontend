"use client";

import { Heart, MoreHorizontal, Pencil, SendHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { Skeleton } from "@/components/ui/misc";
import { useAddComment, useComments, useDeleteComment, useEditComment, useToggleCommentLike } from "@/hooks/comments";
import { useViewer } from "@/hooks/people";
import { useErrorMessage } from "@/hooks/use-error-message";
import type { Comment } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function Comments({ postId }: { postId: string }) {
  const { t } = useI18n();
  const href = useHref();
  const viewer = useViewer();
  const query = useComments(postId, true);
  // Pages come newest-first; read top to bottom like a conversation
  const list = (query.data?.pages.flatMap((p) => p.comments) ?? []).slice().reverse();

  return (
    <div className="mt-2 border-t border-line pt-3">
      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="link mb-3 text-sm text-ink-soft"
        >
          {t.comments.earlier}
        </button>
      )}

      {query.isPending ? (
        <div className="flex flex-col gap-3 pb-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-2.5">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-12 flex-1 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="pb-2 text-sm text-ink-faint">{t.comments.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((c) => (
            <CommentItem key={c.id} comment={c} postId={postId} isOwn={viewer?.id === c.author.id} canReact={!!viewer} />
          ))}
        </ul>
      )}

      {viewer ? (
        <CommentInput postId={postId} />
      ) : (
        <p className="mt-3 text-sm text-ink-soft">
          <Link href={`${href("/auth/login")}?next=${encodeURIComponent(`/posts/${postId}`)}`} className="link text-ink">
            {t.nav.signIn}
          </Link>{" "}
          · {t.post.signInToReact}
        </p>
      )}
    </div>
  );
}

function CommentItem({ comment, postId, isOwn, canReact }: { comment: Comment; postId: string; isOwn: boolean; canReact: boolean }) {
  const { lang, t } = useI18n();
  const href = useHref();
  const errorMessage = useErrorMessage();
  const like = useToggleCommentLike(postId);
  const edit = useEditComment(postId);
  const remove = useDeleteComment(postId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [deleting, setDeleting] = useState(false);

  return (
    <li className="group flex gap-2.5 animate-rise">
      <Link href={href(`/users/${comment.author.id}`)} className="shrink-0">
        <Avatar user={comment.author} size="xs" className="mt-0.5" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-ss-md bg-sunken px-3.5 py-2">
          <Link href={href(`/users/${comment.author.id}`)} className="text-sm font-semibold hover:underline">
            {comment.author.fullName || comment.author.username}
          </Link>
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                edit.mutate(
                  { id: comment.id, content: draft.trim() },
                  { onSuccess: () => setEditing(false), onError: (err) => toast.error(errorMessage(err)) },
                );
              }}
              className="mt-1 flex flex-col gap-2"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
                autoFocus
                rows={2}
                className="w-full resize-none rounded-lg bg-surface px-2.5 py-1.5 text-[0.95rem] focus:outline-none"
              />
              <div className="flex justify-end gap-1.5">
                <Button type="button" size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(comment.content); }}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" size="sm" loading={edit.isPending}>
                  {t.common.save}
                </Button>
              </div>
            </form>
          ) : (
            <p dir="auto" className="whitespace-pre-wrap break-words text-[0.95rem] leading-snug">{comment.content}</p>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 ps-3 text-xs text-ink-faint">
          <time dateTime={comment.createdAt}>{timeAgo(comment.createdAt, lang, t.time.now)}</time>
          <button
            type="button"
            disabled={!canReact || like.isPending}
            onClick={() => like.mutate(comment, { onError: (e) => toast.error(errorMessage(e)) })}
            aria-pressed={comment.isLiked}
            aria-label={comment.isLiked ? t.post.unlike : t.post.like}
            className={cn("inline-flex items-center gap-1 tabular hover:text-tomato-ink disabled:hover:text-ink-faint", comment.isLiked && "font-semibold text-tomato-ink")}
          >
            <Heart className={cn("size-3.5", comment.isLiked && "fill-tomato text-tomato")} />
            {comment.likesCount > 0 && comment.likesCount}
          </button>
          {isOwn && !editing && (
            <Menu modal={false}>
              <MenuTrigger asChild>
                <button type="button" aria-label={t.comments.options} className="rounded-full p-0.5 opacity-60 hover:opacity-100 group-hover:opacity-100">
                  <MoreHorizontal className="size-4" />
                </button>
              </MenuTrigger>
              <MenuContent align="start">
                <MenuItem icon={<Pencil />} onSelect={() => setEditing(true)}>
                  {t.comments.edit}
                </MenuItem>
                <MenuItem icon={<Trash2 />} destructive onSelect={() => setDeleting(true)}>
                  {t.comments.delete}
                </MenuItem>
              </MenuContent>
            </Menu>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t.comments.deleteTitle}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(comment.id, {
            onSuccess: () => {
              setDeleting(false);
              toast(t.comments.deleted);
            },
            onError: (e) => toast.error(errorMessage(e)),
          })
        }
      />
    </li>
  );
}

function CommentInput({ postId }: { postId: string }) {
  const { t } = useI18n();
  const viewer = useViewer()!;
  const add = useAddComment(postId);
  const errorMessage = useErrorMessage();
  const [text, setText] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    add.mutate(content, {
      onSuccess: () => setText(""),
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  return (
    <form onSubmit={submit} className="mt-3 flex items-center gap-2.5">
      <Avatar user={viewer} size="xs" />
      <div className="flex flex-1 items-center rounded-full border-[1.5px] border-line bg-surface pe-1 transition-colors focus-within:border-ink">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          placeholder={t.comments.placeholder}
          aria-label={t.comments.placeholder}
          className="h-9 min-w-0 flex-1 bg-transparent ps-3.5 text-[0.95rem] placeholder:text-ink-faint focus:outline-none"
        />
        <Button type="submit" size="icon-sm" variant="ghost" loading={add.isPending} disabled={!text.trim()} aria-label={t.comments.send}>
          {!add.isPending && <SendHorizontal className="text-cobalt-ink rtl:rotate-180" />}
        </Button>
      </div>
    </form>
  );
}
