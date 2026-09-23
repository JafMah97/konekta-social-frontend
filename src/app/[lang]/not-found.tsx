"use client";

import { StatusPage } from "@/components/status-page";
import { useI18n } from "@/lib/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();
  return <StatusPage code="404" title={t.errors.notFoundTitle} body={t.errors.notFoundBody} />;
}
