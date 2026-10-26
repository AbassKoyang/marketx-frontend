"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Spinner } from "@/components/page-states"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/api/client"
import type {
  MarketOutcome,
  Order,
  OrderSide,
  SubmitOrderPayload,
} from "@/lib/api/types"
import {
  formatCreditValue,
  formatCredits,
  formatOrderCap,
  formatOrderStatus,
  formatProbability,
  formatQuantity,
  formatSide,
  formatTicksPercent,
  orderIsActive,
  parseDecimalInput,
} from "@/lib/format"
import {
  useAuth,
  useCancelOrder,
  useOrders,
  usePositions,
  useQuote,
  useSubmitOrder,
  useWallet,
} from "@/lib/query/hooks"
import type { QuoteParams } from "@/lib/api/endpoints"
import { flattenPages } from "@/lib/query/pagination"
import { cn } from "@/lib/utils"

function newClientOrderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `order-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function sanitizePrice(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "")
  const [whole, ...rest] = cleaned.split(".")
  const decimals = rest.join("").slice(0, 2)
  return (rest.length > 0 ? `${whole}.${decimals}` : whole).slice(0, 6)
}

function sanitizeQuantity(value: string): string {
  return value.replace(/\D/g, "").slice(0, 9)
}

type OrderType = "market" | "limit"

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function TradePanel({
  outcome,
  isTradingOpen,
  unavailable,
  className,
}: {
  outcome: MarketOutcome
  isTradingOpen: boolean
  unavailable?: { title: string; description: string }
  className?: string
}) {
  const pathname = usePathname()
  const auth = useAuth()
  const wallet = useWallet(auth.isAuthenticated)
  const positions = usePositions(
    { outcome: outcome.id },
    auth.isAuthenticated
  )
  const orders = useOrders(
    { outcome: outcome.id, active: true },
    auth.isAuthenticated
  )
  const submit = useSubmitOrder()
  const cancel = useCancelOrder()

  const [side, setSide] = React.useState<OrderSide>("buy")
  const [orderType, setOrderType] = React.useState<OrderType>("market")
  const [price, setPrice] = React.useState("")
  const [quantity, setQuantity] = React.useState("")
  const [formError, setFormError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const clientOrderId = React.useRef("")

  React.useEffect(() => {
    clientOrderId.current = newClientOrderId()
  }, [outcome.id, side, orderType, price, quantity])

  const position = flattenPages(positions.data?.pages).find(
    (item) => item.outcome === outcome.id
  )
  const availableContracts = position
    ? Math.max(position.quantity - position.reserved_quantity, 0)
    : 0
  const availableCredits = wallet.data?.available_balance
  const activeOrders = flattenPages(orders.data?.pages).filter(orderIsActive)

  const percent = parseDecimalInput(price)
  const ticks = percent === null ? null : Math.round(percent * 100)
  const quantityValue = Number.parseInt(quantity, 10)
  const validQuantity =
    Number.isFinite(quantityValue) && quantityValue > 0 && quantityValue <= 1_000_000
  const validPrice =
    percent !== null && percent >= 0.01 && percent <= 99.99 && ticks !== null
  const limitTicks = orderType === "limit" && validPrice ? ticks : undefined

  const quoteInput = React.useMemo<QuoteParams>(
    () => ({
      outcome: outcome.id,
      side,
      quantity: validQuantity ? quantityValue : 0,
      ...(limitTicks !== undefined ? { limit_price: limitTicks } : {}),
    }),
    [outcome.id, side, validQuantity, quantityValue, limitTicks]
  )
  const debouncedQuoteInput = useDebouncedValue(quoteInput, 350)
  const quoteEnabled =
    auth.isAuthenticated &&
    isTradingOpen &&
    outcome.is_active &&
    validQuantity &&
    (orderType === "market" || validPrice)
  const quote = useQuote(debouncedQuoteInput, quoteEnabled)
  const quoteIsCurrent = debouncedQuoteInput === quoteInput
  const quoteData =
    quoteEnabled && quoteIsCurrent && !quote.isPlaceholderData
      ? quote.data
      : undefined
  const quoteError =
    quoteEnabled && quoteIsCurrent && quote.isError
      ? errorMessage(quote.error, "We couldn’t price this order.")
      : null
  const quoteUpdating = quoteEnabled && (!quoteData || quote.isFetching)
  const fillableQuantity = quoteData?.fillable_quantity ?? null
  const priceAfter =
    quoteData !== null && quoteData !== undefined
      ? (quoteData.prices_after[String(outcome.id)] ?? null)
      : null
  const limitedByCopy = quoteData?.limited_by
    ? {
        limit: "Your slippage cap limits how much can fill.",
        balance: "Your available credits limit how much can fill.",
        position: "You do not hold enough contracts for this order.",
        liquidity: "Market-maker liquidity limits how much can fill.",
      }[quoteData.limited_by]
    : null
  const partiallyFillable =
    quoteData !== null && quoteData !== undefined
      ? quoteData.fillable_quantity < quoteData.requested_quantity
      : false
  const canSubmit =
    quoteData !== undefined &&
    quoteData !== null &&
    quoteData.fillable_quantity > 0 &&
    !quoteUpdating &&
    !submit.isPending

  const canCancel = !cancel.isPending

  function changeSide(nextSide: OrderSide) {
    setSide(nextSide)
    setFormError(null)
    setSuccess(null)
  }

  function changeOrderType(nextType: OrderType) {
    setOrderType(nextType)
    setFormError(null)
    setSuccess(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSuccess(null)

    if (!isTradingOpen || !outcome.is_active) {
      setFormError("This market is not accepting orders.")
      return
    }
    if (!validQuantity) {
      setFormError("Enter a whole number of contracts between 1 and 1,000,000.")
      return
    }
    if (orderType === "limit" && !validPrice) {
      setFormError("Enter a slippage cap between 0.01% and 99.99%.")
      return
    }
    if (!quoteData) {
      setFormError("Wait for the quote to finish before submitting your order.")
      return
    }
    if (quoteData.fillable_quantity === 0) {
      setFormError(
        "This order cannot fill right now. Adjust the quantity or slippage cap."
      )
      return
    }

    const submittedQuote = quoteData
    const payload: SubmitOrderPayload = {
      outcome: outcome.id,
      side,
      quantity: quantityValue,
      client_order_id: clientOrderId.current || newClientOrderId(),
    }
    if (orderType === "limit" && ticks !== null) {
      payload.limit_price = ticks
    }

    submit.mutate(payload, {
      onSuccess: (order) => {
        const filled = order.filled_quantity
        const requested = order.original_quantity
        const cash = formatCredits(submittedQuote.notional)
        const priceText =
          submittedQuote.average_price_decimal === null
            ? ""
            : ` at ${formatProbability(submittedQuote.average_price_decimal, 1)}`

        if (order.status === "partially_filled" || filled < requested) {
          setSuccess(
            `${formatQuantity(filled)} of ${formatQuantity(requested)} ${
              outcome.name
            } filled${priceText} · ${cash}. The unfilled remainder was cancelled.`
          )
          toast.success("Order partially filled")
        } else if (order.status === "filled") {
          setSuccess(
            `${formatSide(side)} ${formatQuantity(filled)} ${
              outcome.name
            }${priceText} · ${cash}.`
          )
          toast.success("Order filled")
        } else {
          setSuccess(
            `${formatSide(side)} ${formatQuantity(
              requested
            )} ${outcome.name} — ${formatOrderStatus(order.status)}.`
          )
          toast.success("Order submitted")
        }
        setQuantity("")
      },
      onError: (error) => {
        const message = errorMessage(error, "We couldn’t place your order.")
        setFormError(message)
        toast.error(message)
      },
    })
  }

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-card",
        className
      )}
      aria-labelledby="trade-panel-title"
    >
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="quiet-label">Trade</p>
            <h2
              id="trade-panel-title"
              className="mt-1 truncate font-heading text-lg font-medium tracking-[-0.025em]"
            >
              {outcome.name}
            </h2>
          </div>
          <div className="text-end">
            <p className="tabular font-heading text-2xl font-medium tracking-[-0.03em]">
              {formatTicksPercent(outcome.current_price, 1)}
            </p>
            <p className="text-[10px] text-muted-foreground">Current price</p>
          </div>
        </div>
      </div>

      {!isTradingOpen || !outcome.is_active ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-medium">
            {outcome.is_active
              ? (unavailable?.title ?? "Trading isn’t available")
              : "Outcome unavailable"}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
            {outcome.is_active
              ? (unavailable?.description ??
                "This market is not accepting new orders right now.")
              : "This outcome is no longer active, so new orders cannot be placed."}
          </p>
        </div>
      ) : auth.isLoading ? (
        <div className="space-y-3 p-5">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      ) : !auth.isAuthenticated ? (
        <div className="px-5 py-7 text-center">
          <p className="text-sm font-medium">Sign in to trade</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
            Use your Google account to place an order.
          </p>
          <Button
            className="mt-5 w-full"
            render={
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} />
            }
            nativeButton={false}
          >
            Sign in with Google
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-5" noValidate>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/80 p-1">
            {(["buy", "sell"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeSide(option)}
                aria-pressed={side === option}
                className={cn(
                  "h-8 rounded-md text-sm font-medium transition-[background-color,color,box-shadow] duration-150",
                  side === option
                    ? "bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {formatSide(option)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/80 p-1">
            {(["market", "limit"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeOrderType(option)}
                aria-pressed={orderType === option}
                className={cn(
                  "h-8 rounded-md text-xs font-medium transition-[background-color,color,box-shadow] duration-150",
                  orderType === option
                    ? "bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option === "market" ? "Market" : "Limit"}
              </button>
            ))}
          </div>

          <p className="text-[11px] leading-5 text-muted-foreground">
            {side === "buy"
              ? "Buy contracts if you think this outcome will resolve true."
              : "Sell contracts you already hold."}{" "}
            {orderType === "market"
              ? "Market orders execute immediately at the market-maker price."
              : "Limit orders execute immediately or cancel the unfilled remainder."}
          </p>

          {orderType === "limit" ? (
            <div className="space-y-1.5">
              <label
                htmlFor={`limit-price-${outcome.id}`}
                className="flex items-center justify-between text-sm font-medium"
              >
                <span>Slippage cap</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  0.01%–99.99%
                </span>
              </label>
              <div className="relative">
                <Input
                  id={`limit-price-${outcome.id}`}
                  inputMode="decimal"
                  autoComplete="off"
                  value={price}
                  onChange={(event) => {
                    setPrice(sanitizePrice(event.target.value))
                    setFormError(null)
                    setSuccess(null)
                  }}
                  placeholder="e.g. 55"
                  className="tabular pe-8"
                  aria-describedby={`limit-price-help-${outcome.id}`}
                />
                <span className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
              <p
                id={`limit-price-help-${outcome.id}`}
                className="text-[11px] text-muted-foreground"
              >
                {side === "buy"
                  ? "The highest average price you will accept. It is a cap, not the expected price."
                  : "The lowest average price you will accept. It is a cap, not the expected price."}
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor={`quantity-${outcome.id}`}
              className="flex items-center justify-between text-sm font-medium"
            >
              <span>Quantity</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                contracts
              </span>
            </label>
            <Input
              id={`quantity-${outcome.id}`}
              inputMode="numeric"
              autoComplete="off"
              value={quantity}
              onChange={(event) => {
                setQuantity(sanitizeQuantity(event.target.value))
                setFormError(null)
                setSuccess(null)
              }}
              placeholder="0"
              className="tabular text-end"
            />
          </div>

          <div className="space-y-2 rounded-lg bg-surface px-3.5 py-3 text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">Fillable</span>
              <span className="tabular font-medium">
                {!validQuantity
                  ? "—"
                  : quoteData
                    ? `${formatQuantity(fillableQuantity)} of ${formatQuantity(
                        quoteData.requested_quantity
                      )}`
                    : quoteUpdating
                      ? "Calculating…"
                      : "—"}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">
                {side === "buy" ? "Estimated cost" : "Estimated proceeds"}
              </span>
              <span className="tabular font-medium">
                {quoteData ? formatCredits(quoteData.notional) : "—"}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">Average price</span>
              <span className="tabular font-medium">
                {quoteData && quoteData.average_price_decimal !== null
                  ? formatProbability(quoteData.average_price_decimal, 1)
                  : "—"}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">Price after fill</span>
              <span className="tabular font-medium">
                {priceAfter === null ? "—" : formatTicksPercent(priceAfter, 1)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-2">
              <span className="text-muted-foreground">
                {side === "buy" ? "Available credits" : "Available contracts"}
              </span>
              <span className="tabular font-medium">
                {side === "buy"
                  ? availableCredits === undefined
                    ? "—"
                    : formatCreditValue(availableCredits)
                  : formatQuantity(availableContracts)}
              </span>
            </div>
          </div>

          {quoteError ? (
            <p role="alert" className="text-xs leading-5 text-destructive">
              {quoteError}
            </p>
          ) : null}

          {limitedByCopy ? (
            <p className="text-xs leading-5 text-muted-foreground">
              {limitedByCopy}
            </p>
          ) : null}

          {partiallyFillable && fillableQuantity !== null && fillableQuantity > 0 ? (
            <p className="text-xs leading-5 text-muted-foreground">
              Only {formatQuantity(fillableQuantity)} of{" "}
              {formatQuantity(quoteData?.requested_quantity ?? 0)} contracts can
              fill. The unfilled remainder will be cancelled immediately.
            </p>
          ) : null}

          {quoteData && quoteData.fillable_quantity === 0 ? (
            <p className="text-xs leading-5 text-destructive">
              This order cannot fill right now. Adjust the quantity or slippage
              cap.
            </p>
          ) : null}

          {formError ? (
            <p role="alert" className="text-xs leading-5 text-destructive">
              {formError}
            </p>
          ) : null}

          {success ? (
            <p role="status" className="text-xs leading-5 text-foreground">
              {success}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!canSubmit}
          >
            {submit.isPending ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin"
                  strokeWidth={2}
                />
                Placing order…
              </>
            ) : quoteUpdating && validQuantity ? (
              "Pricing order…"
            ) : (
              <span className="truncate">
                {formatSide(side)} {outcome.name}
              </span>
            )}
          </Button>

          <p className="text-center text-[10px] leading-4 text-muted-foreground/80">
            Quotes refresh automatically. Orders execute immediately; a
            partially fillable order cancels its unfilled remainder.
          </p>
        </form>
      )}

      {auth.isAuthenticated ? (
        <OpenOrders
          orders={activeOrders}
          isLoading={orders.isLoading}
          isError={orders.isError}
          hasNextPage={orders.hasNextPage}
          isFetchingNextPage={orders.isFetchingNextPage}
          onLoadMore={() => orders.fetchNextPage()}
          onRetry={() => orders.refetch()}
          onCancel={(order) =>
            cancel.mutate(order.id, {
              onSuccess: () => {
                setSuccess(null)
                toast.success("Order cancelled")
              },
              onError: (error) =>
                toast.error(errorMessage(error, "We couldn't cancel that order.")),
            })
          }
          cancellingId={cancel.isPending ? cancel.variables : undefined}
          canCancel={canCancel}
        />
      ) : null}
    </aside>
  )
}

function OpenOrders({
  orders,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRetry,
  onCancel,
  cancellingId,
  canCancel,
}: {
  orders: Order[]
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onRetry: () => void
  onCancel: (order: Order) => void
  cancellingId?: number
  canCancel: boolean
}) {
  return (
    <div className="border-t border-border/60 px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium">Your open orders</p>
        <Link
          href="/portfolio/orders"
          className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          All orders
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-3 space-y-2.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      ) : null}

      {isError ? (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">
            Open orders didn’t load.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 text-xs font-medium underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && orders.length === 0 ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          No open orders. New orders execute immediately and never rest.
        </p>
      ) : null}

      {orders.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs">
                  <span className="font-medium">{formatSide(order.side)}</span>{" "}
                  <span className="tabular text-muted-foreground">
                    {formatOrderCap(order)}
                  </span>{" "}
                  <span className="tabular text-muted-foreground">
                    × {formatQuantity(order.remaining_quantity)}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatOrderStatus(order.status)} ·{" "}
                  {formatQuantity(order.filled_quantity)} filled
                </p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="shrink-0 text-muted-foreground"
                disabled={!canCancel || cancellingId === order.id}
                onClick={() => onCancel(order)}
              >
                {cancellingId === order.id ? (
                  <Spinner className="size-3" />
                ) : (
                  "Cancel"
                )}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {hasNextPage ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className="mt-3 text-[11px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {isFetchingNextPage ? "Loading…" : "Load more orders"}
        </button>
      ) : null}
    </div>
  )
}
