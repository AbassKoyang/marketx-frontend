import type {
  ActivityEvent,
  MarketStatus,
  OrderSide,
  OrderStatus,
  WalletLedgerEntry,
} from "@/lib/api/types"

export const CREDIT_SCALE = 10_000

const creditFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

/** Convert integer tick units (1–9999) into a decimal probability. */
export function probabilityFromTicks(ticks: number | null | undefined): number | null {
  if (ticks === null || ticks === undefined) return null
  return ticks / CREDIT_SCALE
}

/** Format integer tick units as a percentage. */
export function formatTicksPercent(
  ticks: number | null | undefined,
  digits = 0
): string {
  if (ticks === null || ticks === undefined) return "—"
  const percent = ticks / 100
  return `${percent.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`
}

/** Format a decimal probability (0–1) as a percentage. */
export function formatProbability(
  value: number | null | undefined,
  digits = 0
): string {
  if (value === null || value === undefined) return "—"
  return `${(value * 100).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`
}

/**
 * Wallet balances, reservations, cost basis, payouts, and P&L are stored as
 * whole credits. Only prices are integer ticks (1–9999).
 */
export function formatCreditValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return creditFormatter.format(value)
}

export function formatCredits(value: number | null | undefined): string {
  if (value === null || value === undefined) return "— credits"
  return `${creditFormatter.format(value)} credits`
}

export function formatSignedCreditValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  if (value === 0) return creditFormatter.format(0)
  const sign = value > 0 ? "+" : "-"
  return `${sign}${creditFormatter.format(Math.abs(value))}`
}

export function formatQuantity(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return integerFormatter.format(value)
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return compactFormatter.format(value)
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`
): string {
  return `${integerFormatter.format(count)} ${count === 1 ? singular : plural}`
}

export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatDateTime(
  value: string | number | Date | null | undefined
): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatTime(value: string | number | Date | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatRelative(
  value: string | number | Date | null | undefined,
  now = Date.now()
): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  const diff = date.getTime() - now
  const abs = Math.abs(diff)
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (abs < 45_000) return "just now"
  if (abs < 3_600_000) return formatter.format(Math.round(diff / 60_000), "minute")
  if (abs < 86_400_000) return formatter.format(Math.round(diff / 3_600_000), "hour")
  if (abs < 2_592_000_000) return formatter.format(Math.round(diff / 86_400_000), "day")
  if (abs < 31_536_000_000) return formatter.format(Math.round(diff / 2_592_000_000), "month")
  return formatter.format(Math.round(diff / 31_536_000_000), "year")
}

/** Short countdown such as "2d 4h", "18m", or "Closed". */
export function timeUntil(
  value: string | number | Date | null | undefined,
  now = Date.now()
): string {
  if (!value) return "—"
  const target = new Date(value).getTime()
  if (Number.isNaN(target)) return "—"

  const diff = target - now
  if (diff <= 0) return "Closed"

  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m`
  return "Less than a minute"
}

export function formatStatus(status: MarketStatus | null | undefined): string {
  switch (status) {
    case "draft":
      return "Draft"
    case "open":
      return "Open"
    case "closed":
      return "Closed"
    case "resolved":
      return "Resolved"
    case "void":
      return "Void"
    default:
      return "Unknown"
  }
}

export function formatOrderStatus(status: OrderStatus): string {
  switch (status) {
    case "open":
      return "Open"
    case "partially_filled":
      return "Partially filled"
    case "filled":
      return "Filled"
    case "cancelled":
      return "Cancelled"
  }
}

export function formatSide(side: OrderSide): string {
  return side === "buy" ? "Buy" : "Sell"
}

export function eventLabel(eventType: ActivityEvent["event_type"]): string {
  switch (eventType) {
    case "order_placed":
      return "Order placed"
    case "order_cancelled":
      return "Order cancelled"
    case "order_filled":
      return "Order filled"
    case "trade_executed":
      return "Trade executed"
    case "position_settled":
      return "Position settled"
    default:
      return "Activity"
  }
}

function numberFromPayload(
  payload: Record<string, unknown>,
  ...keys: string[]
): number | null {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === "number" && Number.isFinite(value)) return value
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value)
    }
  }
  return null
}

export function eventDetail(event: ActivityEvent): string | null {
  const payload = event.payload ?? {}
  const quantity = numberFromPayload(payload, "quantity", "released_quantity")
  const price = numberFromPayload(payload, "price", "limit_price")
  const payout = numberFromPayload(payload, "payout")
  const side = typeof payload.side === "string" ? payload.side : null

  switch (event.event_type) {
    case "trade_executed":
      if (quantity !== null && price !== null) {
        return `${formatQuantity(quantity)} @ ${formatTicksPercent(price, 1)}`
      }
      break
    case "order_placed":
      if (quantity !== null && price !== null) {
        return `${side === "sell" ? "Sell" : "Buy"} ${formatQuantity(quantity)} @ ${formatTicksPercent(price, 1)}`
      }
      break
    case "order_filled":
      if (quantity !== null && price !== null) {
        return `${formatQuantity(quantity)} filled @ ${formatTicksPercent(price, 1)}`
      }
      break
    case "order_cancelled":
      if (quantity !== null) {
        return `${formatQuantity(quantity)} released`
      }
      break
    case "position_settled":
      if (payout !== null) {
        return `${formatCredits(payout)} payout`
      }
      break
  }

  return null
}

export function ledgerLabel(entry: WalletLedgerEntry): string {
  const labels: Record<string, string> = {
    initial_credit: "Starting balance",
    order_reserve: "Reserved for order",
    order_release: "Reservation released",
    reserved_spend: "Spent on trade",
    available_credit: "Credits received",
  }
  return labels[entry.entry_type] ?? entry.description ?? "Wallet adjustment"
}

export function initials(
  firstName?: string | null,
  lastName?: string | null,
  username?: string | null
): string {
  const fromName = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim()
  if (fromName) return fromName.toUpperCase()
  return (username?.[0] ?? "M").toUpperCase()
}

export function fullName(user: {
  first_name?: string | null
  last_name?: string | null
  username?: string | null
}): string {
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
  return name || user.username || "MarketX member"
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function parseDecimalInput(value: string): number | null {
  const normalized = value.replace(",", ".").trim()
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

/** Current mark value of a position in credits, or null without a price. */
export function positionValue(position: {
  quantity: number
  last_price: number | null
}): number | null {
  if (position.last_price === null || position.quantity === 0) return null
  return position.quantity * position.last_price
}

/** Unrealized P&L in credits based on the last traded price. */
export function positionUnrealizedPnl(position: {
  quantity: number
  cost_basis: number
  last_price: number | null
}): number | null {
  const value = positionValue(position)
  if (value === null) return null
  return value - position.cost_basis
}
