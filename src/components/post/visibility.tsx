"use client";

import { ChevronDown, Globe2, Lock, Users } from "lucide-react";
import type { Visibility } from "@/lib/api/types";
import { useI18n } from "@/lib/i18n/provider";
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/ui/menu";

export const VISIBILITY_ICON = { PUBLIC: Globe2, FOLLOWERS_ONLY: Users, PRIVATE: Lock } as const;

export function VisibilityPicker({ value, onChange }: { value: Visibility; onChange: (v: Visibility) => void }) {
  const { t } = useI18n();
  const Icon = VISIBILITY_ICON[value];
  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label={t.composer.visibility}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
        >
          <Icon className="size-3.5" />
          {t.composer.visibilities[value]}
          <ChevronDown className="size-3.5 opacity-60" />
        </button>
      </MenuTrigger>
      <MenuContent align="start">
        <MenuLabel>{t.composer.visibility}</MenuLabel>
        <MenuRadioGroup value={value} onValueChange={(v) => onChange(v as Visibility)}>
          {(Object.keys(VISIBILITY_ICON) as Visibility[]).map((v) => {
            const ItemIcon = VISIBILITY_ICON[v];
            return (
              <MenuRadioItem key={v} value={v}>
                <span className="flex items-center gap-2.5">
                  <ItemIcon className="size-4" />
                  {t.composer.visibilities[v]}
                </span>
              </MenuRadioItem>
            );
          })}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
