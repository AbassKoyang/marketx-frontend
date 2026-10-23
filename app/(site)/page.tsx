import type { Metadata } from "next"

import { LandingView } from "@/components/landing-view"

export const metadata: Metadata = {
  title: "Trade what happens next",
  description:
    "MarketX is a prediction market for the questions you follow. Trade outcomes with limit orders and follow every price.",
}

export default function HomePage() {
  return <LandingView />
}
