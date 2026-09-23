import { SettingsView } from "@/components/views/settings-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.settings.title);

export default function Page() {
  return <SettingsView />;
}
