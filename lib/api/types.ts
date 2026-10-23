export type MarketStatus = "draft" | "open" | "closed" | "resolved" | "void"
export type MarketType = "binary" | "multi_outcome"
export type OrderSide = "buy" | "sell"
export type OrderStatus = "open" | "partially_filled" | "filled" | "cancelled"
export type ActivityEventType =
  | "order_placed"
  | "order_cancelled"
  | "order_filled"
  | "trade_executed"
  | "position_settled"

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type UserProfile = {
  id: number
  email: string
  first_name: string
  last_name: string
  username: string
  avatar: string | null
  is_onboarded: boolean
  is_verified: boolean
  is_staff: boolean
  auth_provider: "google" | "email"
}

export type MarketCategory = {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  is_active: boolean
  display_order: number
}

export type MarketOutcome = {
  id: number
  market: number
  name: string
  slug: string
  description: string
  image_url: string
  display_order: number
  is_active: boolean
  /** Integer tick value between 1 and 9999, or null before the first trade. */
  latest_price: number | null
}

export type MarketResolution = {
  winning_outcome: number | null
  is_void: boolean
  evidence_summary: string
  evidence_url: string
  resolved_at: string
}

export type Market = {
  id: number
  title: string
  slug: string
  market_type: MarketType
  question: string
  description: string
  category: MarketCategory
  resolution_criteria: string
  resolution_source_description: string
  resolution_source_url: string
  image_url: string
  image_public_id: string
  status: MarketStatus
  opens_at: string
  closes_at: string
  resolution_deadline: string
  is_featured: boolean
  outcomes: MarketOutcome[]
  resolution: MarketResolution | null
  created_at: string
  updated_at: string
}

export type Order = {
  id: number
  outcome: number
  outcome_name: string | null
  market_id: number | null
  market_title: string | null
  market_slug: string | null
  side: OrderSide
  limit_price: number
  original_quantity: number
  filled_quantity: number
  remaining_quantity: number
  status: OrderStatus
  client_order_id: string
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type Trade = {
  id: number
  execution_id: string
  outcome: number
  outcome_name: string | null
  market_id: number | null
  market_title: string | null
  market_slug: string | null
  price: number
  price_decimal: number
  quantity: number
  created_at: string
}

export type Position = {
  id: number
  outcome: number
  outcome_name: string | null
  market_id: number | null
  market_title: string | null
  market_slug: string | null
  market_status: MarketStatus | null
  market_closes_at: string | null
  quantity: number
  reserved_quantity: number
  cost_basis: number
  realized_pnl: number
  average_entry_price: number | null
  last_price: number | null
  settled_at: string | null
  updated_at: string
}

export type PositionSummary = {
  open_positions: number
  total_cost_basis: number
  realized_pnl: number
}

export type Wallet = {
  available_balance: number
  reserved_balance: number
  created_at: string
  updated_at: string
}

export type WalletLedgerEntry = {
  id: number
  entry_type: string
  available_delta: number
  reserved_delta: number
  reference_type: string
  reference_id: string
  description: string
  created_at: string
}

export type OrderBookLevel = {
  /** Integer tick value. */
  price: number
  quantity: number
}

export type OrderBook = {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

export type MarketStats = {
  latest_price: number | null
  total_volume: number
  trade_count: number
  first_trade_at: string | null
  last_trade_at: string | null
  depth: Record<string, OrderBook>
}

export type PriceHistoryPoint = {
  timestamp: number
  /** Decimal probability between 0 and 1. */
  price: number
  resolution_seconds: number
  volume: number
}

export type PriceHistoryRange = "1H" | "6H" | "1D" | "1W" | "1M" | "ALL"

export type PriceHistoryResponse = {
  data: PriceHistoryPoint[]
  pagination: {
    limit: number
    offset: number
    has_more: boolean
    next_cursor: number | null
  }
}

export type ActivityEvent = {
  id: number
  event_type: ActivityEventType
  visibility: "public" | "private"
  outcome: number | null
  outcome_name: string | null
  market_id: number | null
  market_title: string | null
  market_slug: string | null
  payload: Record<string, unknown>
  created_at: string
}

export type SubmitOrderPayload = {
  outcome: number
  side: OrderSide
  limit_price: number
  quantity: number
  client_order_id: string
}

export type AuthMessage = {
  status: boolean
  message: string
}

export type OnboardingPayload = {
  first_name?: string
  last_name?: string
  username?: string
}

export type UpdateProfilePayload = OnboardingPayload

export type NotificationDevice = {
  id: number
  token: string
  platform: "web" | "android" | "ios"
  is_active: boolean
  created_at: string
  updated_at: string
}
