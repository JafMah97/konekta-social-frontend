"use client";

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { comments } from "@/lib/api/endpoints";
import type { Comment } from "@/lib/api/types";
import { patchPost } from "./posts";

type CommentsPage = { comments: Comment[]; pagination: { page: number; pages: number } };
type CommentPages = InfiniteData<CommentsPage, number>;

const key = (postId: string) => ["comments", postId];

function mapComments(data: CommentPages | undefined, fn: (list: Comment[]) => Comment[]) {
  if (!data) return data;
  return { ...data, pages: data.pages.map((page) => ({ ...page, comments: fn(page.comments) })) };
}

/** Pages arrive newest-first; the UI shows them oldest-first. */
export function useComments(postId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: key(postId),
    queryFn: ({ pageParam }) => comments.list(postId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined),
    enabled,
  });
}

export function useAddComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => comments.create(postId, content),
    onSuccess: (comment) => {
      qc.setQueryData<CommentPages>(key(postId), (data) => {
        if (!data?.pages.length) return data;
        const [first, ...rest] = data.pages;
        return { ...data, pages: [{ ...first, comments: [comment, ...first.comments] }, ...rest] };
      });
      patchPost(qc, postId, (p) => ({ ...p, commentsCount: p.commentsCount + 1 }));
    },
  });
}

export function useEditComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => comments.update(postId, id, content),
    onSuccess: (server) =>
      qc.setQueryData<CommentPages>(key(postId), (data) =>
        mapComments(data, (list) => list.map((c) => (c.id === server.id ? { ...c, content: server.content, updatedAt: server.updatedAt } : c))),
      ),
  });
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => comments.remove(id),
    onSuccess: (_res, id) => {
      qc.setQueryData<CommentPages>(key(postId), (data) => mapComments(data, (list) => list.filter((c) => c.id !== id)));
      patchPost(qc, postId, (p) => ({ ...p, commentsCount: Math.max(0, p.commentsCount - 1) }));
    },
  });
}

export function useToggleCommentLike(postId: string) {
  const qc = useQueryClient();
  const patch = (id: string, fn: (c: Comment) => Comment) =>
    qc.setQueryData<CommentPages>(key(postId), (data) => mapComments(data, (list) => list.map((c) => (c.id === id ? fn(c) : c))));

  return useMutation({
    mutationFn: (c: Comment) => (c.isLiked ? comments.unlike(c.id) : comments.like(c.id)),
    onMutate: (c) => patch(c.id, (x) => ({ ...x, isLiked: !c.isLiked, likesCount: Math.max(0, x.likesCount + (c.isLiked ? -1 : 1)) })),
    onError: (_e, c) => patch(c.id, (x) => ({ ...x, isLiked: c.isLiked, likesCount: c.likesCount })),
    onSuccess: (server) => patch(server.id, (x) => ({ ...x, isLiked: server.isLiked, likesCount: server.likesCount })),
  });
}
