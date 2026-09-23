"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";
import { useErrorMessage } from "@/hooks/use-error-message";
import { account, auth } from "@/lib/api/endpoints";
import { fmt } from "@/lib/i18n/config";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { AuthFrame, Notice } from "./auth-frame";
import { useEnterApp, useRunOnce } from "./use-auth-helpers";

/** Email-only form that ends in a "check your inbox" notice. */
function RequestLinkForm({
  label,
  submit,
  send,
  sentTitle,
  sentBody,
  back,
}: {
  label: string;
  submit: string;
  send: (email: string) => Promise<unknown>;
  sentTitle: string;
  sentBody: string;
  back: string;
}) {
  const { t } = useI18n();
  const href = useHref();
  const errorMessage = useErrorMessage();
  const [sentTo, setSentTo] = useState<string>();
  const [error, setError] = useState<string>();
  const schema = z.object({ email: z.email(t.validation.email) });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit({ email }: { email: string }) {
    setError(undefined);
    try {
      await send(email);
      setSentTo(email);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-5">
        <Notice tone="ok">
          <p className="font-semibold">{sentTitle}</p>
          <p className="mt-1 text-ink-soft">{fmt(sentBody, { email: sentTo })}</p>
        </Notice>
        <Link href={href("/auth/login")} className="link w-fit text-sm text-ink-soft">
          {back}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field label={label} error={form.formState.errors.email?.message}>
        {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" {...form.register("email")} />}
      </Field>
      <FormError>{error}</FormError>
      <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="w-full">
        {submit}
      </Button>
      <Link href={href("/auth/login")} className="link mt-2 w-fit text-sm text-ink-soft">
        {back}
      </Link>
    </form>
  );
}

export function ForgotPassword() {
  const { t } = useI18n();
  const s = t.auth.forgot;
  return (
    <AuthFrame accent="sun" title={s.title} subtitle={s.subtitle}>
      <RequestLinkForm
        label={s.email}
        submit={s.submit}
        send={auth.forgotPassword}
        sentTitle={s.sentTitle}
        sentBody={s.sentBody}
        back={s.back}
      />
    </AuthFrame>
  );
}

export function ResetPassword() {
  const { t } = useI18n();
  const s = t.auth.reset;
  const href = useHref();
  const token = useSearchParams().get("token");
  const errorMessage = useErrorMessage();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();

  const schema = z
    .object({
      password: z.string().min(8, fmt(t.validation.min, { n: 8 })).max(100, fmt(t.validation.max, { n: 100 })),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { message: t.validation.mismatch, path: ["confirm"] });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  async function onSubmit({ password }: { password: string }) {
    setError(undefined);
    try {
      await auth.resetPassword({ token: token!, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const { errors, isSubmitting } = form.formState;

  return (
    <AuthFrame accent="plum" title={s.title} subtitle={token && !done ? s.subtitle : undefined}>
      {!token ? (
        <div className="flex flex-col gap-5">
          <Notice tone="error">{s.missingToken}</Notice>
          <Button asChild variant="outline">
            <Link href={href("/auth/forgot-password")}>{s.requestNew}</Link>
          </Button>
        </div>
      ) : done ? (
        <div className="flex flex-col gap-5">
          <Notice tone="ok">{s.done}</Notice>
          <Button asChild>
            <Link href={href("/auth/login")}>{t.auth.login.submit}</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field label={s.password} error={errors.password?.message}>
            {(p) => <Input {...p} type="password" autoComplete="new-password" {...form.register("password")} />}
          </Field>
          <Field label={s.confirm} error={errors.confirm?.message}>
            {(p) => <Input {...p} type="password" autoComplete="new-password" {...form.register("confirm")} />}
          </Field>
          <FormError>{error}</FormError>
          <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
            {s.submit}
          </Button>
        </form>
      )}
    </AuthFrame>
  );
}

export function MagicLink() {
  const { t } = useI18n();
  const s = t.auth.magic;
  const token = useSearchParams().get("token");
  return (
    <AuthFrame accent="cobalt" title={s.title} subtitle={token ? undefined : s.subtitle}>
      {token ? (
        <ConsumeMagicLink token={token} />
      ) : (
        <RequestLinkForm
          label={s.email}
          submit={s.submit}
          send={auth.requestMagicLink}
          sentTitle={s.sentTitle}
          sentBody={s.sentBody}
          back={s.back}
        />
      )}
    </AuthFrame>
  );
}

function ConsumeMagicLink({ token }: { token: string }) {
  const { t } = useI18n();
  const href = useHref();
  const enterApp = useEnterApp();
  const [failed, setFailed] = useState(false);
  useRunOnce(() => {
    auth
      .verifyMagicLink(token)
      .then(() => enterApp("/feed"))
      .catch(() => setFailed(true));
  });
  if (!failed) return <Notice tone="busy">{t.auth.magic.verifying}</Notice>;
  return (
    <div className="flex flex-col gap-5">
      <Notice tone="error">{t.auth.magic.failed}</Notice>
      <Button asChild variant="outline">
        <Link href={href("/auth/magic-link")}>{t.auth.magic.submit}</Link>
      </Button>
    </div>
  );
}

export function VerifyNewEmail() {
  const { t } = useI18n();
  const s = t.auth.newEmail;
  const href = useHref();
  const qc = useQueryClient();
  const token = useSearchParams().get("token");
  const [state, setState] = useState<{ status: "busy" | "ok" | "error"; email?: string }>({
    status: token ? "busy" : "error",
  });

  useRunOnce(() => {
    if (!token) return;
    account
      .confirmNewEmail({ token })
      .then((r) => {
        setState({ status: "ok", email: r.data.email });
        qc.invalidateQueries({ queryKey: ["me"] });
      })
      .catch(() => setState({ status: "error" }));
  });

  return (
    <AuthFrame accent="mint" title={t.settings.sections.email}>
      <div className="flex flex-col gap-5">
        <Notice tone={state.status}>
          {state.status === "busy" ? s.verifying : state.status === "ok" ? fmt(s.success, { email: state.email ?? "" }) : s.failed}
        </Notice>
        {state.status !== "busy" && (
          <Button asChild variant="outline">
            <Link href={href("/settings")}>{s.toSettings}</Link>
          </Button>
        )}
      </div>
    </AuthFrame>
  );
}
