import type { ReactNode } from "react";

// <html> and <body> live in app/[lang]/layout.tsx so they can carry lang/dir.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
