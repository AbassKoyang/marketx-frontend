"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  ChartLineData01Icon,
} from "@hugeicons/core-free-icons"

import { CopyLinkButton } from "@/components/copy-link-button"
import { MarketTabs } from "@/components/market/market-tabs"
import { OrderBookPanel } from "@/components/market/order-book"
import { PriceChart } from "@/components/market/price-chart"
import { TradePanel } from "@/components/market/trade-panel"
import {
  EmptyState,
  ErrorState,
  MarketCardSkeleton,
} from "@/components/page-states"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/lib/api/client"
import type { Market, MarketStatus } from "@/lib/api/types"
import {
  formatDateTime,
  formatQuantity,
  formatRelative,
  formatTicksPercent,
  pluralize,
  timeUntil,
} from "@/lib/format"
import { useMarket, useMarketStats } from "@/lib/query/hooks"
import { cn } from "@/lib/utils"

const marketTypeLabels: Record<Market["market_type"], string> = {
  binary: "Binary",
  multi_outcome: "Multi-outcome",
}

function MarketDetailSkeleton() {
  return (
    <div className="page-container py-8 md:py-12">
      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-6 flex gap-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-5 h-10 w-full max-w-2xl animate-pulse rounded bg-muted" />
      <div className="mt-3 h-10 w-3/4 max-w-xl animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="h-[380px] animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="hidden lg:block">
          <MarketCardSkeleton />
        </div>
      </div>
    </div>
  )
}

