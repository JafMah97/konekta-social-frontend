"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { auth } from "@/lib/api/endpoints";
import { useHref } from "@/lib/i18n/provider";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Button } from "./ui/button";

// The seeded demo account is public on purpose (the API locks its email,
// password and deletion), so its credentials can live in the client.
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "demo@example.com";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "demo12345";

export function DemoButton({ children, ...props }: ComponentProps<typeof Button>) {
  const router = useRouter();
  const href = useHref();
  const errorMessage = useErrorMessage();
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    try {
      await auth.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      router.replace(href("/feed"));
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <Button {...props} loading={pending} onClick={signIn}>
      {children}
      {!pending && <ArrowRight className="rtl:rotate-180" />}
    </Button>
  );
}
