"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { account, people } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { FollowStatus, Me, Profile } from "@/lib/api/types";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: account.me,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    staleTime: 60_000,
  });
}

/** Current user when signed in, otherwise null (never throws on 401). */
export function useViewer(): Me | null {
  return useMe().data ?? null;
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => people.profile(id),
    retry: (count, err) => !(err instanceof ApiError && [403, 404].includes(err.status)) && count < 2,
  });
}

export function usePeopleList(kind: "followers" | "following", id: string) {
  return useInfiniteQuery({
    queryKey: [kind, id],
    queryFn: ({ pageParam }) => (kind === "followers" ? people.followers(id, pageParam) : people.following(id, pageParam)),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined),
    retry: false,
  });
}

export function useSuggestions() {
  return useQuery({ queryKey: ["suggestions"], queryFn: people.suggestions, staleTime: 60_000 });
}

export function useFollowRequests(enabled = true) {
  return useQuery({ queryKey: ["follow-requests"], queryFn: people.requests, enabled });
}

/**
 * Follow state for one person, shared by every button that shows them.
 * The API only reports "following" in profiles, so a pending request is
 * remembered here after the POST says "requested".
 */
export function useFollowStatus(userId: string, initial: FollowStatus) {
  const { data } = useQuery({
    queryKey: ["follow-status", userId],
    queryFn: () => initial,
    initialData: initial,
    staleTime: Infinity,
  });
  return data;
}

export function useFollow(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (current: FollowStatus) => (current === "none" ? people.follow(userId) : people.unfollow(userId)),
    onSuccess: (status) => {
      qc.setQueryData<FollowStatus>(["follow-status", userId], status);
      qc.setQueryData<Profile>(["user", userId], (p) =>
        p
          ? {
              ...p,
              isFollowedByCurrentUser: status === "following",
              followersCount: p.followersCount + (status === "following" && !p.isFollowedByCurrentUser ? 1 : 0) - (status === "none" && p.isFollowedByCurrentUser ? 1 : 0),
            }
          : p,
      );
      // Their posts join or leave the feed; counts and suggestions shift
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["user", userId] });
      qc.invalidateQueries({ queryKey: ["followers", userId] });
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["suggestions"], refetchType: "none" });
    },
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "reject" }) => people.respond(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-requests"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
