import type { MarketListParams, QuoteParams } from "@/lib/api/endpoints"
import type { PageParams } from "@/lib/api/endpoints"
import type { NotificationEventType, PriceHistoryRange } from "@/lib/api/types"

export const queryKeys = {
  me: ["me"] as const,
  wallet: ["wallet"] as const,
  categories: ["categories"] as const,
  category: (slug: string) => ["categories", slug] as const,

  markets: (params: MarketListParams) => ["markets", params] as const,
  market: (slug: string) => ["market", slug] as const,
  marketStats: (slug: string) => ["market", slug, "stats"] as const,
  outcomeHistory: (outcomeId: number, range: PriceHistoryRange) =>
    ["outcome", outcomeId, "history", range] as const,
  orderBook: (outcomeId: number) => ["outcome", outcomeId, "order-book"] as const,
  quote: (params: QuoteParams) => ["quote", params] as const,

  trades: (params: PageParams & { outcome?: number; mine?: boolean }) =>
    ["trades", params] as const,
  activity: (params: PageParams & { outcome?: number }) =>
    ["activity", params] as const,
  orders: (params: PageParams & { outcome?: number; active?: boolean; status?: string }) =>
    ["orders", params] as const,
  positions: (params: PageParams & { outcome?: number }) =>
    ["positions", params] as const,
  positionSummary: ["positions", "summary"] as const,
  ledger: (params: PageParams) => ["wallet", "ledger", params] as const,

  notifications: (params: { unread?: boolean; event_type?: NotificationEventType }) =>
    ["notifications", "list", params] as const,
  unreadCount: ["notifications", "unread"] as const,
  notificationDevices: ["notifications", "devices"] as const,
}
