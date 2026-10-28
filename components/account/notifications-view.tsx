"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  CancelCircleIcon,
  ChartLineData01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  ComputerIcon,
  Notification01Icon,
  NotificationBlock01Icon,
  NotificationSnooze01Icon,
  Tick02Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { AccountSettingsNav } from "@/components/account/account-settings-nav"
import { usePushNotifications } from "@/components/notifications/push-provider"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from "@/components/page-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRelative } from "@/lib/format"
import {
  notificationEventLabel,
  notificationHref,
} from "@/lib/notifications"
import type {
  AppNotification,
  NotificationEventType,
} from "@/lib/api/types"
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/lib/query/hooks"
import { flattenPages, totalCount } from "@/lib/query/pagination"
import { cn } from "@/lib/utils"

const EVENT_ICONS: Record<NotificationEventType, IconSvgElement> = {
  order_filled: CheckmarkCircle02Icon,
  order_cancelled: CancelCircleIcon,
  position_settled: Wallet01Icon,
  market_closed: ChartLineData01Icon,
  system: Notification01Icon,
}

type Filter = "all" | "unread"

export function NotificationsView() {
  const router = useRouter()
  const [filter, setFilter] = React.useState<Filter>("all")

  const notifications = useNotifications(
    filter === "unread" ? { unread: true } : {}
  )
  const unread = useUnreadNotificationCount()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const items = flattenPages(notifications.data?.pages)
  const count = totalCount(notifications.data?.pages)
  const unreadCount = unread.data?.unread_count ?? 0

  function openNotification(notification: AppNotification) {
    if (!notification.is_read) markRead.mutate(notification.id)
    router.push(notificationHref(notification))
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description="Order fills, settlements, and market updates for your account."
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="tabular">
                {unreadCount} unread
              </Badge>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              disabled={unreadCount === 0 || markAll.isPending}
              onClick={() => markAll.mutate(undefined)}
            >
              {markAll.isPending ? <Spinner className="size-3.5" /> : null}
              Mark all read
            </Button>
          </div>
        }
      />

      <AccountSettingsNav className="mt-6" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <section>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-full border border-border/80 bg-card p-1">
              {(
                [
                  { value: "all", label: "All", count },
                  { value: "unread", label: "Unread", count: unreadCount },
                ] as const
              ).map((option) => {
                const active = filter === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(option.value)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.label}
                    {option.count > 0 ? (
                      <span
                        className={cn(
                          "tabular text-[10px]",
                          active ? "text-background/70" : "text-muted-foreground/70"
                        )}
                      >
                        {option.count}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {notifications.isFetching && !notifications.isLoading
                ? "Refreshing…"
                : "Updates arrive in real time"}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-card">
            {notifications.isLoading ? <NotificationSkeleton /> : null}

            {notifications.isError ? (
              <div className="p-5">
                <ErrorState
                  title="Notifications didn’t load"
                  description="We couldn’t fetch your notifications. Try again in a moment."
                  onRetry={() => notifications.refetch()}
                />
              </div>
            ) : null}

            {notifications.isSuccess && items.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={Notification01Icon}
                  title={
                    filter === "unread"
                      ? "Nothing unread"
                      : "No notifications yet"
                  }
                  description={
                    filter === "unread"
                      ? "You’re all caught up. New fills and settlements will show up here."
                      : "When an order fills, a market closes, or a position settles, it will appear here."
                  }
                  action={
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
              </div>
            ) : null}

            {items.length > 0 ? (
              <ul className="divide-y divide-border/70">
                {items.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-4 text-start transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none",
                        !notification.is_read && "bg-surface/40"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border",
                          notification.is_read
                            ? "border-border/70 text-muted-foreground"
                            : "border-foreground/20 bg-foreground text-background"
                        )}
                      >
                        <HugeiconsIcon
                          icon={EVENT_ICONS[notification.event_type] ?? Notification01Icon}
                          className="size-4"
                          strokeWidth={1.7}
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            {notificationEventLabel(notification.event_type)}
                          </span>
                          <span className="text-[11px] text-muted-foreground/70">
                            {formatRelative(notification.created_at)}
                          </span>
                          {!notification.is_read ? (
                            <span className="ms-auto inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                              <span className="size-1.5 rounded-full bg-foreground" />
                              New
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-sm font-medium">
                          {notification.title}
                        </span>
                        <span className="mt-0.5 block text-sm leading-6 text-muted-foreground">
                          {notification.body}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {notifications.hasNextPage ? (
              <div className="border-t border-border/70 p-3">
                <Button
                  variant="ghost"
                  className="w-full"
                  disabled={notifications.isFetchingNextPage}
                  onClick={() => notifications.fetchNextPage()}
                >
                  {notifications.isFetchingNextPage ? (
                    <Spinner className="size-3.5" />
                  ) : null}
                  Load older notifications
                </Button>
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-4">
          <PushSettingsCard />
          <QuickLinksCard />
        </div>
      </div>
    </div>
  )
}

function PushSettingsCard() {
  const { permission, busy, enable } = usePushNotifications()

  const state = (() => {
    switch (permission) {
      case "granted":
        return {
          label: "On for this browser",
          description:
            "This device is registered. Order fills, settlements, and market closures arrive as push notifications.",
          icon: Tick02Icon,
        }
      case "denied":
        return {
          label: "Blocked by the browser",
          description:
            "MarketX can’t ask again while notifications are blocked. Allow them for this site in your browser settings, then reload.",
          icon: NotificationBlock01Icon,
        }
      case "unsupported":
        return {
          label: "Not supported here",
          description:
            "This browser doesn’t support web push. You’ll still see everything in this feed.",
          icon: NotificationBlock01Icon,
        }
      default:
        return {
          label: "Not enabled",
          description:
            "Turn on push to hear about order fills and settlements without refreshing the app.",
          icon: NotificationSnooze01Icon,
        }
    }
  })()

  return (
    <section className="rounded-xl border border-border/80 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-medium tracking-[-0.02em]">
            Push notifications
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <HugeiconsIcon icon={state.icon} className="size-3.5" strokeWidth={1.7} />
            {state.label}
          </p>
        </div>
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-surface text-muted-foreground">
          <HugeiconsIcon icon={ComputerIcon} className="size-4" strokeWidth={1.6} />
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {state.description}
      </p>

      {permission === "granted" ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-foreground" />
          Device registered for this account
        </div>
      ) : null}

      {permission === "default" || permission === "unknown" ? (
        <Button
          className="mt-4 w-full"
          disabled={busy}
          onClick={() => void enable()}
        >
          {busy ? <Spinner className="size-3.5" /> : null}
          Enable notifications
        </Button>
      ) : null}

      {permission === "denied" ? (
        <ul className="mt-4 space-y-1.5 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          <li>1. Open the site settings from the icon beside the address bar.</li>
          <li>2. Set Notifications to Allow, then reload this page.</li>
        </ul>
      ) : null}
    </section>
  )
}

function QuickLinksCard() {
  return (
    <section className="rounded-xl border border-border/80 bg-card p-5">
      <h2 className="font-heading text-base font-medium tracking-[-0.02em]">
        Where to follow activity
      </h2>
      <ul className="mt-4 space-y-4 text-sm">
        <li className="flex gap-3">
          <HugeiconsIcon
            icon={Clock01Icon}
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            strokeWidth={1.6}
          />
          <div>
            <p className="font-medium">Activity</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Public market events plus your own orders, fills, and settlements.
            </p>
            <Link
              href="/activity"
              className="mt-1 inline-block text-xs font-medium underline-offset-4 hover:underline"
            >
              Open activity
            </Link>
          </div>
        </li>
        <li className="flex gap-3">
          <HugeiconsIcon
            icon={ChartLineData01Icon}
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            strokeWidth={1.6}
          />
          <div>
            <p className="font-medium">Orders</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Executions, fills, and cancellations for your account.
            </p>
            <Link
              href="/portfolio/orders"
              className="mt-1 inline-block text-xs font-medium underline-offset-4 hover:underline"
            >
              Open orders
            </Link>
          </div>
        </li>
      </ul>
    </section>
  )
}

function NotificationSkeleton() {
  return (
    <ul className="divide-y divide-border/70">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="flex gap-3 px-4 py-4">
          <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full max-w-sm animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  )
}
