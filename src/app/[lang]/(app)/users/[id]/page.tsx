import { ProfileView } from "@/components/views/profile-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.nav.profile);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ProfileView id={(await params).id} />;
}
