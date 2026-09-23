"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";
import { useMe } from "@/hooks/people";
import { useErrorMessage } from "@/hooks/use-error-message";
import { auth } from "@/lib/api/endpoints";
import { fmt } from "@/lib/i18n/config";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { AuthFrame, Notice } from "./auth-frame";
import { useEnterApp, useRunOnce } from "./use-auth-helpers";

export function VerifyEmail() {
  const token = useSearchParams().get("token");
  return token ? <VerifyWithLink token={token} /> : <VerifyWithCode />;
}

function VerifyWithLink({ token }: { token: string }) {
  const { t } = useI18n();
  const s = t.auth.verify;
  const href = useHref();
  const enterApp = useEnterApp();
  const [failed, setFailed] = useState(false);

  useRunOnce(() => {
    auth
      .verifyLink(token)
      .then(() => {
        toast.success(s.verified);
        enterApp("/feed");
      })
      .catch(() => setFailed(true));
  });

  return (
    <AuthFrame accent="mint" title={s.title}>
      {failed ? (
        <div className="flex flex-col gap-5">
          <Notice tone="error">{s.linkFailed}</Notice>
          <Button asChild variant="outline">
            <Link href={href("/auth/login")}>{t.auth.login.submit}</Link>
          </Button>
        </div>
      ) : (
        <Notice tone="busy">{s.checkingLink}</Notice>
      )}
    </AuthFrame>
  );
}

const RESEND_COOLDOWN = 60;

function VerifyWithCode() {
  const { t } = useI18n();
  const s = t.auth.verify;
  const href = useHref();
  const qc = useQueryClient();
  const enterApp = useEnterApp();
  const errorMessage = useErrorMessage();
  const me = useMe();
  const email = useSearchParams().get("email") ?? me.data?.email ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError(t.validation.code);
    setPending(true);
    setError(undefined);
    try {
      await auth.verifyCode({ email, code });
      toast.success(s.verified);
      await qc.invalidateQueries({ queryKey: ["me"] });
      enterApp("/welcome");
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  async function resend() {
    setCooldown(RESEND_COOLDOWN);
    try {
      await auth.resendVerification(email);
      toast.success(s.resent);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  if (me.data?.emailVerified) {
    return (
      <AuthFrame accent="mint" title={s.title}>
        <div className="flex flex-col gap-5">
          <Notice tone="ok">{s.alreadyVerified}</Notice>
          <Button asChild>
            <Link href={href("/feed")}>{t.common.continue}</Link>
          </Button>
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      accent="mint"
      title={s.title}
      subtitle={email ? fmt(s.subtitle, { email }) : s.subtitleNoEmail}
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label={s.code} error={error}>
          {(p) => (
            <Input
              {...p}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              placeholder="000000"
              className="h-16 text-center font-display text-3xl tracking-[0.5em] tabular"
            />
          )}
        </Field>
        <FormError>{!email ? t.common.somethingWrong : undefined}</FormError>
        <Button type="submit" size="lg" loading={pending} disabled={!email} className="w-full">
          {s.submit}
        </Button>
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button type="button" onClick={resend} disabled={cooldown > 0 || !email} className="link text-ink-soft disabled:no-underline disabled:opacity-60">
          {cooldown > 0 ? fmt(s.resendIn, { s: cooldown }) : s.resend}
        </button>
        <Link href={href("/welcome")} className="link text-ink-soft">
          {s.later}
        </Link>
      </div>
    </AuthFrame>
  );
}
