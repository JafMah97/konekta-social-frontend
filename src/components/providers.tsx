"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api/client";
import { I18nProvider } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { dirOf, type Lang } from "@/lib/i18n/config";
import { WakingHint } from "./waking-hint";

export function Providers({ lang, dict, children }: { lang: Lang; dict: Dictionary; children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20_000,
            refetchOnWindowFocus: false,
            // 4xx answers won't change on retry
            retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
          },
        },
      }),
  );

  return (
    <I18nProvider lang={lang} dict={dict}>
      <QueryClientProvider client={client}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <WakingHint />
          <Toaster
            position="bottom-center"
            dir={dirOf(lang)}
            toastOptions={{
              classNames: {
                toast:
                  "!rounded-2xl !border !border-line !bg-ink !text-paper !font-sans !shadow-[0_16px_40px_-16px_rgb(0_0_0/0.4)]",
                description: "!text-paper/70",
                actionButton: "!bg-tomato !text-on-tomato !rounded-full",
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
