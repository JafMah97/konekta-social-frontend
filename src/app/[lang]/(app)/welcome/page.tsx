import { WelcomeView } from "@/components/views/welcome-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.welcome.title);

export default function Page() {
  return <WelcomeView />;
}
