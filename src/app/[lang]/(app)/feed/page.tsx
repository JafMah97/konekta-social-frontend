import { FeedView } from "@/components/views/feed-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.feed.title);

export default function Page() {
  return <FeedView />;
}
