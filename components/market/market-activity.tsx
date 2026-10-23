"use client"

import { ErrorState, Spinner } from "@/components/page-states"
import { Button } from "@/components/ui/button"
import type { MarketStatus } from "@/lib/api/types"
import { eventDetail, eventLabel, formatDateTime, formatRelative } from "@/lib/format"
import { useActivity, useAuth } from "@/lib/query/hooks"
import { flattenPages } from "@/lib/query/pagination"

export function MarketActivity({
  outcomeId,
  outcomeName,
  marketStatus,
}: {
  outcomeId: number
  outcomeName: string
  marketStatus: MarketStatus
}) {
  const { isAuthenticated } = useAuth()
  const activity = useActivity({ outcome: outcomeId })
  const items = flattenPages(activity.data?.pages)
  const ended = marketStatus !== "open" && marketStatus !== "draft"

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <p className="text-xs text-muted-foreground">
          {isAuthenticated
            ? "Public events and your orders"
            : "Public market events"}{" "}
          · {outcomeName}
        </p>
      </div>

      {activity.isLoading ? (
        <div className="space-y-4 px-5 pb-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="mt-1 size-2 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activity.isError ? (
        <div className="px-5 pb-5">
          <ErrorState
            title="Activity didn’t load"
            description="We couldn’t fetch recent market events."
            onRetry={() => activity.refetch()}
          />
        </div>
      ) : null}

      {activity.isSuccess && items.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium">
            {ended ? "No recorded activity" : "No activity yet"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {ended
              ? "No orders, fills, or settlements were recorded for this outcome."
              : "Orders, fills, and settlements will appear here."}
          </p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <>
          <ol className="divide-y divide-border/50">
            {items.map((event) => {
              const detail = eventDetail(event)
              return (
                <li key={event.id} className="flex gap-3 px-5 py-3.5">
                  <span
                    aria-hidden="true"
                    className={
                      event.visibility === "private"
                        ? "mt-1.5 size-2 shrink-0 rounded-full bg-foreground"
                        : "mt-1.5 size-2 shrink-0 rounded-full border border-muted-foreground/50"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-medium">{eventLabel(event.event_type)}</p>
                      {detail ? (
                        <p className="tabular text-sm text-muted-foreground">{detail}</p>
                      ) : null}
                      {event.visibility === "private" ? (
                        <span className="rounded-full border border-border px-1.5 py-px text-[10px] text-muted-foreground">
                          You
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">
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

          <div className="flex justify-center border-t border-border/60 px-5 py-3">
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
              <p className="text-[11px] text-muted-foreground">End of activity</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
