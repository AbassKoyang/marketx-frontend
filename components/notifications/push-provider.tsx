"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  NotificationBlock01Icon,
  NotificationSnooze01Icon,
} from "@hugeicons/core-free-icons"
import { isSupported, onMessage } from "firebase/messaging"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/page-states"
import { messaging } from "@/lib/firebase"
import { pushDestination } from "@/lib/notifications"
import {
  enablePushNotifications,
  getPushToken,
  markPushPrompted,
  pushPermission,
  shouldPromptForPush,
  subscribePushPermission,
  syncPushDevice,
  type PushSupport,
} from "@/lib/push-notifications"
import { useAuth } from "@/lib/query/hooks"

type PushContextValue = {
  permission: PushSupport
  busy: boolean
  enable: () => Promise<boolean>
  openPrompt: () => void
}

const PushContext = React.createContext<PushContextValue | null>(null)

export function usePushNotifications(): PushContextValue {
  const value = React.useContext(PushContext)
  if (!value) {
    throw new Error("usePushNotifications must be used inside PushNotificationsProvider")
  }
  return value
}

/**
 * Keeps the signed-in user's browser registered for push, shows the first-run
 * permission prompt, and turns foreground pushes into toasts.
 */
export function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const userId = user?.id ?? null

  const permission = React.useSyncExternalStore(
    subscribePushPermission,
    pushPermission,
    () => "unknown" as PushSupport
  )
  const [busy, setBusy] = React.useState(false)
  const [promptOpen, setPromptOpen] = React.useState(false)

  const requestPrompt = React.useCallback(() => {
    if (pushPermission() === "granted") {
      void (async () => {
        const token = await getPushToken()
        if (!token) return
        await syncPushDevice(token).catch(() => undefined)
        toast.success("Push notifications are already on for this browser.")
      })()
      return
    }
    markPushPrompted()
    setPromptOpen(true)
  }, [])

  const enable = React.useCallback(async () => {
    setBusy(true)
    try {
      const token = await enablePushNotifications()
      const nextPermission = pushPermission()

      if (!token) {
        if (nextPermission === "denied") {
          toast.error("Notifications are blocked for this site.", {
            description:
              "Allow notifications for MarketX in your browser settings, then try again.",
          })
        } else {
          toast.error("We couldn't turn on notifications just now.", {
            description: "Try again in a moment.",
          })
        }
        return false
      }

      await syncPushDevice(token)
      setPromptOpen(false)
      markPushPrompted()
      toast.success("Push notifications are on.", {
        description: "We'll ping you when an order fills or a market settles.",
      })
      return true
    } catch {
      toast.error("We couldn't turn on notifications just now.")
      return false
    } finally {
      setBusy(false)
    }
  }, [])

  // Device registration + first-run prompt whenever a user is present.
  React.useEffect(() => {
    if (!isAuthenticated || !userId) return

    if (permission === "default") {
      if (!shouldPromptForPush()) return
      const timer = window.setTimeout(() => {
        markPushPrompted()
        setPromptOpen(true)
      }, 700)
      return () => window.clearTimeout(timer)
    }

    if (permission !== "granted") return

    let cancelled = false
    void (async () => {
      const token = await getPushToken()
      if (!token || cancelled) return
      try {
        await syncPushDevice(token)
      } catch {
        // The device list is best effort; the feed still works without push.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, permission, userId])

  // Foreground messages: toast + refresh the feed and the unread badge.
  React.useEffect(() => {
    if (!messaging) return

    let unsubscribe: (() => void) | undefined
    let cancelled = false

    void (async () => {
      try {
        if (!(await isSupported())) return
        const stop = onMessage(messaging, (payload) => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] })
          const data = payload.data ?? {}
          const title = payload.notification?.title || "New MarketX activity"
          const body = payload.notification?.body || ""
          toast(title, {
            description: body,
            duration: 9000,
            action: {
              label: "Open",
              onClick: () => router.push(pushDestination(data)),
            },
          })
        })
        if (cancelled) stop()
        else unsubscribe = stop
      } catch {
        // Unsupported browser: stay silent.
      }
    })()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [queryClient, router])

  const value = React.useMemo(
    () => ({ permission, busy, enable, openPrompt: requestPrompt }),
    [permission, busy, enable, requestPrompt]
  )

  return (
    <PushContext.Provider value={value}>
      {children}
      <PushPermissionDialog
        open={promptOpen}
        busy={busy}
        onEnable={enable}
        onClose={() => setPromptOpen(false)}
      />
    </PushContext.Provider>
  )
}

function PushPermissionDialog({
  open,
  busy,
  onEnable,
  onClose,
}: {
  open: boolean
  busy: boolean
  onEnable: () => Promise<boolean>
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface text-foreground">
            <HugeiconsIcon icon={NotificationSnooze01Icon} className="size-5" strokeWidth={1.6} />
          </span>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg tracking-[-0.02em]">
              Turn on notifications
            </DialogTitle>
            <DialogDescription>
              Get a quiet ping when an order fills, a market you follow closes,
              or a position settles. No marketing, and you can turn it off any
              time.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="mt-1 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
          <p className="flex items-center gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="size-4 text-foreground/80"
              strokeWidth={1.7}
            />
            Order fills and settlements
          </p>
          <p className="mt-1.5 flex items-center gap-2">
            <HugeiconsIcon
              icon={NotificationBlock01Icon}
              className="size-4 text-foreground/80"
              strokeWidth={1.7}
            />
            Never used for advertising
          </p>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Not now
          </Button>
          <Button onClick={() => void onEnable()} disabled={busy}>
            {busy ? <Spinner className="size-3.5" /> : null}
            Enable notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
