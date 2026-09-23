import type { NextRequest } from "next/server";

// Same-origin proxy to the Fastify API.
//
// Why: the API sets an httpOnly `token` cookie. Called cross-site, that
// cookie is a third-party cookie (SameSite=None) which Safari and any browser
// with third-party cookies blocked silently drop, so login would "succeed"
// and the next request would be anonymous. Proxied, the cookie belongs to
// this origin and can be SameSite=Lax, which also restores CSRF protection.
// The Socket.IO long-polling transport uses the same path (/api/socket.io/).

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");

// Headers worth passing upstream; everything else (origin, host, referer…)
// is dropped so the API sees a server-to-server call, not a CORS request.
const FORWARD_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "cookie",
  "user-agent",
];

// fetch() already decoded the body, so these would describe the wrong bytes
const DROP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "set-cookie",
  // Helmet's CSP is for the API's own pages, not for this app
  "content-security-policy",
]);

function clientIp(req: NextRequest): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || undefined;
}

// Make the API's cookie first-party: Lax instead of None, and no Secure flag
// when this app itself runs on plain http (local dev).
function rewriteSetCookie(cookie: string, secure: boolean): string {
  let out = cookie.replace(/;\s*SameSite=None/i, "; SameSite=Lax");
  if (!/;\s*SameSite=/i.test(out)) out += "; SameSite=Lax";
  if (!secure) out = out.replace(/;\s*Secure/i, "");
  return out.replace(/;\s*Domain=[^;]+/i, "");
}

async function proxy(req: NextRequest): Promise<Response> {
  if (!BACKEND_URL) {
    return Response.json(
      { success: false, error: { code: "configError", message: "BACKEND_URL is not set" } },
      { status: 500 },
    );
  }

  // Keep the raw path (trailing slash included) and query string
  const path = req.nextUrl.pathname.replace(/^\/api/, "");
  const target = `${BACKEND_URL}${path}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Rate limits are per client IP; without this every visitor shares ours
  const ip = clientIp(req);
  if (ip) headers.set("x-forwarded-for", ip);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      // Required by Node when streaming a request body
      ...(hasBody ? { duplex: "half" } : {}),
      redirect: "manual",
      cache: "no-store",
    } as RequestInit);
  } catch {
    return Response.json(
      {
        success: false,
        error: { code: "networkError", message: "The API could not be reached." },
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, name) => {
    if (!DROP_RESPONSE_HEADERS.has(name.toLowerCase())) responseHeaders.set(name, value);
  });
  const secure = req.nextUrl.protocol === "https:";
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", rewriteSetCookie(cookie, secure));
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
  proxy as OPTIONS,
};
