"use client";

import { InfiniteList, PeopleSkeletons } from "@/components/infinite-list";
import { PersonRow } from "@/components/people/person-row";
import { PageHeader } from "@/components/shell/page-header";
import { Empty } from "@/components/ui/misc";
import { usePeopleList, useProfile, useSuggestions } from "@/hooks/people";
import { ApiError } from "@/lib/api/client";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

export function FollowListView({ id, kind }: { id: string; kind: "followers" | "following" }) {
  const { t } = useI18n();
  const profile = useProfile(id);
  const list = usePeopleList(kind, id);
  const items = list.data?.pages.flatMap((p) => p.people) ?? [];
  const isPrivate = list.error instanceof ApiError && list.error.status === 403;

  return (
    <>
      <PageHeader
        title={kind === "followers" ? t.profile.followers : t.profile.following}
        subtitle={profile.data ? `@${profile.data.username}` : undefined}
        back
      />
      {isPrivate ? (
        <Empty mark="plum" title={t.profile.privateTitle} body={t.profile.privateBody} />
      ) : (
        <InfiniteList
          {...list}
          items={items}
          getKey={(p) => p.id}
          render={(p) => <PersonRow person={p} />}
          skeleton={<PeopleSkeletons />}
          empty={<Empty mark="mint" body={kind === "followers" ? t.profile.emptyFollowers : t.profile.emptyFollowing} />}
        />
      )}
    </>
  );
}

export function ExploreView() {
  const { t } = useI18n();
  const { data, isPending } = useSuggestions();

  return (
    <>
      <PageHeader title={t.explore.title} subtitle={t.explore.subtitle} />
      {isPending ? (
        <PeopleSkeletons count={6} />
      ) : !data?.length ? (
        <Empty mark="mint" body={t.explore.empty} />
      ) : (
        <ul className="divide-y divide-line">
          {data.map((p) => (
            <li key={p.id}>
              <PersonRow
                person={p}
                meta={[
                  p.followersCount !== undefined ? fmt(t.explore.followers, { n: p.followersCount }) : null,
                  p.mutualFollowersCount ? fmt(t.explore.mutuals, { n: p.mutualFollowersCount }) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
