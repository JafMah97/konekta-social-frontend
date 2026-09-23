# Konekta — frontend

Web client for the [Konekta API](https://github.com/JafMah97/konekta-social-backend) (Fastify, Prisma, PostgreSQL).
Next.js 16 · React 19 · TanStack Query · Tailwind 4 · Radix · English and Arabic (RTL).

## Features

- Home feed with infinite scroll, a composer (text and photo, with who-can-see-it), likes, saves and inline comments
- Profiles with follow and unfollow, follow requests for private accounts, and follower/following lists
- Live notifications over Socket.IO, with an unread badge, toasts and a notifications inbox
- Every auth flow the API supports: sign-up, email code or link, magic link, forgot/reset password, email change
- Settings for profile, avatar and cover, privacy, theme, language, password, email and account deletion
- One-click sign-in to the demo account from the landing page

## How it talks to the API

The browser only calls this app's own origin. `src/app/api/[...path]/route.ts` forwards `/api/*`
to `BACKEND_URL`, and the Socket.IO long-polling transport goes through the same route.

Why: called cross-site, the API's `httpOnly` session cookie is a third-party cookie, which Safari
and any browser that blocks third-party cookies silently drop. Proxied, the cookie is first-party
and gets rewritten to `SameSite=Lax`. The proxy also forwards the client IP, so the API's rate
limits stay per user and aren't shared by every visitor.

`src/proxy.ts` adds the `/en` or `/ar` prefix (keeping the path and query, so emailed links still
work) and redirects between signed-in and signed-out pages based on whether the cookie is present.

## Run it

```bash
cp .env.example .env    # BACKEND_URL=https://konekta-social-backend.onrender.com or http://localhost:4000
npm install
npm run dev             # http://localhost:3000
```

`npm run build && npm start` runs the production build. The API runs on a free host that sleeps
when idle; the app shows a notice while the first request wakes it up.

## Layout

```
src/app/[lang]/          routes: landing, auth/*, (app)/feed, explore, notifications, saved,
                         settings, welcome, posts/[id], users/[id] (+ followers, following)
src/app/api/[...path]/   same-origin proxy to the API
src/components/          ui primitives, shell, post, people, auth, views
src/hooks/               TanStack Query hooks with optimistic updates
src/lib/api/             fetch client, typed endpoints, response types
src/lib/i18n/            dictionaries (Arabic is type-checked against English)
```
