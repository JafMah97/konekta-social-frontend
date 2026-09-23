"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

/** Sticky title bar at the top of the main column */
export function PageHeader({ title, subtitle, back, action }: { title: ReactNode; subtitle?: ReactNode; back?: boolean; action?: ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <div className="sticky top-[var(--sticky-top,0px)] z-20 flex min-h-16 items-center gap-2 border-b border-line bg-paper/85 px-4 py-3 backdrop-blur-md sm:px-5">
      {back && (
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} aria-label={t.common.back} className="-ms-2">
          <ArrowLeft className="rtl:rotate-180" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-semibold leading-tight">{title}</h1>
        {subtitle ? <p className="truncate text-sm text-ink-faint">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
