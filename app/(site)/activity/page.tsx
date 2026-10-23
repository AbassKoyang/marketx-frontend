import type { Metadata } from "next"

import { ActivityView } from "@/components/activity-view"

export const metadata: Metadata = {
  title: "Activity",
  description:
    "Public MarketX market events and your own orders, fills, and settlements.",
}

export default function ActivityPage() {
  return <ActivityView />
}
