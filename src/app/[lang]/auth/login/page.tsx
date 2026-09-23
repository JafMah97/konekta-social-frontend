import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.auth.login.submit);

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
