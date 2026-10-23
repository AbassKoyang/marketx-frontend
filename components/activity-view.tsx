"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Clock01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import {
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from "@/components/page-states"
import { Button } from "@/components/ui/button"
import {
  eventDetail,
  eventLabel,
  formatDateTime,
  formatRelative,
} from "@/lib/format"
import { useActivity, useAuth } from "@/lib/query/hooks"
import { flattenPages } from "@/lib/query/pagination"
import { cn } from "@/lib/utils"

export function ActivityView() {
  const { isAuthenticated } = useAuth()
  const activity = useActivity({})
  const items = flattenPages(activity.data?.pages)

  return (
    <div className="page-container py-10 md:py-14">
      <PageHeader
        eyebrow="Activity"
        title="Market activity"
        description={
          isAuthenticated
            ? "Public market events together with your own orders, fills, and settlements."
            : "Public market events from across MarketX. Sign in to include your own orders."
        }
        actions={
          isAuthenticated ? (
            <Button
              variant="outline"
              render={<Link href="/portfolio" />}
              nativeButton={false}
            >
              Your portfolio
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                data-icon="inline-end"
                strokeWidth={1.8}
              />
            </Button>
          ) : (
            <Button
              render={<Link href="/login?next=%2Factivity" />}
              nativeButton={false}
            >
              Sign in
            </Button>
          )
        }
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <p className="text-xs text-muted-foreground">
          {isAuthenticated
            ? "Your private events are marked You. Public events are anonymous."
            : "Public events are anonymous. Only matched trades are shown publicly."}
        </p>

      </div>

      <div className="mt-6">
        {activity.isLoading ? (
          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-1 size-2 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-64 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activity.isError ? (
          <ErrorState
            title="Activity didn’t load"
            description="We couldn’t fetch market activity. Try again in a moment."
            onRetry={() => activity.refetch()}
          />
        ) : null}

        {activity.isSuccess && items.length === 0 ? (
          <EmptyState
            icon={Clock01Icon}
            title={isAuthenticated ? "No activity yet" : "No public activity yet"}
            description={
              isAuthenticated
                ? "Orders, fills, and settlements across your account will appear here."
                : "When trades and settlements occur on MarketX, they will appear here."
            }
            action={
              <Button
                variant="outline"
                render={<Link href="/markets" />}
                nativeButton={false}
              >
                Browse markets
              </Button>
            }
          />
        ) : null}

        {items.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
            <ol className="divide-y divide-border/50">
              {items.map((event) => {
                const detail = eventDetail(event)
                return (
                  <li key={event.id} className="flex gap-3 px-4 py-4 md:px-5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        event.visibility === "private"
                          ? "bg-foreground"
                          : "border border-muted-foreground/50"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-medium">
                          {eventLabel(event.event_type)}
                        </p>
                        {detail ? (
                          <p className="tabular text-sm text-muted-foreground">
                            {detail}
                          </p>
                        ) : null}
                        {event.visibility === "private" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-px text-[10px] text-muted-foreground">
                            <HugeiconsIcon
                              icon={UserIcon}
                              className="size-2.5"
                              strokeWidth={1.8}
                            />
                            You
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.market_slug ? (
                          <Link
                            href={`/markets/${encodeURIComponent(event.market_slug)}`}
                            className="underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {event.market_title}
                          </Link>
                        ) : (
                          event.market_title
                        )}
                        {event.outcome_name ? (
                          <span className="text-muted-foreground/80">
                            {" "}
                            · {event.outcome_name}
                          </span>
                        ) : null}
                        {" "}
                        ·{" "}
                        <time
                          dateTime={event.created_at}
                          title={formatDateTime(event.created_at)}
                        >
                          {formatRelative(event.created_at)}
                        </time>
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>

            <div className="flex justify-center border-t border-border/60 px-4 py-3">
              {activity.hasNextPage ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => activity.fetchNextPage()}
                  disabled={activity.isFetchingNextPage}
                >
                  {activity.isFetchingNextPage ? (
                    <>
                      <Spinner className="size-3" />
                      Loading
                    </>
                  ) : (
                    "Load more activity"
                  )}
                </Button>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  End of activity
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
