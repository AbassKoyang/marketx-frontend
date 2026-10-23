"use client"

import { ErrorState, Spinner } from "@/components/page-states"
import { Button } from "@/components/ui/button"
import type { MarketStatus } from "@/lib/api/types"
import { formatDateTime, formatQuantity, formatTicksPercent } from "@/lib/format"
import { useTrades } from "@/lib/query/hooks"
import { flattenPages } from "@/lib/query/pagination"

export function MarketTrades({
  outcomeId,
  outcomeName,
  marketStatus,
}: {
  outcomeId: number
  outcomeName: string
  marketStatus: MarketStatus
}) {
  const trades = useTrades({ outcome: outcomeId })
  const items = flattenPages(trades.data?.pages)
  const ended = marketStatus !== "open" && marketStatus !== "draft"

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <p className="text-xs text-muted-foreground">
          Matched trades · {outcomeName}
        </p>
      </div>

      {trades.isLoading ? (
        <div className="space-y-3 px-5 pb-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between gap-4">
              <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-10 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : null}

      {trades.isError ? (
        <div className="px-5 pb-5">
          <ErrorState
            title="Trades didn’t load"
            description="We couldn’t fetch recent trades for this outcome."
            onRetry={() => trades.refetch()}
          />
        </div>
      ) : null}

      {trades.isSuccess && items.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium">
            {ended
              ? "No trades were recorded"
              : marketStatus === "draft"
                ? "Trading hasn’t opened"
                : "No trades yet"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {ended
              ? "No matched trades were recorded for this outcome."
              : marketStatus === "draft"
                ? "Trades will appear here once the market opens and orders can match."
                : "Matched trades will appear here as soon as an order fills."}
          </p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Recent trades for {outcomeName}</caption>
              <thead>
                <tr className="border-y border-border/60 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                  <th scope="col" className="px-5 py-2 font-medium">
                    Price
                  </th>
                  <th scope="col" className="px-3 py-2 text-end font-medium">
                    Quantity
                  </th>
                  <th scope="col" className="px-5 py-2 text-end font-medium">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-border/50 text-sm last:border-0"
                  >
                    <td className="tabular px-5 py-3 font-medium">
                      {formatTicksPercent(trade.price, 1)}
                    </td>
                    <td className="tabular px-3 py-3 text-end text-muted-foreground">
                      {formatQuantity(trade.quantity)}
                    </td>
                    <td className="px-5 py-3 text-end text-xs text-muted-foreground">
                      <time
                        dateTime={trade.created_at}
                        title={formatDateTime(trade.created_at)}
                      >
                        {formatRelativeTime(trade.created_at)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center border-t border-border/60 px-5 py-3">
            {trades.hasNextPage ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => trades.fetchNextPage()}
                disabled={trades.isFetchingNextPage}
              >
                {trades.isFetchingNextPage ? (
                  <>
                    <Spinner className="size-3" />
                    Loading
                  </>
                ) : (
                  "Load more trades"
                )}
              </Button>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                End of trade history
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

function formatRelativeTime(value: string) {
  const date = new Date(value).getTime()
  if (Number.isNaN(date)) return "—"
  const diff = Date.now() - date
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}
