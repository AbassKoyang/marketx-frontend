import type { Metadata } from "next"

import { SearchView } from "@/components/search-view"

export const metadata: Metadata = {
  title: "Search",
  description: "Search prediction markets on MarketX.",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return <SearchView initialQuery={q?.slice(0, 120) ?? ""} />
}
