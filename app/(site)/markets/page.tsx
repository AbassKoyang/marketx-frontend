import type { Metadata } from "next"

import { MarketsBrowser } from "@/components/markets-browser"

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Browse every prediction market on MarketX. Filter by status or category and follow the outcomes you care about.",
}

const allowedStatuses = new Set(["open", "closed", "resolved", "void"])

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    status?: string
    category?: string
  }>
}) {
  const params = await searchParams
  const status = params.status && allowedStatuses.has(params.status) ? params.status : ""

  const query = params.q?.slice(0, 120) ?? ""
  const category = params.category ?? ""

  return (
    <MarketsBrowser
      key={`${query}|${status}|${category}`}
      initialQuery={query}
      initialStatus={status}
      initialCategory={category}
    />
  )
}
