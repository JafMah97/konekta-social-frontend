"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DemoButton } from "@/components/demo-button";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";
import { useErrorMessage } from "@/hooks/use-error-message";
import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/api/endpoints";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { AuthFrame, Divider } from "./auth-frame";
import { useEnterApp, useNextPath } from "./use-auth-helpers";

export function LoginForm() {
  const { t } = useI18n();
  const s = t.auth.login;
  const href = useHref();
  const next = useNextPath();
  const enterApp = useEnterApp();
  const errorMessage = useErrorMessage();
  const [error, setError] = useState<string>();

  const schema = z.object({
    email: z.email(t.validation.email),
    password: z.string().min(1, t.validation.required),
  });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: z.infer<typeof schema>) {
    setError(undefined);
    try {
      await auth.login(values);
      enterApp(next);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? s.invalid : errorMessage(err));
    }
  }

  const { errors, isSubmitting } = form.formState;

  return (
    <AuthFrame accent="cobalt" title={s.title} subtitle={s.subtitle}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label={s.email} error={errors.email?.message}>
          {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" {...form.register("email")} />}
        </Field>
        <Field
          label={
            <>
              {s.password}
              <Link href={href("/auth/forgot-password")} className="link text-xs font-normal text-ink-soft">
                {s.forgot}
              </Link>
            </>
          }
          error={errors.password?.message}
        >
          {(p) => <Input {...p} type="password" autoComplete="current-password" {...form.register("password")} />}
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 w-full">
          {s.submit}
        </Button>
      </form>

      <Divider label={t.common.or} />

      <div className="flex flex-col gap-2.5">
        <DemoButton variant="accent" className="w-full">
          {s.demo}
        </DemoButton>
        <Button asChild variant="soft" className="w-full">
          <Link href={href("/auth/magic-link")}>{s.magic}</Link>
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-ink-soft">
        {s.noAccount}{" "}
        <Link href={href("/auth/register")} className="link font-medium text-ink">
          {s.register}
        </Link>
      </p>
    </AuthFrame>
  );
}
