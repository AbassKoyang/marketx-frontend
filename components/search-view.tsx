"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { CategoryPill } from "@/components/category-pill"
import { MarketCard } from "@/components/market-card"
import { MarketSearchForm } from "@/components/market-search-form"
import { Reveal } from "@/components/motion/reveal"
import {
  EmptyState,
  ErrorState,
  MarketGridSkeleton,
  Spinner,
} from "@/components/page-states"
import { Button } from "@/components/ui/button"
import { pluralize } from "@/lib/format"
import { useCategories, useInfiniteMarkets } from "@/lib/query/hooks"
import { flattenPages, totalCount } from "@/lib/query/pagination"

export function SearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const query = initialQuery.trim()
  const markets = useInfiniteMarkets({ search: query || undefined }, Boolean(query))
  const categories = useCategories()
  const items = flattenPages(markets.data?.pages)
  const count = totalCount(markets.data?.pages)

  return (
    <div className="page-container py-10 md:py-14">
      <Reveal>
        <p className="quiet-label">Search</p>
        <h1 className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em] md:text-4xl">
          Find a market
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-[15px]">
          Search by question or topic. Results come directly from the MarketX
          market directory.
        </p>
        <div className="mt-7 max-w-xl">
          <MarketSearchForm
            key={query}
            initialValue={query}
            autoFocus
            placeholder="Search a market or question"
          />
        </div>
      </Reveal>

      {!query ? (
        <div className="mt-10">
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <span className="mx-auto mb-5 inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-surface text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} className="size-5" strokeWidth={1.6} />
            </span>
            <h2 className="font-heading text-lg font-medium tracking-[-0.02em]">
              Start with a question
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Try a team, an event, or a topic. Or browse a category below.
            </p>
            {categories.data && categories.data.results.length > 0 ? (
              <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2">
                {categories.data.results.map((category) => (
                  <CategoryPill
                    key={category.id}
                    name={category.name}
                    slug={category.slug}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-4">
            <p className="text-sm text-muted-foreground">
              Results for <span className="font-medium text-foreground">“{query}”</span>
            </p>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">
              {markets.isLoading ? "Searching…" : pluralize(count, "market")}
            </p>
          </div>

          <div className="mt-6">
            {markets.isLoading ? <MarketGridSkeleton count={6} /> : null}

            {markets.isError ? (
              <ErrorState
                title="Search didn’t complete"
                description="The market service may be unavailable. Try again in a moment."
                onRetry={() => markets.refetch()}
              />
            ) : null}

            {markets.isSuccess && items.length === 0 ? (
              <EmptyState
                icon={Search01Icon}
                title="No markets found"
                description={`Nothing matched “${query}”. Try a shorter phrase or browse all markets.`}
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
                        "Load more results"
                      )}
                    </Button>
                  ) : (
                    <Link
                      href="/markets"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Browse all markets
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={1.8} />
                    </Link>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
