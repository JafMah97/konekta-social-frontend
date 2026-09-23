import { Suspense } from "react";
import { MagicLink } from "@/components/auth/email-flows";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.auth.magic.title);

export default function Page() {
  return (
    <Suspense>
      <MagicLink />
    </Suspense>
  );
}
