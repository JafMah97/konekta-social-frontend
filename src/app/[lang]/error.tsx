"use client";

import { StatusPage } from "@/components/status-page";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  return (
    <StatusPage
      code="500"
      title={t.errors.crashTitle}
      body={t.errors.crashBody}
      action={<Button onClick={reset}>{t.common.retry}</Button>}
    />
  );
}
