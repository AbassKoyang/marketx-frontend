"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { AccountNav } from "@/components/portfolio/account-nav"
import { PageHeader } from "@/components/page-states"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import {
  eventDetail,
  eventLabel,
  formatCreditValue,
  formatOrderCap,
  formatOrderStatus,
  formatQuantity,
  formatRelative,
  formatSignedCreditValue,
  formatTicksPercent,
  positionUnrealizedPnl,
  positionValue,
} from "@/lib/format"
import {
  useActivity,
  useAuth,
  useOrders,
  usePositionSummary,
  usePositions,
  useWallet,
} from "@/lib/query/hooks"
import { flattenPages } from "@/lib/query/pagination"
import { cn } from "@/lib/utils"

function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <p className="px-4 py-6 text-xs text-muted-foreground">
      This section didn’t load.{" "}
      <button
        type="button"
        onClick={onRetry}
        className="font-medium text-foreground underline underline-offset-4"
      >
        Try again
      </button>
    </p>
  )
}

export function PortfolioOverview() {
  const { user } = useAuth()
  const wallet = useWallet()
  const summary = usePositionSummary()
  const positions = usePositions({})
  const orders = useOrders({})
  const activity = useActivity({})

  const positionItems = flattenPages(positions.data?.pages)
  const openPositions = positionItems.filter((position) => position.quantity > 0)
  const orderItems = flattenPages(orders.data?.pages)
  const activityItems = flattenPages(activity.data?.pages)

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title={
          user?.first_name
            ? `Hello, ${user.first_name}.`
            : "Your portfolio"
        }
        description="Your credits, open positions, and recent orders."
        actions={
          <Button
            variant="outline"
            render={<Link href="/markets" />}
            nativeButton={false}
          >
            Browse markets
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              data-icon="inline-end"
              strokeWidth={1.8}
            />
          </Button>
        }
      />

      <AccountNav className="mt-6" />

      {wallet.isError || summary.isError ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          <span>Some account balances didn’t load.</span>
          <button
            type="button"
            onClick={() => {
              wallet.refetch()
              summary.refetch()
            }}
            className="font-medium underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Available credits"
          value={wallet.data ? formatCreditValue(wallet.data.available_balance) : "—"}
          hint="Available to trade"
        />
        <StatCard
          label="Reserved credits"
          value={wallet.data ? formatCreditValue(wallet.data.reserved_balance) : "—"}
          hint="Held for legacy open orders"
        />
        <StatCard
          label="Open positions"
          value={summary.data ? formatQuantity(summary.data.open_positions) : "—"}
          hint="Outcomes with contracts held"
        />
        <StatCard
          label="Realized P&L"
          value={
            summary.data
              ? formatSignedCreditValue(summary.data.realized_pnl)
              : "—"
          }
          hint="From settled and closed positions"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section
          aria-labelledby="overview-positions"
          className="overflow-hidden rounded-xl border border-border/80 bg-card"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5">
            <h2
              id="overview-positions"
              className="font-heading text-base font-medium tracking-[-0.02em]"
            >
              Positions
            </h2>
            <Link
              href="/portfolio/positions"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {positions.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : null}

          {positions.isError ? <SectionError onRetry={() => positions.refetch()} /> : null}

          {positions.isSuccess && openPositions.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium">No open positions</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Positions appear after one of your orders fills.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                render={<Link href="/markets" />}
                nativeButton={false}
              >
                Find a market
              </Button>
            </div>
          ) : null}

          {openPositions.length > 0 ? (
            <ul className="divide-y divide-border/50">
              {openPositions.slice(0, 3).map((position) => {
                const value = positionValue(position)
                const pnl = positionUnrealizedPnl(position)
                return (
                  <li key={position.id}>
                    <Link
                      href={
                        position.market_slug
                          ? `/markets/${encodeURIComponent(position.market_slug)}`
                          : "/portfolio/positions"
                      }
                      className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {position.market_title ?? "Unknown market"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {position.outcome_name} · {formatQuantity(position.quantity)}{" "}
                          contracts
                        </p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="tabular text-sm font-medium">
                          {value === null ? "—" : formatCreditValue(value)}
                        </p>
                        <p
                          className={cn(
                            "tabular mt-0.5 text-[11px] text-muted-foreground"
                          )}
                        >
                          {pnl === null
                            ? `${formatTicksPercent(position.current_price, 1)} current`
                            : `${formatSignedCreditValue(pnl)} unrealized`}
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </section>

        <section
          aria-labelledby="overview-orders"
          className="overflow-hidden rounded-xl border border-border/80 bg-card"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5">
            <h2
              id="overview-orders"
              className="font-heading text-base font-medium tracking-[-0.02em]"
            >
              Recent orders
            </h2>
            <Link
              href="/portfolio/orders"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {orders.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : null}

          {orders.isError ? <SectionError onRetry={() => orders.refetch()} /> : null}

          {orders.isSuccess && orderItems.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium">No orders yet</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Orders you place will appear here after they execute.
              </p>
            </div>
          ) : null}

          {orderItems.length > 0 ? (
            <ul className="divide-y divide-border/50">
              {orderItems.slice(0, 3).map((order) => (
                <li key={order.id}>
                  <Link
                    href={
                      order.market_slug
                        ? `/markets/${encodeURIComponent(order.market_slug)}`
                        : "/portfolio/orders"
                    }
                    className="flex items-start justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        <span className="font-medium capitalize">{order.side}</span>{" "}
                        <span className="tabular text-muted-foreground">
                          {formatOrderCap(order)}
                        </span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {order.outcome_name ?? order.market_title} ·{" "}
                        {formatOrderStatus(order.status)}
                      </p>
                    </div>
                    <p className="tabular shrink-0 text-xs text-muted-foreground">
                      {formatQuantity(order.filled_quantity)} /{" "}
                      {formatQuantity(order.original_quantity)} filled
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <section
        aria-labelledby="overview-activity"
        className="mt-6 overflow-hidden rounded-xl border border-border/80 bg-card"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5">
          <h2
            id="overview-activity"
            className="font-heading text-base font-medium tracking-[-0.02em]"
          >
            Recent activity
          </h2>
          <Link
            href="/activity"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>

        {activity.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : null}

        {activity.isError ? <SectionError onRetry={() => activity.refetch()} /> : null}

        {activity.isSuccess && activityItems.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium">No activity yet</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Your orders, fills, and settlements will appear here.
            </p>
          </div>
        ) : null}

        {activityItems.length > 0 ? (
          <ol className="divide-y divide-border/50">
            {activityItems.slice(0, 4).map((event) => {
              const detail = eventDetail(event)
              return (
                <li key={event.id} className="flex gap-3 px-4 py-3.5">
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
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-sm font-medium">{eventLabel(event.event_type)}</p>
                      {detail ? (
                        <p className="tabular text-xs text-muted-foreground">{detail}</p>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {event.market_slug ? (
                        <Link
                          href={`/markets/${encodeURIComponent(event.market_slug)}`}
                          className="underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {event.market_title}
                        </Link>
                      ) : (
                        event.market_title
                      )}{" "}
                      · {formatRelative(event.created_at)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : null}
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-surface/50 px-4 py-3 text-xs text-muted-foreground">
        <HugeiconsIcon icon={Wallet01Icon} className="size-4" strokeWidth={1.6} />
        <span>Your balance updates as orders fill and markets settle.</span>
        <span className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />
        <Link
          href="/wallet"
          className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
        >
          View wallet <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" strokeWidth={1.8} />
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        Balances reflect your latest confirmed trades and settlements.
      </div>
    </div>
  )
}
