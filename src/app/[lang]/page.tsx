import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { DemoButton } from "@/components/demo-button";
import { LanguageToggle, ThemeToggle } from "@/components/prefs";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const API_DOCS = "https://konekta-social-backend.onrender.com/docs";
const SOURCE = "https://github.com/JafMah97/konekta-social-backend";

// Sample cards in the hero: color, tilt and offset per card
const CARD_STYLE = [
  { chip: "bg-cobalt text-on-cobalt", tilt: "-rotate-3", pos: "lg:translate-x-6" },
  { chip: "bg-tomato text-on-tomato", tilt: "rotate-2", pos: "lg:-translate-x-10" },
  { chip: "bg-mint text-on-mint", tilt: "-rotate-1", pos: "lg:translate-x-12" },
];
const POINT_COLORS = ["text-tomato-ink", "text-cobalt-ink", "text-mint-ink"];

export default async function Landing({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const l = t.landing;
  const href = (p: string) => `/${lang}${p}`;

  return (
    <div className="overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo label={t.meta.title} />
        <nav className="flex items-center gap-1">
          <LanguageToggle className="hidden sm:inline-flex" />
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="ms-1">
            <Link href={href("/auth/login")}>{l.signIn}</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-16">
          <div>
            <p className="inline-block -rotate-2 rounded-md bg-sun px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-on-sun">
              {l.eyebrow}
            </p>
            <h1 className="mt-6 text-[2.75rem] font-medium leading-[1.02] sm:text-6xl lg:text-[4.6rem]">
              {l.titleA}{" "}
              <em className="relative font-normal italic">
                <span className="relative z-10">{l.titleEm}</span>
                <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-1 start-0 z-0 h-3.5 w-full text-tomato">
                  <path d="M3 14 C 60 4, 140 4, 297 10" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">{l.lead}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <DemoButton variant="accent" size="lg">{l.demo}</DemoButton>
              <Button asChild variant="outline" size="lg">
                <Link href={href("/auth/register")}>{l.create}</Link>
              </Button>
            </div>
            <p className="mt-3 text-sm text-ink-faint">{l.demoHint}</p>
          </div>

          <div aria-hidden className="relative mx-auto flex w-full max-w-md flex-col gap-4 lg:gap-0">
            {l.samples.map((s, i) => (
              <article
                key={s.handle}
                className={cn(
                  "rounded-card border border-line bg-surface p-5 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)] lg:-mb-3",
                  CARD_STYLE[i].tilt,
                  CARD_STYLE[i].pos,
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-10 items-center justify-center rounded-full font-display text-sm font-semibold", CARD_STYLE[i].chip)}>
                    {s.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <div className="leading-tight">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-ink-faint">@{s.handle} · {l.sampleMeta}</p>
                  </div>
                </div>
                <p className="mt-3 leading-relaxed">{s.text}</p>
                <div className="mt-4 flex gap-5 text-sm text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className={cn("size-4", i === 1 && "fill-tomato text-tomato")} /> {[12, 31, 8][i]}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="size-4" /> {[3, 7, 2][i]}
                  </span>
                </div>
              </article>
            ))}
            <p className="absolute -top-5 end-0 rotate-3 rounded-full bg-cobalt px-4 py-2 text-sm font-medium text-on-cobalt shadow-lg lg:-end-6">
              ♥ {l.samples[1].name.split(" ")[0]} · {t.notifications.types.like_post}
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-faint">{l.pointsTitle}</h2>
            <ol className="mt-8 grid gap-10 md:grid-cols-3">
              {l.points.map((p, i) => (
                <li key={p.title}>
                  <span className={cn("font-display text-5xl font-light italic", POINT_COLORS[i])}>0{i + 1}</span>
                  <h3 className="mt-3 text-2xl font-semibold">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-lg">{l.builtWith}</p>
        <div className="flex gap-5">
          <a className="link" href={API_DOCS} target="_blank" rel="noreferrer">
            {l.apiDocs}
          </a>
          <a className="link" href={SOURCE} target="_blank" rel="noreferrer">
            {l.source}
          </a>
        </div>
      </footer>
    </div>
  );
}
