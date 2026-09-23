"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PersonRow } from "@/components/people/person-row";
import { Button } from "@/components/ui/button";
import { Panel, Skeleton } from "@/components/ui/misc";
import { useFollowRequests, useRespondToRequest, useSuggestions } from "@/hooks/people";
import { useErrorMessage } from "@/hooks/use-error-message";
import { fmt } from "@/lib/i18n/config";
import { useHref, useI18n } from "@/lib/i18n/provider";

export function RightRail() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <FollowRequestsPanel />
      <SuggestionsPanel />
      <p className="px-2 text-xs leading-relaxed text-ink-faint">
        {t.meta.title} · {new Date().getFullYear()} ·{" "}
        <a className="link" href="https://konekta-social-backend.onrender.com/docs" target="_blank" rel="noreferrer">
          {t.landing.apiDocs}
        </a>{" "}
        ·{" "}
        <a className="link" href="https://github.com/JafMah97/konekta-social-backend" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </p>
    </div>
  );
}

export function FollowRequestsPanel() {
  const { t } = useI18n();
  const errorMessage = useErrorMessage();
  const { data: requests } = useFollowRequests();
  const respond = useRespondToRequest();
  if (!requests?.length) return null;

  return (
    <Panel className="overflow-hidden">
      <h2 className="flex items-center gap-2 px-5 pb-1 pt-4 font-display text-lg font-semibold">
        {t.rail.requests}
        <span className="rounded-full bg-plum px-2 text-xs font-semibold text-on-plum tabular">{requests.length}</span>
      </h2>
      <ul className="divide-y divide-line">
        {requests.map((r) => (
          <li key={r.id}>
            <PersonRow
              person={r.sender}
              showBio={false}
              action={<span />}
              meta={
                <span className="mt-1 flex gap-2">
                  <Button
                    size="sm"
                    disabled={respond.isPending}
                    onClick={() =>
                      respond.mutate(
                        { id: r.id, action: "accept" },
                        { onSuccess: () => toast(t.rail.accepted), onError: (e) => toast.error(errorMessage(e)) },
                      )
                    }
                  >
                    {t.rail.accept}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={respond.isPending}
                    onClick={() =>
                      respond.mutate(
                        { id: r.id, action: "reject" },
                        { onSuccess: () => toast(t.rail.declined), onError: (e) => toast.error(errorMessage(e)) },
                      )
                    }
                  >
                    {t.rail.decline}
                  </Button>
                </span>
              }
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function SuggestionsPanel() {
  const { t } = useI18n();
  const href = useHref();
  const { data, isPending } = useSuggestions();
  const people = data?.slice(0, 4);

  if (!isPending && !people?.length) return null;

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-baseline justify-between px-5 pb-1 pt-4">
        <h2 className="font-display text-lg font-semibold">{t.rail.suggestions}</h2>
        <Link href={href("/explore")} className="link text-sm text-ink-soft">
          {t.rail.seeAll}
        </Link>
      </div>
      {isPending ? (
        <div className="flex flex-col gap-4 px-5 py-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {people!.map((p) => (
            <li key={p.id}>
              <PersonRow
                person={p}
                showBio={false}
                meta={p.mutualFollowersCount ? fmt(t.explore.mutuals, { n: p.mutualFollowersCount }) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
