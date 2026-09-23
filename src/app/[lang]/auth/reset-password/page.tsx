import { Suspense } from "react";
import { ResetPassword } from "@/components/auth/email-flows";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.auth.reset.title);

export default function Page() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
