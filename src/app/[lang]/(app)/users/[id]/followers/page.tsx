import { FollowListView } from "@/components/views/people-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.profile.followers);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <FollowListView id={(await params).id} kind="followers" />;
}
