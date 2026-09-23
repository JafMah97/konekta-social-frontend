"use client";

import { Languages, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { LANG_COOKIE, langs, type Lang } from "@/lib/i18n/config";
import { Button } from "./ui/button";
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "./ui/menu";

/** Same page in the other language (a full load so <html dir> flips). */
export function useSwitchLang() {
  const pathname = usePathname();
  return (next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, "");
    window.location.assign(`/${next}${rest}${window.location.search}`);
  };
}

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, t } = useI18n();
  const switchLang = useSwitchLang();
  const other: Lang = lang === "en" ? "ar" : "en";
  return (
    <Button variant="ghost" size="sm" className={className} onClick={() => switchLang(other)} lang={other}>
      <Languages />
      {t.nav.languages[other]}
    </Button>
  );
}

export function ThemeToggle() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t.nav.theme}>
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </MenuTrigger>
      <MenuContent className="min-w-40">
        <MenuRadioGroup value={theme} onValueChange={setTheme}>
          <MenuRadioItem value="light">{t.nav.themes.light}</MenuRadioItem>
          <MenuRadioItem value="dark">{t.nav.themes.dark}</MenuRadioItem>
          <MenuRadioItem value="system">{t.nav.themes.system}</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

/** Theme + language as radio groups, for the account menu */
export function PrefsMenuItems() {
  const { lang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const switchLang = useSwitchLang();
  return (
    <>
      <MenuLabel>{t.nav.theme}</MenuLabel>
      <MenuRadioGroup value={theme} onValueChange={setTheme}>
        <MenuRadioItem value="light">
          <span className="flex items-center gap-2.5"><Sun className="size-4" />{t.nav.themes.light}</span>
        </MenuRadioItem>
        <MenuRadioItem value="dark">
          <span className="flex items-center gap-2.5"><Moon className="size-4" />{t.nav.themes.dark}</span>
        </MenuRadioItem>
        <MenuRadioItem value="system">
          <span className="flex items-center gap-2.5"><Monitor className="size-4" />{t.nav.themes.system}</span>
        </MenuRadioItem>
      </MenuRadioGroup>
      <MenuLabel>{t.nav.language}</MenuLabel>
      <MenuRadioGroup value={lang} onValueChange={(v) => switchLang(v as Lang)}>
        {langs.map((l) => (
          <MenuRadioItem key={l} value={l} lang={l}>
            {t.nav.languages[l]}
          </MenuRadioItem>
        ))}
      </MenuRadioGroup>
    </>
  );
}
