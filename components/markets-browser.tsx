"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ChartLineData01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { MarketCard } from "@/components/market-card"
import { Reveal } from "@/components/motion/reveal"
import {
  EmptyState,
  ErrorState,
  MarketGridSkeleton,
  Spinner,
} from "@/components/page-states"
import { Button } from "@/components/ui/button"
import { flattenPages, totalCount } from "@/lib/query/pagination"
import { useCategories, useInfiniteMarkets } from "@/lib/query/hooks"
import { pluralize } from "@/lib/format"
import { cn } from "@/lib/utils"

const statusFilters = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "resolved", label: "Resolved" },
]

export function MarketsBrowser({
  initialQuery = "",
  initialStatus = "",
  initialCategory = "",
}: {
  initialQuery?: string
  initialStatus?: string
  initialCategory?: string
}) {
  const router = useRouter()
  const categories = useCategories()
  const [searchInput, setSearchInput] = React.useState(initialQuery)
  const [search, setSearch] = React.useState(initialQuery)
  const [status, setStatus] = React.useState(initialStatus)
  const [category, setCategory] = React.useState(initialCategory)

  const params = React.useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      category: category || undefined,
    }),
    [category, search, status]
  )

  const markets = useInfiniteMarkets(params)
  const items = flattenPages(markets.data?.pages)
  const count = totalCount(markets.data?.pages)
  const filtersActive = Boolean(search || status || category)

  function updateUrl(next: {
    search?: string
    status?: string
    category?: string
  }) {
    const url = new URLSearchParams()
    const nextSearch = next.search ?? search
    const nextStatus = next.status ?? status
    const nextCategory = next.category ?? category
    if (nextSearch) url.set("q", nextSearch)
    if (nextStatus) url.set("status", nextStatus)
    if (nextCategory) url.set("category", nextCategory)
    const value = url.toString()
    router.replace(value ? `/markets?${value}` : "/markets", { scroll: false })
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = searchInput.trim()
    setSearch(value)
    updateUrl({ search: value })
  }

  function resetFilters() {
    setSearch("")
    setSearchInput("")
    setStatus("")
    setCategory("")
    router.replace("/markets", { scroll: false })
  }

  return (
    <div className="page-container py-10 md:py-14">
      <Reveal>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="quiet-label">Explore</p>
            <h1 className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              Markets
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-[15px]">
              Every question on MarketX. Prices reflect current market-maker
              pricing.
            </p>
          </div>
          <p
            className="tabular text-sm text-muted-foreground"
            aria-live="polite"
          >
            {markets.isLoading
              ? "Loading markets…"
              : filtersActive
                ? `${pluralize(count, "market")} found`
                : pluralize(count, "market")}
          </p>
        </div>
      </Reveal>

      <div className="mt-8 border-y border-border/70 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form role="search" onSubmit={submitSearch} className="relative min-w-0 flex-1">
            <label htmlFor="markets-search" className="sr-only">
              Search markets
            </label>
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.7}
            />
            <input
              id="markets-search"
              name="q"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search questions"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground/80 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/10 focus-visible:outline-none"
            />
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setStatus(filter.value)
                  updateUrl({ status: filter.value })
                }}
                aria-pressed={status === filter.value}
                className={cn(
                  "h-9 rounded-full px-3.5 text-xs font-medium transition-[background-color,color] duration-150",
                  status === filter.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <label htmlFor="markets-category" className="sr-only">
              Category
            </label>
            <select
              id="markets-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                updateUrl({ category: event.target.value })
              }}
              className="h-10 w-full appearance-none rounded-lg border border-input bg-background ps-3 pe-9 text-sm transition-[border-color,box-shadow] duration-150 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/10 focus-visible:outline-none lg:w-44"
            >
              <option value="">All categories</option>
              {categories.data?.results.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.7}
            />
          </div>
        </div>

        {categories.data && categories.data.results.length > 0 ? (
          <div className="hidden mt-4 lg:flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                setCategory("")
                updateUrl({ category: "" })
              }}
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-150",
                !category
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              )}
            >
              All
            </button>
            {categories.data.results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  const nextCategory = category === item.slug ? "" : item.slug
                  setCategory(nextCategory)
                  updateUrl({ category: nextCategory })
                }}
                className={cn(
                  "inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-150",
                  category === item.slug
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {filtersActive ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Filtered results
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        {markets.isLoading ? <MarketGridSkeleton count={6} /> : null}

        {markets.isError ? (
          <ErrorState
            title="Markets didn’t load"
            description="The market service may be unavailable. Try again in a moment."
            onRetry={() => markets.refetch()}
          />
        ) : null}

        {markets.isSuccess && items && items.length === 0 ? (
          <EmptyState
            icon={ChartLineData01Icon}
            title={filtersActive ? "No markets match" : "No markets yet"}
            description={
              filtersActive
                ? "Try a different search, status, or category."
                : "When the MarketX team publishes a question, it will appear here."
            }
            action={
              filtersActive ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : null
            }
          />
        ) : null}

        {items && items.length > 0 ? (
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
                <p className="text-xs text-muted-foreground">
                  You’ve reached the end.
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