function ResolutionCard({ market }: { market: Market }) {
  const sourceUrl =
    market.resolution_source_url?.startsWith("http") === true
      ? market.resolution_source_url
      : null
  const resolution = market.resolution
  const winningOutcome = resolution?.winning_outcome
    ? market.outcomes.find((outcome) => outcome.id === resolution.winning_outcome)
    : null
  const evidenceUrl =
    resolution?.evidence_url?.startsWith("http") === true
      ? resolution.evidence_url
      : null

  return (
    <section
      aria-labelledby="resolution-title"
      className="rounded-xl border border-border/80 bg-card p-5"
    >
      <h2
        id="resolution-title"
        className="font-heading text-base font-medium tracking-[-0.02em]"
      >
        Resolution
      </h2>
      <div className="mt-4 space-y-5">
        {resolution ? (
          <div className="space-y-4 border-b border-border/60 pb-5">
            <div>
              <p className="quiet-label">
                {resolution.is_void ? "Result" : "Winning outcome"}
              </p>
              <p className="mt-1.5 text-sm font-medium">
                {resolution.is_void
                  ? "Void — positions were returned"
                  : (winningOutcome?.name ?? "—")}
              </p>
            </div>
            {resolution.evidence_summary ? (
              <div>
                <p className="quiet-label">Resolution note</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {resolution.evidence_summary}
                </p>
                {evidenceUrl ? (
                  <a
                    href={evidenceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Open resolution evidence
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      className="size-3.5"
                      strokeWidth={1.8}
                    />
                  </a>
                ) : null}
              </div>
            ) : null}
            <p className="text-[11px] text-muted-foreground">
              Resolved {formatDateTime(resolution.resolved_at)}
            </p>
          </div>
        ) : null}

        <div>
          <p className="quiet-label">Criteria</p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {market.resolution_criteria ||
              "No resolution criteria were provided for this market."}
          </p>
        </div>

        {market.resolution_source_description ? (
          <div>
            <p className="quiet-label">Source</p>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              {market.resolution_source_description}
            </p>
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                Open resolution source
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  className="size-3.5"
                  strokeWidth={1.8}
                />
              </a>
            ) : null}
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border/60 pt-4 text-sm">
          <div>
            <dt className="text-[11px] text-muted-foreground">Trading opens</dt>
            <dd className="mt-0.5">{formatDateTime(market.opens_at)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Trading closes</dt>
            <dd className="mt-0.5">{formatDateTime(market.closes_at)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Resolution deadline</dt>
            <dd className="mt-0.5">{formatDateTime(market.resolution_deadline)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Market type</dt>
            <dd className="mt-0.5">{marketTypeLabels[market.market_type]}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export function MarketDetailView({ slug }: { slug: string }) {
  const marketQuery = useMarket(slug)
  const statsQuery = useMarketStats(slug, Boolean(marketQuery.data))
  const [selectedOutcomeId, setSelectedOutcomeId] = React.useState<number | null>(null)
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const market = marketQuery.data
  const notFound = isApiError(marketQuery.error) && marketQuery.error.status === 404

  if (marketQuery.isLoading) {
    return <MarketDetailSkeleton />
  }

  if (notFound) {
    return (
      <div className="page-container py-20">
        <EmptyState
          icon={ChartLineData01Icon}
          title="Market not found"
          description="This market may have been removed or the link may be incorrect."
          action={
            <Button render={<Link href="/markets" />} nativeButton={false}>
              Browse markets
            </Button>
          }
        />
      </div>
    )
  }

  if (marketQuery.isError || !market) {
    return (
      <div className="page-container py-20">
        <ErrorState
          title="Market didn’t load"
          description="The market service may be unavailable. Try again in a moment."
          onRetry={() => marketQuery.refetch()}
        />
      </div>
    )
  }

  const activeOutcomes = market.outcomes.filter((outcome) => outcome.is_active)
  const selectedOutcome =
    activeOutcomes.find((outcome) => outcome.id === selectedOutcomeId) ??
    activeOutcomes[0]

  if (!selectedOutcome) {
    return (
      <div className="page-container py-20">
        <EmptyState
          icon={ChartLineData01Icon}
          title="No outcomes available"
          description="This market does not have any active outcomes to trade yet."
          action={
            <Button variant="outline" render={<Link href="/markets" />} nativeButton={false}>
              Browse markets
            </Button>
          }
        />
      </div>
    )
  }

  const opensAt = new Date(market.opens_at).getTime()
  const closesAt = new Date(market.closes_at).getTime()
  const isMarketOpen = market.status === "open"
  const isTradingOpen =
    isMarketOpen &&
    opensAt <= now &&
    closesAt > now &&
    selectedOutcome.is_active

  const unavailable = (() => {
    if (market.status === "resolved") {
      return {
        title: "Market resolved",
        description:
          "This market has resolved. Trading is no longer available and positions have been settled.",
      }
    }
    if (market.status === "void") {
      return {
        title: "Market voided",
        description:
          "This market was voided. Trading is closed and no new orders are accepted.",
      }
    }
    if (market.status === "closed") {
      return {
        title: "Market closed",
        description:
          "Trading has ended and this market is awaiting resolution. Existing orders have been cleared.",
      }
    }
    if (opensAt > now) {
      return {
        title: "Trading opens soon",
        description: `Orders open ${formatDateTime(market.opens_at)}.`,
      }
    }
    if (closesAt <= now) {
      return {
        title: "Trading closed",
        description: `The trading window ended ${formatDateTime(market.closes_at)}.`,
      }
    }
    return undefined
  })()

  const statusLine = (() => {
    if (market.status === "open" && opensAt > now) {
      return `Opens ${formatDateTime(market.opens_at)}`
    }
    if (market.status === "open" && closesAt > now) {
      return `Closes in ${timeUntil(market.closes_at, now)} · ${formatDateTime(market.closes_at)}`
    }
    if (market.status === "resolved" || market.status === "void") {
      return `Trading closed ${formatRelative(market.closes_at, now)}`
    }
    if (closesAt <= now) {
      return `Trading closed ${formatRelative(market.closes_at, now)}`
    }
    return "Trading closed"
  })()

  const stats = statsQuery.data
  const displayStatus: MarketStatus =
    isMarketOpen && closesAt <= now ? "closed" : market.status
  const lastTrade = stats
    ? stats.trade_count === 0
      ? market.status === "open" || market.status === "draft"
        ? "No trades yet"
        : "No trades recorded"
      : formatRelative(stats.last_trade_at, now)
    : "—"
  const winningOutcomeId = market.resolution?.winning_outcome ?? null

  return (
    <div className="page-container py-8 md:py-12">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/markets"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={1.8} />
          Markets
        </Link>
        <span className="text-border" aria-hidden="true">
          /
        </span>
        <Link
          href={`/categories/${encodeURIComponent(market.category.slug)}`}
          className="transition-colors hover:text-foreground"
        >
          {market.category.name}
        </Link>
      </div>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={displayStatus} />
          <span className="text-xs text-muted-foreground">{statusLine}</span>
        </div>

        <h1 className="mt-4 max-w-4xl font-heading text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.04] font-medium tracking-[-0.04em] text-balance">
          {market.title}
        </h1>

        {market.description ? (
          <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-6 text-muted-foreground md:text-[15px]">
            {market.description}
          </p>
        ) : market.question && market.question !== market.title ? (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground md:text-[15px]">
            {market.question}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {pluralize(activeOutcomes.length, "outcome")} ·{" "}
            {marketTypeLabels[market.market_type]}
          </p>
          <div className="flex items-center gap-2">
            <CopyLinkButton />
            {market.resolution_source_url?.startsWith("http") ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <a
                    href={market.resolution_source_url}
                    target="_blank"
                    rel="noreferrer noopener"
                  />
                }
                nativeButton={false}
              >
                Source
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  data-icon="inline-end"
                  strokeWidth={1.7}
                />
              </Button>
            ) : null}
          </div>
        </div>

        <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-border/60 py-4">
          <div>
            <dt className="quiet-label">Contracts traded</dt>
            <dd className="tabular mt-1 text-sm font-medium">
              {stats ? formatQuantity(stats.total_volume) : "—"}
            </dd>
          </div>
          <div>
            <dt className="quiet-label">Trades</dt>
            <dd className="tabular mt-1 text-sm font-medium">
              {stats ? formatQuantity(stats.trade_count) : "—"}
            </dd>
          </div>
          <div>
            <dt className="quiet-label">Last trade</dt>
            <dd className="mt-1 text-sm font-medium">{lastTrade}</dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="outcomes-title" className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="outcomes-title" className="quiet-label">
              {isTradingOpen ? "Choose an outcome" : "Outcomes"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {market.status === "resolved"
                ? "Final outcome and settled prices."
                : market.status === "void"
                  ? "This market was voided. Prices are frozen at close."
                  : isTradingOpen
                    ? "Current market-maker prices. Active outcomes sum to 100%."
                    : opensAt > now
                      ? "Trading opens soon."
                      : closesAt <= now
                        ? "Trading is closed."
                        : "Trading has not opened yet."}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {pluralize(activeOutcomes.length, "outcome")}
          </span>
        </div>

        <div className="mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 max-w-full overflow-x-hidden">
          {activeOutcomes.map((outcome) => {
            const selected = outcome.id === selectedOutcome.id
            const won = outcome.id === winningOutcomeId
            return (
              <button
                key={outcome.id}
                type="button"
                onClick={() => setSelectedOutcomeId(outcome.id)}
                aria-pressed={selected}
                className={cn(
                  "col-span-1 flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-150",
                  selected
                    ? "border-foreground/30 bg-foreground/[0.03] shadow-[0_1px_2px_rgb(0_0_0/0.03)]"
                    : "border-border/80 bg-card hover:border-foreground/20"
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      selected
                        ? "bg-foreground"
                        : "border border-muted-foreground/50"
                    )}
                  />
                  <span className="truncate text-sm font-medium" title={outcome.name}>
                    {outcome.name}
                  </span>
                  {won ? (
                    <span className="shrink-0 rounded-full border border-foreground/15 bg-background px-1.5 py-0.5 text-[10px] font-medium">
                      Won
                    </span>
                  ) : null}
                </span>
                <span className="tabular shrink-0 text-lg font-medium tracking-[-0.02em]">
                  {formatTicksPercent(outcome.current_price, 1)}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <div className="lg:hidden">
            <TradePanel
              key={`mobile-${selectedOutcome.id}`}
              outcome={selectedOutcome}
              isTradingOpen={isTradingOpen}
              unavailable={unavailable}
            />
          </div>

          <PriceChart
            outcomeId={selectedOutcome.id}
            outcomeName={selectedOutcome.name}
            currentPriceTicks={selectedOutcome.current_price}
            marketStatus={market.status}
          />

          <OrderBookPanel
            outcomeId={selectedOutcome.id}
            currentPriceTicks={selectedOutcome.current_price}
            isOpen={isTradingOpen}
          />

          <MarketTabs
            outcomeId={selectedOutcome.id}
            outcomeName={selectedOutcome.name}
            marketStatus={market.status}
          />

          <ResolutionCard market={market} />
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <TradePanel
            key={`desktop-${selectedOutcome.id}`}
            outcome={selectedOutcome}
            isTradingOpen={isTradingOpen}
            unavailable={unavailable}
          />
        </aside>
      </div>
    </div>
  )
}
