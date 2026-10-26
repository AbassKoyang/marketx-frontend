import type { Metadata } from "next"

import { RequireAuth } from "@/components/auth/require-auth"
import { OrdersView } from "@/components/portfolio/orders-view"

export const metadata: Metadata = {
  title: "Orders",
  description: "Orders you have placed on MarketX.",
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <div className="page-container py-10 md:py-14">
        <OrdersView />
      </div>
    </RequireAuth>
  )
}
