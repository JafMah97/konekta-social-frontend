import { Suspense } from "react";
import { VerifyNewEmail } from "@/components/auth/email-flows";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.settings.sections.email);

export default function Page() {
  return (
    <Suspense>
      <VerifyNewEmail />
    </Suspense>
  );
}
