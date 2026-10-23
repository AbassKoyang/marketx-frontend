import type { Metadata } from "next"

import { RequireAuth } from "@/components/auth/require-auth"
import { PositionsView } from "@/components/portfolio/positions-view"

export const metadata: Metadata = {
  title: "Positions",
  description: "Every outcome you hold on MarketX, marked to the last trade.",
}

export default function PositionsPage() {
  return (
    <RequireAuth>
      <div className="page-container py-10 md:py-14">
        <PositionsView />
      </div>
    </RequireAuth>
  )
}
