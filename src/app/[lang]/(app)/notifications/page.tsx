import { NotificationsView } from "@/components/views/notifications-view";
import { metaTitle } from "@/lib/i18n/meta";

export const generateMetadata = metaTitle((t) => t.notifications.title);

export default function Page() {
  return <NotificationsView />;
}
