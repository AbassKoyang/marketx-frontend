import type { Metadata } from "next"

import { CategoryView } from "@/components/category-view"

export const metadata: Metadata = {
  title: "Category",
  description: "Browse prediction markets by category on MarketX.",
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CategoryView slug={slug} />
}
