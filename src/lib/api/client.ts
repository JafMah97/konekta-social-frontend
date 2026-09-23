// Every request goes to this origin's /api proxy, which forwards to the API
// with the session cookie (see src/app/api/[...path]/route.ts).

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Message the API attached to one input field, if any */
  field(name: string): string | undefined {
    return this.details.find((d) => d.field === name)?.message;
  }
}

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Query;
}

// Requests slower than this are probably a cold start on the free host;
// listeners use it to show a "waking up the server" hint.
const SLOW_MS = 4000;
let pending = 0;
const slowListeners = new Set<(slow: boolean) => void>();
let slowTimer: ReturnType<typeof setTimeout> | undefined;

export function onSlowRequests(listener: (slow: boolean) => void) {
  slowListeners.add(listener);
  return () => void slowListeners.delete(listener);
}

function track(delta: 1 | -1) {
  pending += delta;
  if (delta === 1 && pending === 1) {
    slowTimer = setTimeout(() => slowListeners.forEach((l) => l(true)), SLOW_MS);
  }
  if (pending === 0) {
    clearTimeout(slowTimer);
    slowListeners.forEach((l) => l(false));
  }
}

function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return `/api${path}${qs ? `?${qs}` : ""}`;
}

export async function api<T>(path: string, { method = "GET", body, query }: RequestOptions = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const init: RequestInit = {
    method,
    credentials: "same-origin",
    headers: body !== undefined && !isForm ? { "Content-Type": "application/json" } : undefined,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  };

  track(1);
  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), init);
  } catch {
    throw new ApiError(0, "networkError", "Network error");
  } finally {
    track(-1);
  }

  const text = await res.text();
  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // Non-JSON body (e.g. an HTML error page from the host)
  }

  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string; details?: ApiErrorDetail[] } })?.error;
    throw new ApiError(
      res.status,
      err?.code ?? (res.status === 429 ? "RATE_LIMITED" : "httpError"),
      err?.message ?? res.statusText,
      Array.isArray(err?.details) ? err.details : [],
    );
  }
  return data as T;
}

/** Relative /uploads paths are served by the API, so route them through the proxy. */
export function mediaUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  // The API's schema default points at files that don't exist
  if (/default-(avatar|cover)\./.test(src)) return null;
  if (src.startsWith("/uploads/")) return `/api${src}`;
  return src;
}
