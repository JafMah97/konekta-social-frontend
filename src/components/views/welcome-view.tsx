"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MediaEditor } from "@/components/people/media-editor";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Textarea } from "@/components/ui/field";
import { useViewer } from "@/hooks/people";
import { useErrorMessage } from "@/hooks/use-error-message";
import { account } from "@/lib/api/endpoints";
import { fmt } from "@/lib/i18n/config";
import { useHref, useI18n } from "@/lib/i18n/provider";

export function WelcomeView() {
  const { t } = useI18n();
  const w = t.welcome;
  const href = useHref();
  const router = useRouter();
  const qc = useQueryClient();
  const me = useViewer()!;
  const errorMessage = useErrorMessage();
  const [error, setError] = useState<string>();

  const schema = z.object({
    bio: z.string().max(500, fmt(t.validation.max, { n: 500 })),
    location: z.string().max(100, fmt(t.validation.max, { n: 100 })),
    website: z.union([z.literal(""), z.url(t.validation.url)]),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { bio: me.bio ?? "", location: me.location ?? "", website: me.website ?? "" },
  });

  async function onSubmit(values: Values) {
    setError(undefined);
    // Only send what was filled in; the API treats "" as invalid for some fields
    const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim())) as Partial<Values>;
    try {
      if (Object.keys(body).length) await account.completeProfile(body);
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.push(href("/feed"));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const { errors, isSubmitting } = form.formState;

  return (
    <div className="px-4 py-8 sm:px-6">
      <p className="inline-block -rotate-2 rounded-md bg-mint px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-on-mint">
        {fmt("@{u}", { u: me.username })}
      </p>
      <h1 className="mt-4 text-4xl font-medium leading-tight">{w.title}</h1>
      <p className="mt-2 text-ink-soft">{w.subtitle}</p>

      <div className="mt-8">
        <MediaEditor me={me} />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
        <Field label={w.bio} optional={t.common.optional} error={errors.bio?.message}>
          {(p) => <Textarea {...p} placeholder={w.bioPlaceholder} rows={3} {...form.register("bio")} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={w.location} optional={t.common.optional} error={errors.location?.message}>
            {(p) => <Input {...p} autoComplete="address-level2" {...form.register("location")} />}
          </Field>
          <Field label={w.website} optional={t.common.optional} error={errors.website?.message}>
            {(p) => <Input {...p} type="url" dir="ltr" placeholder="https://" {...form.register("website")} />}
          </Field>
        </div>
        <FormError>{error}</FormError>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" loading={isSubmitting}>
            {w.finish}
          </Button>
          <Link href={href("/feed")} className="link text-sm text-ink-soft">
            {t.common.skip}
          </Link>
        </div>
      </form>
    </div>
  );
}
