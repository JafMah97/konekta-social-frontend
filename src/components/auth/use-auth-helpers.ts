"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useHref } from "@/lib/i18n/provider";

/** Only same-site paths are allowed as ?next= targets (no open redirects). */
export function useNextPath(fallback = "/feed") {
  const next = useSearchParams().get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

/** After any sign-in: forget the old session's cache and enter the app. */
export function useEnterApp() {
  const router = useRouter();
  const href = useHref();
  const qc = useQueryClient();
  return (path: string) => {
    qc.clear();
    router.replace(href(path));
    router.refresh();
  };
}

/**
 * Runs an effect exactly once per mount, even under React strict mode's
 * double effects: emailed tokens are single-use, so a second POST would
 * report a valid link as expired.
 */
export function useRunOnce(run: () => void) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
