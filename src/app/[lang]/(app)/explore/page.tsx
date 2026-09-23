import { ExploreView } from "@/components/views/people-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.explore.title);

export default function Page() {
  return <ExploreView />;
}
