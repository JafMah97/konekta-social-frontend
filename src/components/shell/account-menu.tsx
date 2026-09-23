"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PrefsMenuItems } from "@/components/prefs";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { auth } from "@/lib/api/endpoints";
import type { Me } from "@/lib/api/types";
import { useHref, useI18n } from "@/lib/i18n/provider";

export function useSignOut() {
  const router = useRouter();
  const href = useHref();
  const qc = useQueryClient();
  const { t } = useI18n();
  return async () => {
    // Even if the API call fails (e.g. session already gone) drop the cookie
    await auth.logout().catch(() => fetch("/api/client-session", { method: "DELETE" }));
    qc.clear();
    toast(t.nav.signedOut);
    router.replace(href("/"));
    router.refresh();
  };
}

export function AccountMenu({ me, trigger, align = "end" }: { me: Me; trigger: ReactNode; align?: "start" | "end" }) {
  const { t } = useI18n();
  const href = useHref();
  const router = useRouter();
  const signOut = useSignOut();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <>
      <Menu modal={false}>
        <MenuTrigger asChild>{trigger}</MenuTrigger>
        <MenuContent align={align} side="top" className="w-60">
          <div className="px-3 pb-2 pt-1.5">
            <p className="truncate font-semibold">{me.fullName}</p>
            <p className="truncate text-sm text-ink-faint">@{me.username}</p>
          </div>
          <MenuSeparator />
          <MenuItem icon={<User />} onSelect={() => router.push(href(`/users/${me.id}`))}>
            {t.nav.profile}
          </MenuItem>
          <MenuItem icon={<Settings />} onSelect={() => router.push(href("/settings"))}>
            {t.nav.settings}
          </MenuItem>
          <MenuSeparator />
          <PrefsMenuItems />
          <MenuSeparator />
          <MenuItem icon={<LogOut />} destructive onSelect={() => setConfirming(true)}>
            {t.nav.signOut}
          </MenuItem>
        </MenuContent>
      </Menu>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t.nav.signOut}
        description={t.nav.signOutConfirm}
        confirmLabel={t.nav.signOut}
        cancelLabel={t.common.cancel}
        pending={pending}
        onConfirm={async () => {
          setPending(true);
          await signOut();
        }}
      />
    </>
  );
}
