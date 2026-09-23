"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useCreatePost } from "@/hooks/posts";
import { useErrorMessage } from "@/hooks/use-error-message";
import type { Me, Visibility } from "@/lib/api/types";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { VisibilityPicker } from "./visibility";

const MAX_CHARS = 5000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // the API's multipart limit
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function Composer({ me, autoFocus, onPosted, className }: { me: Me; autoFocus?: boolean; onPosted?: () => void; className?: string }) {
  const { t } = useI18n();
  const errorMessage = useErrorMessage();
  const create = useCreatePost();
  const [text, setText] = useState("");
  // The picked file plus a blob URL for its preview
  const [image, setImageState] = useState<{ file: File; url: string } | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Grow with the text instead of scrolling inside a tiny box
  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 420)}px`;
  }, [text]);

  function setImage(file: File | null) {
    if (image) URL.revokeObjectURL(image.url);
    setImageState(file ? { file, url: URL.createObjectURL(file) } : null);
  }

  function pickImage(file: File | undefined) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return toast.error(t.composer.photoType);
    if (file.size > MAX_IMAGE_BYTES) return toast.error(t.composer.photoTooBig);
    setImage(file);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content && !image) return;
    create.mutate(
      { content, visibility, image: image?.file ?? null },
      {
        onSuccess: () => {
          setText("");
          setImage(null);
          toast.success(t.composer.posted);
          onPosted?.();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  }

  const remaining = MAX_CHARS - text.length;
  const firstName = me.fullName.split(" ")[0] || me.username;

  return (
    <form onSubmit={submit} className={cn("flex gap-3", className)}>
      <Avatar user={me} />
      <div className="min-w-0 flex-1">
        <textarea
          ref={textarea}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
          }}
          placeholder={fmt(t.composer.placeholder, { name: firstName })}
          autoFocus={autoFocus}
          rows={2}
          aria-label={t.nav.newPost}
          className="w-full resize-none bg-transparent pt-2 text-[1.1rem] leading-relaxed placeholder:text-ink-faint focus:outline-none"
        />

        {image && (
          <div className="relative mt-2 overflow-hidden rounded-2xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
            <img src={image.url} alt="" className="max-h-80 w-full object-cover" />
            <Button
              type="button"
              size="icon-sm"
              variant="primary"
              onClick={() => setImage(null)}
              aria-label={t.composer.removePhoto}
              className="absolute end-2 top-2"
            >
              <X />
            </Button>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <input
            ref={fileInput}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              pickImage(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => fileInput.current?.click()} aria-label={t.composer.addPhoto} title={t.composer.addPhoto}>
            <ImagePlus className="text-mint-ink" />
          </Button>
          <VisibilityPicker value={visibility} onChange={setVisibility} />
          <span className={cn("ms-auto text-xs tabular", remaining < 200 ? "text-tomato-ink" : "text-ink-faint", remaining > 1000 && "invisible")}>
            {remaining}
          </span>
          <Button type="submit" size="sm" loading={create.isPending} disabled={!text.trim() && !image}>
            {t.composer.post}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function ComposeDialog({ me, open, onOpenChange }: { me: Me; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t.nav.newPost} className="sm:max-w-xl">
      <Composer me={me} autoFocus onPosted={() => onOpenChange(false)} />
    </Dialog>
  );
}
