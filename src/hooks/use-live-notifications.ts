"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import type { AppNotification } from "@/lib/api/types";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { connectSocket } from "@/lib/socket";

/** Listens for the API's `notification` event while signed in. */
export function useLiveNotifications(enabled: boolean) {
  const qc = useQueryClient();
  const router = useRouter();
  const href = useHref();
  const { t } = useI18n();

  useEffect(() => {
    if (!enabled) return;
    const socket = connectSocket();

    socket.on("notification", (n: AppNotification) => {
      qc.setQueryData<number>(["notifications", "unread"], (c) => (c ?? 0) + 1);
      qc.invalidateQueries({ queryKey: ["notifications", "list"] });
      if (n.type === "follow_request") qc.invalidateQueries({ queryKey: ["follow-requests"] });
      if (n.type === "follow" || n.type === "follow_accepted") qc.invalidateQueries({ queryKey: ["me"] });

      const verb = t.notifications.types[n.type as keyof typeof t.notifications.types] ?? t.notifications.types.other;
      const who = n.actor?.fullName || n.actor?.username || "";
      toast(`${who} ${verb}`, {
        description: n.messageText ?? undefined,
        action: n.link ? { label: "→", onClick: () => router.push(href(n.link!)) } : undefined,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, qc, router, href, t]);
}
