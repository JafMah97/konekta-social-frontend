import { Amiri, Fraunces, IBM_Plex_Sans_Arabic, Instrument_Sans } from "next/font/google";

// Latin glyphs come from the first family in each stack, Arabic ones fall
// through to the second, so mixed-language text renders without switching.
export const display = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const displayArabic = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const sansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const fontVariables = [display, displayArabic, sans, sansArabic].map((f) => f.variable).join(" ");
