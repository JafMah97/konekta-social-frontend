import { SavedView } from "@/components/views/feed-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.saved.title);

export default function Page() {
  return <SavedView />;
}
