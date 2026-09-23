"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { MediaEditor } from "@/components/people/media-editor";
import { useSwitchLang } from "@/components/prefs";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Field, FormError, Input, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useViewer } from "@/hooks/people";
import { useErrorMessage } from "@/hooks/use-error-message";
import { ApiError } from "@/lib/api/client";
import { account } from "@/lib/api/endpoints";
import type { Me } from "@/lib/api/types";
import { fmt, langs, type Lang } from "@/lib/i18n/config";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

// The seeded accounts share a public password, so the API locks these
// actions for them (403 demoAccountReadOnly). Say so up front.
const isDemo = (me: Me) => me.email.toLowerCase().endsWith("@example.com");

export function SettingsView() {
  const { t } = useI18n();
  const me = useViewer()!;
  const s = t.settings.sections;
  const sections = [
    { id: "profile", label: s.profile },
    { id: "privacy", label: s.privacy },
    { id: "appearance", label: s.appearance },
    { id: "email", label: s.email },
    { id: "password", label: s.password },
    { id: "danger", label: s.danger },
  ];

  return (
    <>
      <PageHeader title={t.settings.title} />
      <nav className="scrollbar-none flex gap-1.5 overflow-x-auto border-b border-line px-4 py-2.5 sm:px-5">
        {sections.map((sec) => (
          <a key={sec.id} href={`#${sec.id}`} className="h-8 shrink-0 content-center rounded-full px-3.5 text-sm text-ink-soft hover:bg-sunken hover:text-ink">
            {sec.label}
          </a>
        ))}
      </nav>
      <ProfileSection me={me} />
      <PrivacySection me={me} />
      <AppearanceSection />
      <EmailSection me={me} />
      <PasswordSection me={me} />
      <DangerSection me={me} />
    </>
  );
}

function Section({ id, title, description, children, tone }: { id: string; title: string; description?: ReactNode; children: ReactNode; tone?: "danger" }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line px-4 py-7 sm:px-5">
      <h2 className={cn("text-2xl font-semibold", tone === "danger" && "text-tomato-ink")}>{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DemoLock() {
  const { t } = useI18n();
  return (
    <p className="flex items-start gap-2.5 rounded-2xl bg-sunken px-4 py-3 text-sm text-ink-soft">
      <Lock className="mt-0.5 size-4 shrink-0" />
      {t.settings.demoLocked}
    </p>
  );
}

function useRefreshMe() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["me"] }),
      qc.invalidateQueries({ queryKey: ["user"] }),
    ]);
}

function ProfileSection({ me }: { me: Me }) {
  const { t } = useI18n();
  const p = t.settings.profile;
  const v = t.validation;
  const refresh = useRefreshMe();
  const errorMessage = useErrorMessage();
  const [error, setError] = useState<string>();

  const schema = z.object({
    fullName: z.string().trim().min(2, fmt(v.min, { n: 2 })).max(50, fmt(v.max, { n: 50 })),
    username: z.string().min(3, fmt(v.min, { n: 3 })).max(20, fmt(v.max, { n: 20 })).regex(/^[a-zA-Z0-9_]+$/, v.username),
    bio: z.string().max(500, fmt(v.max, { n: 500 })),
    location: z.string().max(100, fmt(v.max, { n: 100 })),
    website: z.union([z.literal(""), z.url(v.url)]),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      fullName: me.fullName,
      username: me.username,
      bio: me.bio ?? "",
      location: me.location ?? "",
      website: me.website ?? "",
    },
  });

  async function onSubmit(values: Values) {
    setError(undefined);
    try {
      await account.updateProfile(values);
      await refresh();
      toast.success(p.saved);
    } catch (err) {
      if (err instanceof ApiError && err.field("username")) {
        form.setError("username", { message: t.auth.register.taken });
      } else setError(errorMessage(err));
    }
  }

  const { errors, isSubmitting, isDirty } = form.formState;

  return (
    <Section id="profile" title={t.settings.sections.profile}>
      <MediaEditor me={me} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={p.fullName} error={errors.fullName?.message}>
            {(f) => <Input {...f} autoComplete="name" {...form.register("fullName")} />}
          </Field>
          <Field label={p.username} error={errors.username?.message}>
            {(f) => <Input {...f} dir="ltr" autoCapitalize="none" spellCheck={false} {...form.register("username")} />}
          </Field>
        </div>
        <Field label={p.bio} optional={t.common.optional} error={errors.bio?.message}>
          {(f) => <Textarea {...f} rows={3} placeholder={t.welcome.bioPlaceholder} {...form.register("bio")} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={p.location} optional={t.common.optional} error={errors.location?.message}>
            {(f) => <Input {...f} {...form.register("location")} />}
          </Field>
          <Field label={p.website} optional={t.common.optional} error={errors.website?.message}>
            {(f) => <Input {...f} type="url" dir="ltr" placeholder="https://" {...form.register("website")} />}
          </Field>
        </div>
        <FormError>{error}</FormError>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="w-fit">
          {t.common.save}
        </Button>
      </form>
    </Section>
  );
}

