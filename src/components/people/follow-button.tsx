"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useFollow, useFollowStatus, useViewer } from "@/hooks/people";
import { useErrorMessage } from "@/hooks/use-error-message";
import type { FollowStatus } from "@/lib/api/types";
import { fmt } from "@/lib/i18n/config";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  user: { id: string; username: string };
  initial: FollowStatus;
  followsYou?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function FollowButton({ user, initial, followsYou, size = "sm", className }: FollowButtonProps) {
  const { t } = useI18n();
  const href = useHref();
  const router = useRouter();
  const viewer = useViewer();
  const status = useFollowStatus(user.id, initial);
  const follow = useFollow(user.id);
  const errorMessage = useErrorMessage();
  const [confirming, setConfirming] = useState(false);
  const [hover, setHover] = useState(false);

  if (viewer?.id === user.id) return null;

  const run = () =>
    follow.mutate(status, {
      onSuccess: (next) => {
        setConfirming(false);
        if (next === "requested") toast(t.profile.requestSent);
      },
      onError: (e) => toast.error(errorMessage(e)),
    });

  const onClick = () => {
    if (!viewer) return router.push(`${href("/auth/login")}?next=${encodeURIComponent(`/users/${user.id}`)}`);
    if (status === "following") return setConfirming(true);
    run();
  };

  // Resting label, and what the button turns into on hover
  const label =
    status === "following"
      ? hover ? t.profile.unfollow : t.profile.isFollowing
      : status === "requested"
        ? hover ? t.profile.cancelRequest : t.profile.requested
        : followsYou ? t.profile.followBack : t.profile.follow;

  return (
    <>
      <Button
        size={size}
        variant={status === "none" ? "primary" : "outline"}
        loading={follow.isPending}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          "min-w-24",
          status !== "none" && "hover:border-tomato-ink hover:bg-transparent hover:text-tomato-ink",
          className,
        )}
      >
        {label}
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={fmt(t.profile.unfollowTitle, { username: user.username })}
        confirmLabel={t.profile.unfollow}
        cancelLabel={t.common.cancel}
        destructive
        pending={follow.isPending}
        onConfirm={run}
      />
    </>
  );
}
