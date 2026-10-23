"use client"

import { ErrorState, Spinner } from "@/components/page-states"
import { formatQuantity, formatTicksPercent } from "@/lib/format"
import { useOrderBook } from "@/lib/query/hooks"
import type { OrderBookLevel } from "@/lib/api/types"
import { cn } from "@/lib/utils"

function BookSide({
  title,
  levels,
  emptyLabel,
  maxQuantity,
}: {
  title: string
  levels: OrderBookLevel[]
  emptyLabel: string
  maxQuantity: number
}) {
  return (
    <div className="min-w-0 p-4">
      <div className="flex items-center justify-between text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        <span>{title}</span>
        <span>Qty</span>
      </div>
      <table className="mt-2 w-full table-fixed border-collapse">
        <caption className="sr-only">{title} order book levels</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Price</th>
            <th scope="col">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {levels.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-6 text-center text-xs text-muted-foreground">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            levels.map((level, index) => {
              const width =
                maxQuantity > 0 ? Math.max((level.quantity / maxQuantity) * 100, 4) : 0
              return (
                <tr key={`${title}-${level.price}`} className="relative">
                  <td className="relative py-1.5 pe-2">
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0.5 end-0 rounded-sm bg-foreground/[0.045]"
                      style={{ width: `${width}%` }}
                    />
                    <span
                      className={cn(
                        "tabular relative text-xs",
                        index === 0 ? "font-medium text-foreground" : "text-foreground/80"
                      )}
                    >
                      {formatTicksPercent(level.price, 1)}
                    </span>
                  </td>
                  <td className="tabular py-1.5 text-end text-xs text-muted-foreground">
                    {formatQuantity(level.quantity)}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export function OrderBookPanel({
  outcomeId,
  lastPriceTicks,
  isOpen,
}: {
  outcomeId: number
  lastPriceTicks: number | null
  isOpen: boolean
}) {
  const book = useOrderBook(outcomeId)
  const bids = (book.data?.bids ?? []).slice(0, 8)
  const asks = (book.data?.asks ?? []).slice(0, 8)
  const maxQuantity = Math.max(
    ...bids.map((level) => level.quantity),
    ...asks.map((level) => level.quantity),
    0
  )
  const bestBid = book.data?.bids[0]?.price
  const bestAsk = book.data?.asks[0]?.price
  const spread =
    bestBid !== undefined && bestAsk !== undefined ? bestAsk - bestBid : null

  return (
    <section
      aria-labelledby="order-book-title"
      className="overflow-hidden rounded-xl border border-border/80 bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <h2
            id="order-book-title"
            className="font-heading text-base font-medium tracking-[-0.02em]"
          >
            Order book
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Resting limit orders
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Last </span>
            <span className="tabular font-medium">{formatTicksPercent(lastPriceTicks, 1)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Spread </span>
            <span className="tabular font-medium">
              {spread === null ? "—" : `${(spread / 100).toFixed(1)} pts`}
            </span>
          </div>
        </div>
      </div>

      {!isOpen ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium">Trading is closed</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            The order book is cleared when a market closes.
          </p>
        </div>
      ) : book.isLoading ? (
        <div className="grid grid-cols-2 divide-x divide-border/60">
          {[0, 1].map((side) => (
            <div key={side} className="p-4">
              <div className="h-2.5 w-12 animate-pulse rounded bg-muted" />
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex justify-between gap-4">
                    <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-8 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : book.isError ? (
        <div className="px-5 py-8">
          <ErrorState
            title="Order book didn’t load"
            description="We couldn’t fetch resting orders for this outcome."
            onRetry={() => book.refetch()}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-border/60">
          <BookSide
            title="Bids"
            levels={bids}
            emptyLabel="No bids"
            maxQuantity={maxQuantity}
          />
          <BookSide
            title="Asks"
            levels={asks}
            emptyLabel="No asks"
            maxQuantity={maxQuantity}
          />
        </div>
      )}

      {book.isFetching && !book.isLoading ? (
        <div className="flex items-center gap-1.5 border-t border-border/60 px-5 py-2 text-[10px] text-muted-foreground">
          <Spinner className="size-2.5" />
          Updating
        </div>
      ) : null}
    </section>
  )
}
