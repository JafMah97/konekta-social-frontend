import { PostView } from "@/components/views/post-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.post.title);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PostView id={(await params).id} />;
}
