import { request } from "./client"
import type {
  ActivityEvent,
  AppNotification,
  AuthMessage,
  Market,
  MarketCategory,
  MarketStats,
  NotificationDevice,
  NotificationListParams,
  OnboardingPayload,
  Order,
  OrderBook,
  PaginatedResponse,
  Position,
  PositionSummary,
  PriceHistoryRange,
  PriceHistoryResponse,
  Quote,
  RegisterDevicePayload,
  SubmitOrderPayload,
  Trade,
  UnreadCount,
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

export type QuoteParams = {
  outcome: number
  side: "buy" | "sell"
  quantity: number
  limit_price?: number
}

export const api = {
  auth: {
    google: (token: string) => 
      request<AuthMessage>({ url: "/auth/google/", method: "POST", data: { token } }),
    
    logout: () => 
      request<AuthMessage>({ url: "/auth/logout/", method: "POST" }),
    
    me: () => 
      request<UserProfile>({ url: "/auth/me/" }),
    
    onboard: (data: OnboardingPayload) => 
      request<UserProfile>({ url: "/auth/onboard/", method: "POST", data }),
    
    updateProfile: (id: number, data: UpdateProfilePayload) => 
      request<UserProfile>({ url: `/auth/update/${id}/`, method: "PATCH", data }),
  },

  markets: {
    list: (params = {}) => 
      request<PaginatedResponse<Market>>({ url: "/markets/", params }),
    
    detail: (slug: string) => 
      request<Market>({ url: `/markets/${slug}/` }),
    
    stats: (slug: string) => 
      request<MarketStats>({ url: `/markets/${slug}/stats/` }),
    
    categories: () => 
      request<PaginatedResponse<MarketCategory>>({ url: "/categories/" }),
    
    category: (slug: string) => 
      request<MarketCategory>({ url: `/categories/${slug}/` }),
    
    history: (outcomeId: number, range: PriceHistoryRange) => 
      request<PriceHistoryResponse>({ url: `/outcomes/${outcomeId}/history/`, params: { range, limit: 1000 } }),
  },

  trading: {
    orders: (params = {}) => 
      request<PaginatedResponse<Order>>({ url: "/trading/orders/", params }),
    
    submitOrder: (data: SubmitOrderPayload) => 
      request<Order>({ url: "/trading/orders/", method: "POST", data }),
    
    quote: (params: QuoteParams) =>
      request<Quote>({ url: "/trading/quote/", params }),
    
    cancelOrder: (id: number) => 
      request<Order>({ url: `/trading/orders/${id}/`, method: "DELETE" }),
    
    trades: (params = {}) => 
      request<PaginatedResponse<Trade>>({ url: "/trading/trades/", params }),
    
    positions: (params = {}) => 
      request<PaginatedResponse<Position>>({ url: "/trading/positions/", params }),
    
    positionSummary: () => 
      request<PositionSummary>({ url: "/trading/positions/summary/" }),
    
    orderBook: (outcomeId: number, limit = 20) => 
      request<OrderBook>({ url: `/trading/order-books/${outcomeId}/`, params: { limit } }),
    
    activity: (params = {}) => 
      request<PaginatedResponse<ActivityEvent>>({ url: "/trading/activity/", params }),
  },

  wallet: {
    detail: () => 
      request<Wallet>({ url: "/wallet/" }),
    
    ledger: (params = {}) => 
      request<PaginatedResponse<WalletLedgerEntry>>({ url: "/wallet/ledger/", params }),
  },

  notifications: {
    list: (params: NotificationListParams = {}) =>
      request<PaginatedResponse<AppNotification>>({
        url: "/notifications/",
        params,
      }),

    unreadCount: () =>
      request<UnreadCount>({ url: "/notifications/unread-count/" }),

    markRead: (id: number) =>
      request<AppNotification>({
        url: `/notifications/${id}/read/`,
        method: "POST",
      }),

    markAllRead: (params: { event_type?: string } = {}) =>
      request<{ updated: number }>({
        url: "/notifications/mark-all-read/",
        method: "POST",
        params,
      }),

    devices: () =>
      request<PaginatedResponse<NotificationDevice>>({
        url: "/notifications/devices/",
      }),

    registerDevice: (data: RegisterDevicePayload) =>
      request<NotificationDevice>({
        url: "/notifications/devices/",
        method: "POST",
        data,
      }),

    // The API soft-deletes the device (`is_active = False`) and answers 204.
    deactivateDevice: (id: number) =>
      request<void>({
        url: `/notifications/devices/${id}/`,
        method: "DELETE",
      }),
  },
};