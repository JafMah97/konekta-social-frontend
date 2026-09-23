import { ar } from "./dictionaries/ar";
import { en } from "./dictionaries/en";
import { defaultLang, isLang, type Lang } from "./config";

const dictionaries = { en, ar };

export function getDictionary(lang: string) {
  return dictionaries[isLang(lang) ? lang : defaultLang];
}

export type { Lang };
