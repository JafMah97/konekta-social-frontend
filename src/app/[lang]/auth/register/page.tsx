import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.auth.register.submit);

export default function Page() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
