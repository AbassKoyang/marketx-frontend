"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ReceiptTextIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { AccountNav } from "@/components/portfolio/account-nav"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from "@/components/page-states"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/api/client"
import type { Order } from "@/lib/api/types"
import {
  formatDateTime,
  formatOrderCap,
  formatOrderStatus,
  formatQuantity,
  formatSide,
  orderIsActive,
  pluralize,
} from "@/lib/format"
import {
  useCancelOrder,
  useOrders,
} from "@/lib/query/hooks"
import { flattenPages, totalCount } from "@/lib/query/pagination"
import { cn } from "@/lib/utils"

const filters = [
  { key: "all", label: "All" },
  { key: "open", label: "Active" },
  { key: "filled", label: "Filled" },
  { key: "partial", label: "Partial" },
  { key: "cancelled", label: "Cancelled" },
] as const

type FilterKey = (typeof filters)[number]["key"]

export function OrdersView() {
  const [filter, setFilter] = React.useState<FilterKey>("all")
  const cancel = useCancelOrder()

  const params = React.useMemo(() => {
    if (filter === "open") return { active: true as const }
    if (filter === "filled") return { status: "filled" }
    if (filter === "partial") return { status: "partially_filled" }
    if (filter === "cancelled") return { status: "cancelled" }
    return {}
  }, [filter])

  const orders = useOrders(params)
  const items = flattenPages(orders.data?.pages)
  const count = totalCount(orders.data?.pages)

  const isActive = (order: Order) => orderIsActive(order)

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Orders"
        description="Every order you’ve placed, newest first. Orders execute immediately; a partial fill cancels the remainder."
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

      <div className="mt-8 flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              aria-pressed={filter === option.key}
              className={cn(
                "h-8 shrink-0 rounded-full px-3.5 text-xs font-medium transition-[background-color,color] duration-150",
                filter === option.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="tabular text-xs text-muted-foreground" aria-live="polite">
          {orders.isLoading ? "Loading…" : pluralize(count, "order")}
        </p>
      </div>

      <div className="mt-6">
        {orders.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : null}

        {orders.isError ? (
          <ErrorState
            title="Orders didn’t load"
            description="We couldn’t fetch your orders. Try again in a moment."
            onRetry={() => orders.refetch()}
          />
        ) : null}

        {orders.isSuccess && items.length === 0 ? (
          <EmptyState
            icon={ReceiptTextIcon}
            title={filter === "all" ? "No orders yet" : `No ${filter} orders`}
            description={
              filter === "all"
                ? "Orders you place on any market will appear here."
                : "Try another filter to see the rest of your order history."
            }
            action={
              filter === "all" ? (
                <Button render={<Link href="/markets" />} nativeButton={false}>
                  Find a market
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setFilter("all")}>
                  View all orders
                </Button>
              )
            }
          />
        ) : null}

        {items.length > 0 ? (
          <>
            <ul className="space-y-3">
              {items.map((order) => {
                const active = isActive(order)
                const cancelling = cancel.isPending && cancel.variables === order.id
                return (
                  <li
                    key={order.id}
                    className="rounded-xl border border-border/80 bg-card p-4 md:p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              order.side === "buy"
                                ? "border-foreground/20 text-foreground"
                                : "border-border text-muted-foreground"
                            )}
                          >
                            {formatSide(order.side)}
                          </span>
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                            {formatOrderStatus(order.status)}
                            {order.status === "partially_filled" &&
                            order.cancelled_at !== null
                              ? " · remainder cancelled"
                              : ""}
                          </span>
                        </div>
                        <Link
                          href={
                            order.market_slug
                              ? `/markets/${encodeURIComponent(order.market_slug)}`
                              : "/markets"
                          }
                          className="mt-2 block truncate font-heading text-base font-medium tracking-[-0.02em] underline-offset-4 hover:underline"
                        >
                          {order.market_title ?? "Unknown market"}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {order.outcome_name ?? "Outcome unavailable"}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Placed {formatDateTime(order.created_at)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-end justify-between gap-6 md:gap-8">
                        <dl className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm md:gap-x-8">
                          <div>
                            <dt className="text-[10px] text-muted-foreground">Slippage cap</dt>
                            <dd className="tabular mt-0.5 font-medium">
                              {formatOrderCap(order)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] text-muted-foreground">Filled</dt>
                            <dd className="tabular mt-0.5 font-medium">
                              {formatQuantity(order.filled_quantity)} /{" "}
                              {formatQuantity(order.original_quantity)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] text-muted-foreground">
                              {active ? "Remaining" : "Unfilled"}
                            </dt>
                            <dd className="tabular mt-0.5 font-medium">
                              {formatQuantity(order.remaining_quantity)}
                            </dd>
                          </div>
                        </dl>

                        {active ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancelling}
                            onClick={() =>
                              cancel.mutate(order.id, {
                                onSuccess: () => toast.success("Order cancelled"),
                                onError: (error) =>
                                  toast.error(
                                    errorMessage(
                                      error,
                                      "We couldn’t cancel that order."
                                    )
                                  ),
                              })
                            }
                          >
                            {cancelling ? (
                              <>
                                <Spinner className="size-3" />
                                Cancelling
                              </>
                            ) : (
                              "Cancel"
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 flex justify-center">
              {orders.hasNextPage ? (
                <Button
                  variant="outline"
                  onClick={() => orders.fetchNextPage()}
                  disabled={orders.isFetchingNextPage}
                >
                  {orders.isFetchingNextPage ? (
                    <>
                      <Spinner className="size-3.5" />
                      Loading more
                    </>
                  ) : (
                    "Load more orders"
                  )}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">All orders loaded.</p>
              )}
            </div>
          </>
        ) : null}
      </div>

      <p className="mt-6 text-[11px] leading-5 text-muted-foreground">
        New orders execute immediately or cancel the unfilled remainder. Only
        legacy resting orders can still be cancelled.
      </p>
    </div>
  )
}
