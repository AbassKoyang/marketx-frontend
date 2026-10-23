"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ChartLineData01Icon } from "@hugeicons/core-free-icons"

import { MarketCard } from "@/components/market-card"
import {
  EmptyState,
  ErrorState,
  MarketCardSkeleton,
  MarketGridSkeleton,
  Spinner,
} from "@/components/page-states"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/lib/api/client"
import { pluralize } from "@/lib/format"
import { useCategory, useInfiniteMarkets } from "@/lib/query/hooks"
import { flattenPages, totalCount } from "@/lib/query/pagination"

export function CategoryView({ slug }: { slug: string }) {
  const category = useCategory(slug)
  const markets = useInfiniteMarkets({ category: slug })
  const items = flattenPages(markets.data?.pages)
  const count = totalCount(markets.data?.pages)
  const notFound = isApiError(category.error) && category.error.status === 404

  if (category.isLoading) {
    return (
      <div className="page-container py-10 md:py-14">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-9 w-52 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <MarketCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="page-container py-16">
        <EmptyState
          icon={ChartLineData01Icon}
          title="Category not found"
          description="This category may have been renamed or removed. Browse all markets instead."
          action={
            <Button render={<Link href="/markets" />} nativeButton={false}>
              Browse markets
            </Button>
          }
        />
      </div>
    )
  }

  if (category.isError) {
    return (
      <div className="page-container py-16">
        <ErrorState
          title="Category didn’t load"
          description="The market service may be unavailable. Try again in a moment."
          onRetry={() => category.refetch()}
        />
      </div>
    )
  }

  return (
    <div className="page-container py-10 md:py-14">
      <Link
        href="/markets"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={1.8} />
        All markets
      </Link>

      <div className="mt-5 flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="quiet-label">Category</p>
          <h1 className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em] md:text-4xl">
            {category.data?.name}
          </h1>
          {category.data?.description ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-[15px]">
              {category.data.description}
            </p>
          ) : null}
        </div>
        <p className="tabular shrink-0 text-sm text-muted-foreground" aria-live="polite">
          {markets.isLoading ? "Loading…" : pluralize(count, "market")}
        </p>
      </div>

      <div className="mt-8">
        {markets.isLoading ? <MarketGridSkeleton count={6} /> : null}

        {markets.isError ? (
          <ErrorState
            title="Markets didn’t load"
            description="The market service may be unavailable. Try again in a moment."
            onRetry={() => markets.refetch()}
          />
        ) : null}

        {markets.isSuccess && items.length === 0 ? (
          <EmptyState
            icon={ChartLineData01Icon}
            title="No markets in this category"
            description="There are no published questions here yet. Check back soon or browse every market."
            action={
              <Button variant="outline" render={<Link href="/markets" />} nativeButton={false}>
                Browse all markets
              </Button>
            }
          />
        ) : null}

        {items.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              {markets.hasNextPage ? (
                <Button
                  variant="outline"
                  onClick={() => markets.fetchNextPage()}
                  disabled={markets.isFetchingNextPage}
                >
                  {markets.isFetchingNextPage ? (
                    <>
                      <Spinner className="size-3.5" />
                      Loading more
                    </>
                  ) : (
                    "Load more markets"
                  )}
                </Button>
              ) : markets.data && markets.data.pages.length > 1 ? (
                <p className="text-xs text-muted-foreground">You’ve reached the end.</p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
