import type { Metadata } from "next"

import { MarketDetailView } from "@/components/market-detail-view"

const apiOrigin = (
  process.env.API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000"
).replace(/\/$/, "")

async function fetchMarket(slug: string) {
  try {
    const response = await fetch(
      `${apiOrigin}/api/markets/${encodeURIComponent(slug)}/`,
      {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2500),
      }
    )
    if (!response.ok) return null
    return (await response.json()) as {
      title?: string
      description?: string
      question?: string
    }
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const market = await fetchMarket(slug)
  if (!market) {
    return {
      title: "Market",
      description: "Trade prediction markets with limit orders on MarketX.",
    }
  }

  return {
    title: market.title ?? "Market",
    description:
      market.description ||
      market.question ||
      "Trade this prediction market with limit orders on MarketX.",
  }
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <MarketDetailView slug={slug} />
}
