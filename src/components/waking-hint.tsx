"use client";

import { useEffect, useState } from "react";
import { onSlowRequests } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/provider";

// The API runs on a free host that sleeps when idle; the first request after
// a nap can take ~50s. Say so instead of leaving a spinner unexplained.
export function WakingHint() {
  const { t } = useI18n();
  const [slow, setSlow] = useState(false);
  useEffect(() => onSlowRequests(setSlow), []);
  if (!slow) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-3 z-[60] flex justify-center px-4 animate-rise">
      <p className="flex max-w-md items-start gap-3 rounded-2xl bg-sun px-4 py-3 text-sm text-on-sun shadow-[0_12px_30px_-12px_rgb(0_0_0/0.35)]">
        <span aria-hidden className="mt-1 size-2.5 shrink-0 animate-ping rounded-full bg-ink" />
        {t.common.waking}
      </p>
    </div>
  );
}
