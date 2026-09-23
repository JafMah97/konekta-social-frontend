"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { mediaUrl } from "@/lib/api/client";
import { account } from "@/lib/api/endpoints";
import type { Me } from "@/lib/api/types";
import { useI18n } from "@/lib/i18n/provider";
import { cn, swatchFor } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const COVER_FILL = { tomato: "bg-tomato", cobalt: "bg-cobalt", sun: "bg-sun", mint: "bg-mint", plum: "bg-plum" };

function useUpload(kind: "avatar" | "cover") {
  const qc = useQueryClient();
  const { t } = useI18n();
  const errorMessage = useErrorMessage();
  return useMutation({
    mutationFn: (file: File) => (kind === "avatar" ? account.uploadAvatar(file) : account.uploadCover(file)),
    onSuccess: () => {
      toast.success(t.welcome.uploaded);
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

function FilePicker({ onPick, children, className, label }: { onPick: (f: File) => void; children: React.ReactNode; className?: string; label: string }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (!TYPES.includes(file.type)) return toast.error(t.composer.photoType);
          if (file.size > MAX_BYTES) return toast.error(t.composer.photoTooBig);
          onPick(file);
        }}
      />
      <button type="button" aria-label={label} onClick={() => input.current?.click()} className={className}>
        {children}
      </button>
    </>
  );
}

/** Cover + avatar with click-to-replace, as they'll appear on the profile */
export function MediaEditor({ me }: { me: Me }) {
  const { t } = useI18n();
  const avatar = useUpload("avatar");
  const cover = useUpload("cover");
  const coverSrc = mediaUrl(me.coverImage);

  return (
    <div>
      <FilePicker
        label={t.welcome.cover}
        onPick={(f) => cover.mutate(f)}
        className={cn("group relative block h-36 w-full overflow-hidden rounded-card sm:h-44", !coverSrc && COVER_FILL[swatchFor(me.id)])}
      >
        {coverSrc && (
          // eslint-disable-next-line @next/next/no-img-element -- remote user media
          <img src={coverSrc} alt="" className="size-full object-cover" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/35">
          <span className="flex items-center gap-2 rounded-full bg-paper/90 px-3.5 py-1.5 text-sm font-medium text-ink opacity-90 shadow">
            {cover.isPending ? <Spinner /> : <Camera className="size-4" />}
            {t.welcome.cover}
          </span>
        </span>
      </FilePicker>
      <FilePicker label={t.welcome.photo} onPick={(f) => avatar.mutate(f)} className="group relative -mt-12 ms-5 block w-fit rounded-full">
        <Avatar user={me} size="xl" className="ring-4 ring-paper" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/0 text-paper transition-colors group-hover:bg-ink/40">
          <span className="flex size-10 items-center justify-center rounded-full bg-ink/70 opacity-90">
            {avatar.isPending ? <Spinner /> : <Camera className="size-5" />}
          </span>
        </span>
      </FilePicker>
    </div>
  );
}
