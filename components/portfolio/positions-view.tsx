"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ChartLineData01Icon,
} from "@hugeicons/core-free-icons"

import { AccountNav } from "@/components/portfolio/account-nav"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from "@/components/page-states"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import {
  formatCreditValue,
  formatDate,
  formatProbability,
  formatQuantity,
  formatSignedCreditValue,
  formatTicksPercent,
  positionUnrealizedPnl,
  positionValue,
} from "@/lib/format"
import {
  usePositionSummary,
  usePositions,
} from "@/lib/query/hooks"
import { flattenPages } from "@/lib/query/pagination"

export function PositionsView() {
  const positions = usePositions({})
  const summary = usePositionSummary()
  const items = flattenPages(positions.data?.pages)

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Positions"
        description="Every outcome you hold, marked at the current market-maker price."
        actions={
          <Button
            variant="outline"
            render={<Link href="/markets" />}
            nativeButton={false}
          >
            Find markets
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              data-icon="inline-end"
              strokeWidth={1.8}
            />
          </Button>
        }
      />

      <AccountNav className="mt-6" />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Open positions"
          value={summary.data ? formatQuantity(summary.data.open_positions) : "—"}
          hint="Outcomes with contracts held"
        />
        <StatCard
          label="Total cost basis"
          value={
            summary.data ? formatCreditValue(summary.data.total_cost_basis) : "—"
          }
          hint="Credits spent on open contracts"
        />
        <StatCard
          label="Realized P&L"
          value={
            summary.data
              ? formatSignedCreditValue(summary.data.realized_pnl)
              : "—"
          }
          hint="From closed and settled positions"
        />
      </div>

      <div className="mt-8">
        {positions.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : null}

        {positions.isError ? (
          <ErrorState
            title="Positions didn’t load"
            description="We couldn’t fetch your positions. Try again in a moment."
            onRetry={() => positions.refetch()}
          />
        ) : null}

        {positions.isSuccess && items.length === 0 ? (
          <EmptyState
            icon={ChartLineData01Icon}
            title="No positions yet"
            description="When one of your orders fills, the outcome you bought or sold will appear here."
            action={
              <Button render={<Link href="/markets" />} nativeButton={false}>
                Browse markets
              </Button>
            }
          />
        ) : null}

        {items.length > 0 ? (
          <>
            <ul className="space-y-3">
              {items.map((position) => {
                const value = positionValue(position)
                const unrealized = positionUnrealizedPnl(position)
                const closed = position.quantity === 0
                return (
                  <li
                    key={position.id}
                    className="rounded-xl border border-border/80 bg-card p-4 md:p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={
                              position.market_slug
                                ? `/markets/${encodeURIComponent(position.market_slug)}`
                                : "/markets"
                            }
                            className="font-heading text-base font-medium tracking-[-0.02em] underline-offset-4 hover:underline"
                          >
                            {position.market_title ?? "Unknown market"}
                          </Link>
                          {closed ? (
                            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                              Closed
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {position.outcome_name}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {position.settled_at
                            ? `Settled ${formatDate(position.settled_at)}`
                            : position.market_status === "open" && position.market_closes_at
                              ? `Closes ${formatDate(position.market_closes_at)}`
                              : position.market_status
                                ? `Market ${position.market_status}`
                                : "Position open"}
                        </p>
                      </div>

                      <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 md:gap-x-10">
                        <div>
                          <dt className="text-[10px] text-muted-foreground">Contracts</dt>
                          <dd className="tabular mt-0.5 font-medium">
                            {formatQuantity(position.quantity)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-muted-foreground">Avg entry</dt>
                          <dd className="tabular mt-0.5 font-medium">
                            {position.average_entry_price === null
                              ? "—"
                              : formatProbability(position.average_entry_price, 1)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-muted-foreground">Current price</dt>
                          <dd className="tabular mt-0.5 font-medium">
                            {formatTicksPercent(position.current_price, 1)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-muted-foreground">Value</dt>
                          <dd className="tabular mt-0.5 font-medium">
                            {value === null ? "—" : formatCreditValue(value)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-muted-foreground">Unrealized</dt>
                          <dd className="tabular mt-0.5 font-medium">
                            {unrealized === null
                              ? "—"
                              : formatSignedCreditValue(unrealized)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-muted-foreground">Realized</dt>
                          <dd className="tabular mt-0.5 font-medium">
                            {formatSignedCreditValue(position.realized_pnl)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 flex justify-center">
              {positions.hasNextPage ? (
                <Button
                  variant="outline"
                  onClick={() => positions.fetchNextPage()}
                  disabled={positions.isFetchingNextPage}
                >
                  {positions.isFetchingNextPage ? (
                    <>
                      <Spinner className="size-3.5" />
                      Loading more
                    </>
                  ) : (
                    "Load more positions"
                  )}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">All positions loaded.</p>
              )}
            </div>
          </>
        ) : null}
      </div>

      <p className="mt-6 text-[11px] leading-5 text-muted-foreground">
        Position values use the current market-maker price for each outcome.
        They are marks, not guaranteed exit prices.
      </p>
    </div>
  )
}
