"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";
import { useErrorMessage } from "@/hooks/use-error-message";
import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/api/endpoints";
import { fmt } from "@/lib/i18n/config";
import { useHref, useI18n } from "@/lib/i18n/provider";
import { AuthFrame } from "./auth-frame";
import { useEnterApp } from "./use-auth-helpers";

export function RegisterForm() {
  const { t } = useI18n();
  const s = t.auth.register;
  const v = t.validation;
  const href = useHref();
  const enterApp = useEnterApp();
  const errorMessage = useErrorMessage();
  const [error, setError] = useState<string>();

  // Same limits as the API's registerSchema
  const schema = z.object({
    fullName: z.string().trim().min(2, fmt(v.min, { n: 2 })).max(50, fmt(v.max, { n: 50 })),
    username: z
      .string()
      .min(3, fmt(v.min, { n: 3 }))
      .max(20, fmt(v.max, { n: 20 }))
      .regex(/^[a-zA-Z0-9_]+$/, v.username),
    email: z.email(v.email),
    password: z.string().min(8, fmt(v.min, { n: 8 })).max(100, fmt(v.max, { n: 100 })),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", username: "", email: "", password: "" },
  });

  async function onSubmit(values: Values) {
    setError(undefined);
    try {
      await auth.register(values);
      // Registration signs the user in; verification can happen now or later
      enterApp(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      // 409s name the field that's taken
      if (err instanceof ApiError && err.status === 409) {
        for (const field of ["username", "email"] as const) {
          if (err.field(field)) form.setError(field, { message: s.taken });
        }
        return;
      }
      setError(errorMessage(err));
    }
  }

  const { errors, isSubmitting } = form.formState;

  return (
    <AuthFrame accent="tomato" title={s.title} subtitle={s.subtitle}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label={s.fullName} error={errors.fullName?.message}>
          {(p) => <Input {...p} autoComplete="name" {...form.register("fullName")} />}
        </Field>
        <Field label={s.username} hint={s.usernameHint} error={errors.username?.message}>
          {(p) => (
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-ink-faint">@</span>
              <Input {...p} dir="ltr" autoComplete="username" autoCapitalize="none" spellCheck={false} className="ps-8" {...form.register("username")} />
            </div>
          )}
        </Field>
        <Field label={s.email} error={errors.email?.message}>
          {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" {...form.register("email")} />}
        </Field>
        <Field label={s.password} hint={s.passwordHint} error={errors.password?.message}>
          {(p) => <Input {...p} type="password" autoComplete="new-password" {...form.register("password")} />}
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 w-full">
          {s.submit}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-soft">
        {s.haveAccount}{" "}
        <Link href={href("/auth/login")} className="link font-medium text-ink">
          {s.signIn}
        </Link>
      </p>
    </AuthFrame>
  );
}
