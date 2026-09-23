import { Cairo, Fraunces, Instrument_Sans } from "next/font/google";

// Latin glyphs come from the first family in each stack, Arabic ones fall
// through to the second, so mixed-language text renders without switching.
export const display = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

// One Arabic family for body and headings
export const arabic = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const fontVariables = [display, sans, arabic].map((f) => f.variable).join(" ");
