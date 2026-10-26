import type { Metadata } from "next"

import { LandingView } from "@/components/landing-view"

export const metadata: Metadata = {
  title: "Trade what happens next",
  description:
    "MarketX is a prediction market for the questions you follow. Trade outcomes at market-maker prices and follow every position.",
}

export default function HomePage() {
  return <LandingView />
}
