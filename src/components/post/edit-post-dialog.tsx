"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/field";
import { useUpdatePost } from "@/hooks/posts";
import { useErrorMessage } from "@/hooks/use-error-message";
import type { Post, Visibility } from "@/lib/api/types";
import { useI18n } from "@/lib/i18n/provider";
import { VisibilityPicker } from "./visibility";

export function EditPostDialog({ post, open, onOpenChange }: { post: Post; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useI18n();
  const update = useUpdatePost();
  const errorMessage = useErrorMessage();
  const [content, setContent] = useState(post.content ?? "");
  const [visibility, setVisibility] = useState<Visibility>(post.visibility);

  // Start from the post's current state each time the dialog opens
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setContent(post.content ?? "");
      setVisibility(post.visibility);
    }
    onOpenChange(next);
  };

  const unchanged = content.trim() === (post.content ?? "") && visibility === post.visibility;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} title={t.post.edit} className="sm:max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate(
            { id: post.id, content: content.trim(), visibility },
            {
              onSuccess: () => {
                toast(t.post.updated);
                onOpenChange(false);
              },
              onError: (err) => toast.error(errorMessage(err)),
            },
          );
        }}
        className="flex flex-col gap-4"
      >
        <Textarea value={content} onChange={(e) => setContent(e.target.value.slice(0, 5000))} rows={6} autoFocus aria-label={t.post.edit} />
        <div className="flex items-center justify-between gap-2">
          <VisibilityPicker value={visibility} onChange={setVisibility} />
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={update.isPending} disabled={unchanged || (!content.trim() && !post.image)}>
              {t.common.save}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
