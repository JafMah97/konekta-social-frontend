import { Suspense } from "react";
import { VerifyEmail } from "@/components/auth/verify-email";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.auth.verify.title);

export default function Page() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
