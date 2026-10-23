import { request } from "./client"
import type {
  ActivityEvent,
  AuthMessage,
  Market,
  MarketCategory,
  MarketStats,
  OnboardingPayload,
  Order,
  OrderBook,
  PaginatedResponse,
  Position,
  PositionSummary,
  PriceHistoryRange,
  PriceHistoryResponse,
  SubmitOrderPayload,
  Trade,
  UpdateProfilePayload,
  UserProfile,
  Wallet,
  WalletLedgerEntry,
} from "./types"

export type QueryValue = string | number | boolean | null | undefined

export function queryString(params: Record<string, QueryValue> = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    search.set(key, String(value))
  }
  const value = search.toString()
  return value ? `?${value}` : ""
}

export type MarketListParams = {
  status?: string
  category?: string
  market_type?: string
  search?: string
  featured?: boolean
  page?: number
}

export type PageParams = {
  page?: number
}

export const api = {
  auth: {
    google: (token: string) =>
      request<AuthMessage>("/auth/google/", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
    logout: () =>
      request<AuthMessage>("/auth/logout/", {
        method: "POST",
        body: "{}",
      }),
    me: () => request<UserProfile>("/auth/me/"),
    onboard: (payload: OnboardingPayload) =>
      request<UserProfile>("/auth/onboard/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateProfile: (id: number, payload: UpdateProfilePayload) =>
      request<UserProfile>(`/auth/update/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },

  markets: {
    list: (params: MarketListParams = {}) =>
      request<PaginatedResponse<Market>>(`/markets/${queryString(params)}`),
    detail: (slug: string) =>
      request<Market>(`/markets/${encodeURIComponent(slug)}/`),
    stats: (slug: string) =>
      request<MarketStats>(`/markets/${encodeURIComponent(slug)}/stats/`),
    categories: () =>
      request<PaginatedResponse<MarketCategory>>("/categories/"),
    category: (slug: string) =>
      request<MarketCategory>(`/categories/${encodeURIComponent(slug)}/`),
    history: (outcomeId: number, range: PriceHistoryRange) =>
      request<PriceHistoryResponse>(
        `/outcomes/${outcomeId}/history/?${queryString({ range, limit: 1000 })}`
      ),
  },

  trading: {
    orders: (params: PageParams & { outcome?: number; active?: boolean; status?: string } = {}) =>
      request<PaginatedResponse<Order>>(`/trading/orders/${queryString(params)}`),
    submitOrder: (payload: SubmitOrderPayload) =>
      request<Order>("/trading/orders/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    cancelOrder: (id: number) =>
      request<Order>(`/trading/orders/${id}/`, { method: "DELETE" }),
    trades: (params: PageParams & { outcome?: number; mine?: boolean } = {}) =>
      request<PaginatedResponse<Trade>>(`/trading/trades/${queryString(params)}`),
    positions: (params: PageParams & { outcome?: number } = {}) =>
      request<PaginatedResponse<Position>>(
        `/trading/positions/${queryString(params)}`
      ),
    positionSummary: () =>
      request<PositionSummary>("/trading/positions/summary/"),
    orderBook: (outcomeId: number, limit = 20) =>
      request<OrderBook>(
        `/trading/order-books/${outcomeId}/?${queryString({ limit })}`
      ),
    activity: (params: PageParams & { outcome?: number } = {}) =>
      request<PaginatedResponse<ActivityEvent>>(
        `/trading/activity/${queryString(params)}`
      ),
  },

  wallet: {
    detail: () => request<Wallet>("/wallet/"),
    ledger: (params: PageParams = {}) =>
      request<PaginatedResponse<WalletLedgerEntry>>(
        `/wallet/ledger/${queryString(params)}`
      ),
  },
}
