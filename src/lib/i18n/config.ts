export const langs = ["en", "ar"] as const;
export type Lang = (typeof langs)[number];
export const defaultLang: Lang = "en";
export const LANG_COOKIE = "lang";

export const isLang = (value: unknown): value is Lang =>
  typeof value === "string" && (langs as readonly string[]).includes(value);

export const dirOf = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

/** Replaces {name} placeholders: fmt("Hi {name}", { name: "Sara" }) */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
