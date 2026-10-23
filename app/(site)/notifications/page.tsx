import type { Metadata } from "next"

import { RequireAuth } from "@/components/auth/require-auth"
import { NotificationsView } from "@/components/account/notifications-view"

export const metadata: Metadata = {
  title: "Notifications",
  description: "How notifications work in the current MarketX build.",
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <div className="page-container py-10 md:py-14">
        <NotificationsView />
      </div>
    </RequireAuth>
  )
}
