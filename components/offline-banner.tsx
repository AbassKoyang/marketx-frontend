"use client"

import { useOffline } from "next/offline"

export function OfflineBanner() {
  const isOffline = useOffline()

  if (!isOffline) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[60] border-b border-background/10 bg-foreground px-4 py-2 text-center text-xs font-medium text-background"
    >
      You’re offline. Some updates may be delayed until your connection returns.
    </div>
  )
}
