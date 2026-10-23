import type { Metadata } from "next"

import { RequireAuth } from "@/components/auth/require-auth"
import { PortfolioOverview } from "@/components/portfolio/overview-view"

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Your MarketX positions, open orders, credits, and activity.",
}

export default function PortfolioPage() {
  return (
    <RequireAuth>
      <div className="page-container py-10 md:py-14">
        <PortfolioOverview />
      </div>
    </RequireAuth>
  )
}
