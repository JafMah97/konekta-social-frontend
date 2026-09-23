"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useHref, useI18n } from "@/lib/i18n/provider";

/** Full-page message for 404s and crashes, with a big serif numeral */
export function StatusPage({ code, title, body, action }: { code: string; title: string; body: string; action?: ReactNode }) {
  const { t } = useI18n();
  const href = useHref();
  return (
    <div className="flex min-h-dvh flex-col px-4 py-5 sm:px-6">
      <Link href={href("/")} className="w-fit">
        <Logo label={t.meta.title} />
      </Link>
      <main className="flex flex-1 flex-col items-start justify-center gap-4 sm:mx-auto sm:w-full sm:max-w-xl">
        <p aria-hidden className="font-display text-[7rem] font-light italic leading-none text-tomato">{code}</p>
        <h1 className="text-4xl font-medium">{title}</h1>
        <p className="max-w-md text-ink-soft">{body}</p>
        <div className="mt-2 flex gap-2">
          {action}
          <Button asChild variant={action ? "ghost" : "primary"}>
            <Link href={href("/")}>{t.errors.home}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
