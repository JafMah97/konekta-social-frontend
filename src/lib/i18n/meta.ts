import type { Metadata } from "next";
import type { Dictionary } from "./dictionaries/en";
import { getDictionary } from ".";

/** generateMetadata that sets a localized page title */
export const metaTitle =
  (pick: (t: Dictionary) => string) =>
  async ({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> => ({
    title: pick(getDictionary((await params).lang)),
  });
