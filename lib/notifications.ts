import type {
  AppNotification,
  NotificationData,
  NotificationEventType,
} from "@/lib/api/types"

const EVENT_LABELS: Record<NotificationEventType, string> = {
  order_filled: "Order filled",
  order_cancelled: "Order cancelled",
  position_settled: "Position settled",
  market_closed: "Market closed",
  system: "MarketX",
}

export function notificationEventLabel(eventType: NotificationEventType): string {
  return EVENT_LABELS[eventType] ?? "Notification"
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

/**
 * Where a notification should take the reader. Mirrors the deep-link table in
 * the notifications API guide and is duplicated inside the service worker so
 * background clicks land in the same place.
 */
export function notificationDestination(
  eventType: NotificationEventType | undefined,
  data: NotificationData = {}
): string {
  const slug = asString(data.market_slug)

  switch (eventType) {
    case "order_filled":
    case "market_closed":
      return slug ? `/markets/${slug}` : "/portfolio/orders"
    case "order_cancelled":
      return "/portfolio/orders"
    case "position_settled":
      return "/portfolio/positions"
    default:
      return "/notifications"
  }
}

export function notificationHref(notification: AppNotification): string {
  return notificationDestination(notification.event_type, notification.data)
}

/** FCM data blocks are always strings, so parse the useful values. */
export function parsePushData(data: Record<string, string> = {}) {
  return {
    notificationId: Number(data.notification_id) || null,
    eventType: (data.event_type ?? undefined) as NotificationEventType | undefined,
    marketSlug: data.market_slug ?? null,
    marketTitle: data.market_title ?? null,
    partial: data.partial === "true",
    outcomeName: data.outcome_name ?? null,
    payout: data.payout ? Number(data.payout) : undefined,
  }
}

export function pushDestination(data: Record<string, string> = {}): string {
  const parsed = parsePushData(data)
  return notificationDestination(parsed.eventType, {
    market_slug: parsed.marketSlug ?? undefined,
  })
}