function PrivacySection({ me }: { me: Me }) {
  const { t } = useI18n();
  const refresh = useRefreshMe();
  const errorMessage = useErrorMessage();
  const [pending, setPending] = useState(false);

  async function toggle(isPrivate: boolean) {
    setPending(true);
    try {
      await account.updateProfile({ isPrivate });
      await refresh();
      toast.success(t.settings.privacy.saved);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Section id="privacy" title={t.settings.sections.privacy}>
      <label className="flex cursor-pointer items-start justify-between gap-6">
        <span>
          <span className="block font-medium">{t.settings.privacy.private}</span>
          <span className="mt-1 block text-sm text-ink-soft">{t.settings.privacy.privateHint}</span>
        </span>
        <Switch checked={me.isPrivate} onCheckedChange={toggle} disabled={pending} aria-label={t.settings.privacy.private} />
      </label>
    </Section>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T | undefined; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-full border-[1.5px] border-line p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn("h-8 rounded-full px-4 text-sm transition-colors", value === o.value ? "bg-ink font-medium text-paper" : "text-ink-soft hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AppearanceSection() {
  const { lang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const switchLang = useSwitchLang();

  return (
    <Section id="appearance" title={t.settings.sections.appearance}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-medium">{t.nav.theme}</span>
          <Segmented
            value={theme as "light" | "dark" | "system" | undefined}
            onChange={setTheme}
            options={[
              { value: "light", label: t.nav.themes.light },
              { value: "dark", label: t.nav.themes.dark },
              { value: "system", label: t.nav.themes.system },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-medium">{t.nav.language}</span>
          <Segmented<Lang> value={lang} onChange={(l) => l !== lang && switchLang(l)} options={langs.map((l) => ({ value: l, label: t.nav.languages[l] }))} />
        </div>
      </div>
    </Section>
  );
}

function EmailSection({ me }: { me: Me }) {
  const { t } = useI18n();
  const e = t.settings.email;
  const refresh = useRefreshMe();
  const errorMessage = useErrorMessage();
  const [pendingEmail, setPendingEmail] = useState<string>();
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  const schema = z.object({ newEmail: z.email(t.validation.email), password: z.string().min(1, t.validation.required) });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { newEmail: "", password: "" } });

  async function request(values: z.infer<typeof schema>) {
    setError(undefined);
    try {
      const res = await account.changeEmail(values);
      setPendingEmail(res.data.pendingEmail);
      form.reset();
    } catch (err) {
      if (err instanceof ApiError && err.field("password")) form.setError("password", { message: err.field("password") });
      else if (err instanceof ApiError && err.field("newEmail")) form.setError("newEmail", { message: err.field("newEmail") });
      else setError(errorMessage(err));
    }
  }

  async function confirm() {
    if (!/^\d{6}$/.test(code)) return setError(t.validation.code);
    setConfirming(true);
    setError(undefined);
    try {
      await account.confirmNewEmail({ code });
      await refresh();
      setPendingEmail(undefined);
      setCode("");
      toast.success(e.changed);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <Section
      id="email"
      title={t.settings.sections.email}
      description={
        <span className="flex flex-wrap items-center gap-2">
          {e.current}: <b className="font-medium text-ink" dir="ltr">{me.email}</b>
          <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", me.emailVerified ? "bg-mint/20 text-mint-ink" : "bg-sun/30 text-sun-ink")}>
            {me.emailVerified ? e.verified : e.unverified}
          </span>
        </span>
      }
    >
      {isDemo(me) ? (
        <DemoLock />
      ) : pendingEmail ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">{fmt(e.pending, { email: pendingEmail })}</p>
          <Field label={e.code} error={error}>
            {(f) => (
              <Input
                {...f}
                value={code}
                onChange={(ev) => setCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                placeholder="000000"
                className="max-w-48 text-center font-display text-xl tracking-[0.4em] tabular"
              />
            )}
          </Field>
          <div className="flex gap-2">
            <Button onClick={confirm} loading={confirming}>
              {e.confirm}
            </Button>
            <Button variant="ghost" onClick={() => setPendingEmail(undefined)}>
              {t.common.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(request)} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={e.newEmail} error={form.formState.errors.newEmail?.message}>
              {(f) => <Input {...f} type="email" autoComplete="email" {...form.register("newEmail")} />}
            </Field>
            <Field label={e.password} error={form.formState.errors.password?.message}>
              {(f) => <Input {...f} type="password" autoComplete="current-password" {...form.register("password")} />}
            </Field>
          </div>
          <FormError>{error}</FormError>
          <Button type="submit" variant="outline" loading={form.formState.isSubmitting} className="w-fit">
            {e.submit}
          </Button>
        </form>
      )}
    </Section>
  );
}

function PasswordSection({ me }: { me: Me }) {
  const { t } = useI18n();
  const p = t.settings.password;
  const errorMessage = useErrorMessage();
  const [error, setError] = useState<string>();

  const schema = z
    .object({
      currentPassword: z.string().min(1, t.validation.required),
      newPassword: z.string().min(8, fmt(t.validation.min, { n: 8 })).max(100, fmt(t.validation.max, { n: 100 })),
      confirmPassword: z.string(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, { message: t.validation.mismatch, path: ["confirmPassword"] });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  async function onSubmit(values: Values) {
    setError(undefined);
    try {
      await account.changePassword(values);
      form.reset();
      toast.success(p.changed);
    } catch (err) {
      if (err instanceof ApiError && err.field("currentPassword")) form.setError("currentPassword", { message: err.field("currentPassword") });
      else setError(errorMessage(err));
    }
  }

  const { errors, isSubmitting } = form.formState;

  return (
    <Section id="password" title={t.settings.sections.password}>
      {isDemo(me) ? (
        <DemoLock />
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field label={p.current} error={errors.currentPassword?.message} className="sm:max-w-[calc(50%-0.5rem)]">
            {(f) => <Input {...f} type="password" autoComplete="current-password" {...form.register("currentPassword")} />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={p.next} error={errors.newPassword?.message}>
              {(f) => <Input {...f} type="password" autoComplete="new-password" {...form.register("newPassword")} />}
            </Field>
            <Field label={p.confirm} error={errors.confirmPassword?.message}>
              {(f) => <Input {...f} type="password" autoComplete="new-password" {...form.register("confirmPassword")} />}
            </Field>
          </div>
          <FormError>{error}</FormError>
          <Button type="submit" variant="outline" loading={isSubmitting} className="w-fit">
            {p.submit}
          </Button>
        </form>
      )}
    </Section>
  );
}

function DangerSection({ me }: { me: Me }) {
  const { t } = useI18n();
  const d = t.settings.danger;
  const href = useHref();
  const router = useRouter();
  const qc = useQueryClient();
  const errorMessage = useErrorMessage();
  const [typed, setTyped] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function destroy() {
    setPending(true);
    try {
      await account.deleteAccount();
      qc.clear();
      toast(d.deleted);
      router.replace(href("/"));
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <Section id="danger" title={t.settings.sections.danger} description={d.body} tone="danger">
      {isDemo(me) ? (
        <DemoLock />
      ) : (
        <div className="flex flex-col gap-4">
          <Field label={fmt(d.confirm, { username: me.username })}>
            {(f) => <Input {...f} dir="ltr" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className="sm:max-w-xs" />}
          </Field>
          <Button variant="danger" disabled={typed !== me.username} onClick={() => setOpen(true)} className="w-fit">
            {d.submit}
          </Button>
          <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title={d.confirmTitle}
            description={d.confirmBody}
            confirmLabel={d.submit}
            cancelLabel={t.common.cancel}
            destructive
            pending={pending}
            onConfirm={destroy}
          />
        </div>
      )}
    </Section>
  );
}
