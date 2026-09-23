import { Suspense } from "react";
import { ForgotPassword } from "@/components/auth/email-flows";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.auth.forgot.title);

export default function Page() {
  return (
    <Suspense>
      <ForgotPassword />
    </Suspense>
  );
}
