import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";
import { Providers } from "@/components/providers";
import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import { dirOf, isLang, langs } from "@/lib/i18n/config";

export function generateStaticParams() {
  return langs.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { meta } = getDictionary((await params).lang);
  return {
    title: { default: meta.title, template: `%s · ${meta.title}` },
    description: meta.description,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#14110d" },
  ],
};

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} dir={dirOf(lang)} className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers lang={lang} dict={getDictionary(lang)}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
