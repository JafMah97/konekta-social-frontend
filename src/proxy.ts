import { NextResponse, type NextRequest } from "next/server";
import { defaultLang, isLang, LANG_COOKIE, type Lang } from "@/lib/i18n/config";

// Pages that need a session. The cookie check is only a fast redirect; the
// API is still the authority (a revoked cookie gets cleared client-side).
const PROTECTED = ["/feed", "/explore", "/notifications", "/saved", "/settings", "/welcome", "/auth/verify-new-email"];
// Pages a signed-in visitor has no use for
const GUEST_ONLY = ["/auth/login", "/auth/register", "/auth/forgot-password"];

const startsWithAny = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

function preferredLang(req: NextRequest): Lang {
  const cookie = req.cookies.get(LANG_COOKIE)?.value;
  if (isLang(cookie)) return cookie;
  const browser = req.headers.get("accept-language")?.split(",")[0]?.split("-")[0];
  return isLang(browser) ? browser : defaultLang;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const [, first, ...rest] = pathname.split("/");

  // Links without a language (emails, notifications) keep their path and query
  if (!isLang(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${preferredLang(req)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const lang = first;
  const path = `/${rest.join("/")}`;
  const signedIn = req.cookies.has("token");

  if (!signedIn && startsWithAny(path, PROTECTED)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/auth/login`;
    url.search = `?next=${encodeURIComponent(path + search)}`;
    return NextResponse.redirect(url);
  }

  if (signedIn && (path === "/" || startsWithAny(path, GUEST_ONLY))) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/feed`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (req.cookies.get(LANG_COOKIE)?.value !== lang) {
    res.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}

export const config = {
  // Everything except the API proxy, Next internals and files with an extension
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
