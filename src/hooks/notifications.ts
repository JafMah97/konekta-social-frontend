"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@/lib/api/endpoints";

const UNREAD = ["notifications", "unread"];

export function useUnreadCount(enabled: boolean) {
  return useQuery({ queryKey: UNREAD, queryFn: notifications.unreadCount, enabled, staleTime: 30_000 });
}

export function useNotifications(unreadOnly: boolean) {
  return useInfiniteQuery({
    queryKey: ["notifications", "list", unreadOnly],
    queryFn: ({ pageParam }) => notifications.list(pageParam, unreadOnly),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notifications.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notifications.markAllRead,
    onSuccess: () => {
      qc.setQueryData(UNREAD, 0);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notifications.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
