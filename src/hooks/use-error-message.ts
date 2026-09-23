"use client";

import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/provider";

/** Turns anything thrown by the API client into a sentence for the user. */
export function useErrorMessage() {
  const { t } = useI18n();
  return (err: unknown): string => {
    if (err instanceof ApiError) {
      if (err.status === 0 || err.status === 502) return t.common.networkError;
      if (err.status === 429) return t.common.rateLimited;
      if (err.code === "demoAccountReadOnly") return t.settings.demoLocked;
      if (err.message && err.status < 500) return err.message;
    }
    return t.common.somethingWrong;
  };
}
