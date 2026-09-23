"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useI18n } from "@/lib/i18n/provider";

interface InfiniteListProps<T> {
  items: T[];
  render: (item: T) => ReactNode;
  getKey: (item: T) => string;
  isPending: boolean;
  error: unknown;
  refetch: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  empty: ReactNode;
  skeleton?: ReactNode;
}

/** Divided list that loads the next page when its end scrolls into view */
export function InfiniteList<T>(props: InfiniteListProps<T>) {
  const { t } = useI18n();
  const errorMessage = useErrorMessage();
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = props;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (props.isPending) {
    return <div className="divide-y divide-line">{props.skeleton ?? <PostSkeletons />}</div>;
  }

  if (props.error && props.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <p className="text-ink-soft">{errorMessage(props.error)}</p>
        <Button variant="outline" size="sm" onClick={props.refetch}>
          {t.common.retry}
        </Button>
      </div>
    );
  }

  if (props.items.length === 0) return <>{props.empty}</>;

  return (
    <>
      <ul className="divide-y divide-line">
        {props.items.map((item) => (
          <li key={props.getKey(item)}>{props.render(item)}</li>
        ))}
      </ul>
      <div ref={sentinel} className="flex justify-center border-t border-line py-6 text-sm text-ink-faint">
        {isFetchingNextPage ? <Spinner /> : hasNextPage ? null : <span className="font-display italic">{t.common.caughtUp}</span>}
      </div>
    </>
  );
}

export function PostSkeletons({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-3 px-5 py-5">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2.5 pt-1">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      ))}
    </>
  );
}

export function PeopleSkeletons({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </>
  );
}
