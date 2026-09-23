"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { posts, type PostInput } from "@/lib/api/endpoints";
import type { Post, Visibility } from "@/lib/api/types";

type PostsPage = { posts: Post[]; pagination: { page: number; pages: number } };
type PostPages = InfiniteData<PostsPage, number>;

// A post can sit in several caches at once (home feed, a profile, saved,
// its own page). These helpers keep every copy in sync.
const LIST_KEYS = [["posts"], ["saved"]] as const;

function mapPages(data: PostPages | undefined, fn: (list: Post[]) => Post[]): PostPages | undefined {
  if (!data) return data;
  return { ...data, pages: data.pages.map((page) => ({ ...page, posts: fn(page.posts) })) };
}

export function patchPost(qc: QueryClient, id: string, fn: (post: Post) => Post) {
  for (const queryKey of LIST_KEYS) {
    qc.setQueriesData<PostPages>({ queryKey }, (data) => mapPages(data, (list) => list.map((p) => (p.id === id ? fn(p) : p))));
  }
  qc.setQueryData<Post>(["post", id], (p) => (p ? fn(p) : p));
}

function removePost(qc: QueryClient, id: string) {
  for (const queryKey of LIST_KEYS) {
    qc.setQueriesData<PostPages>({ queryKey }, (data) => mapPages(data, (list) => list.filter((p) => p.id !== id)));
  }
  qc.removeQueries({ queryKey: ["post", id] });
}

function prependPost(qc: QueryClient, post: Post) {
  for (const queryKey of [["posts", "all"], ["posts", post.author.id]]) {
    qc.setQueryData<PostPages>(queryKey, (data) => {
      if (!data?.pages.length) return data;
      const [first, ...rest] = data.pages;
      return { ...data, pages: [{ ...first, posts: [post, ...first.posts] }, ...rest] };
    });
  }
}

const nextPage = (last: PostsPage) =>
  last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined;

/** The home feed, or one person's posts when authorId is given */
export function useFeed(authorId?: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["posts", authorId ?? "all"],
    queryFn: ({ pageParam }) => posts.list(pageParam, authorId),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled,
  });
}

export function useSavedPosts() {
  return useInfiniteQuery({
    queryKey: ["saved"],
    queryFn: ({ pageParam }) => posts.saved(pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function usePost(id: string) {
  return useQuery({ queryKey: ["post", id], queryFn: () => posts.get(id), retry: false });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => posts.create(input),
    onSuccess: (post) => {
      prependPost(qc, post);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content, visibility }: { id: string; content: string; visibility: Visibility }) =>
      posts.update(id, { content, visibility }),
    onSuccess: (server) => patchPost(qc, server.id, (p) => ({ ...p, ...server, author: p.author })),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => posts.remove(id),
    onSuccess: (_res, id) => {
      removePost(qc, id);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/** Optimistic like/unlike; the server's counts win once it answers. */
export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: Post) => (post.isLiked ? posts.unlike(post.id) : posts.like(post.id)),
    onMutate: (post) =>
      patchPost(qc, post.id, (p) => ({
        ...p,
        isLiked: !post.isLiked,
        likesCount: Math.max(0, p.likesCount + (post.isLiked ? -1 : 1)),
      })),
    onError: (_err, post) =>
      patchPost(qc, post.id, (p) => ({ ...p, isLiked: post.isLiked, likesCount: post.likesCount })),
    onSuccess: (server) =>
      patchPost(qc, server.id, (p) => ({ ...p, isLiked: server.isLiked, likesCount: server.likesCount })),
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: Post) => (post.isSaved ? posts.unsave(post.id) : posts.save(post.id)),
    onMutate: (post) => patchPost(qc, post.id, (p) => ({ ...p, isSaved: !post.isSaved })),
    onError: (_err, post) => patchPost(qc, post.id, (p) => ({ ...p, isSaved: post.isSaved })),
    onSuccess: (server) => {
      patchPost(qc, server.id, (p) => ({ ...p, isSaved: server.isSaved }));
      // Newly saved posts appear on the Saved page next time it loads;
      // unsaved ones stay there (toggled off) so a mis-tap can be undone.
      if (server.isSaved) qc.invalidateQueries({ queryKey: ["saved"], refetchType: "none" });
    },
  });
}
