"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ChartLineData01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

import { CategoryPill } from "@/components/category-pill"
import { MarketCard } from "@/components/market-card"
import { MarketSearchForm } from "@/components/market-search-form"
import { Reveal } from "@/components/motion/reveal"
import {
  EmptyState,
  ErrorState,
  MarketGridSkeleton,
} from "@/components/page-states"
import { BrandMark } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { formatQuantity } from "@/lib/format"
import {
  useAuth,
  useCategories,
  useMarkets,
} from "@/lib/query/hooks"

const steps = [
  {
    title: "Choose a market",
    body: "Browse open questions and pick the outcome you believe in. Each market lists its resolution criteria and source when provided.",
  },
  {
    title: "Set your price",
    body: "Use a market order or set a slippage cap between 0.01% and 99.99%. Orders execute immediately against the market maker; any unfilled remainder is cancelled.",
  },
  {
    title: "Settle on the outcome",
    body: "When a market resolves, winning contracts pay out against its stated criteria.",
  },
]

export function LandingView() {
  const { isAuthenticated } = useAuth()
  const marketsQuery = useMarkets({ status: "open" })
  const categoriesQuery = useCategories()

  const markets = marketsQuery.data?.results.slice(0, 6) ?? []
  const categories = categoriesQuery.data?.results.slice(0, 8) ?? []
  const openCount = marketsQuery.data?.count

  return (
    <>
      <section className="surface-sheen border-b border-border/60">
        <div className="page-container grid gap-14 pt-14 pb-16 md:pt-20 md:pb-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
                Prediction markets, without the noise
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-5 font-heading text-[clamp(2.8rem,7.4vw,5.1rem)] leading-[0.97] font-medium tracking-[-0.05em] text-balance">
                Trade what happens next.
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-[17px]">
                Buy and sell outcomes on the questions you follow. Prices come
                from a market-maker pricing model, and every trade runs on
                virtual credits in a simulated prediction market.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 max-w-md">
                <MarketSearchForm placeholder="Search a market or question" />
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                <Button size="lg" render={<Link href="/markets" />} nativeButton={false}>
                  Explore markets
                  <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" strokeWidth={1.8} />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  render={<a href="#how-it-works" />}
                  nativeButton={false}
                  className="text-muted-foreground"
                >
                  How it works
                  <HugeiconsIcon icon={ArrowDown01Icon} data-icon="inline-end" strokeWidth={1.8} />
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <dl className="mt-12 flex max-w-md items-center gap-8 border-t border-border/70 pt-5">
                <div>
                  <dt className="quiet-label">Open markets</dt>
                  <dd className="tabular mt-1 text-xl font-medium">
                    {openCount === undefined ? "—" : formatQuantity(openCount)}
                  </dd>
                </div>
                <div className="h-8 w-px bg-border" aria-hidden="true" />
                <div>
                  <dt className="quiet-label">Categories</dt>
                  <dd className="tabular mt-1 text-xl font-medium">
                    {categoriesQuery.data
                      ? formatQuantity(categoriesQuery.data.count)
                      : "—"}
                  </dd>
                </div>
                <div className="h-8 w-px bg-border" aria-hidden="true" />
                <div>
                  <dt className="quiet-label">Settlement</dt>
                  <dd className="mt-1 text-sm font-medium">On resolution</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="lg:justify-self-end">
            <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-[0_24px_60px_-40px_rgb(0_0_0/0.35)]">
              <div className="flex items-center justify-between">
                <p className="quiet-label">How a price is made</p>
                <BrandMark className="size-5 rounded-[6px]" />
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <p className="text-sm font-medium">A price is a probability</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    Prices run from 0% to 100%. Across active outcomes, the
                    market-maker vector always sums to 100%.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Orders execute immediately</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    Use a market order or set a slippage cap. Nothing rests in an
                    order book, and any unfilled remainder is cancelled.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Settlement is final</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    Winning contracts pay out once a market resolves against
                    its stated criteria.
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-border/70 pt-5">
                <div
                  className="relative h-1.5 rounded-full bg-muted"
                  aria-hidden="true"
                >
                  <span className="absolute inset-y-0 start-0 w-[38%] rounded-full bg-foreground/15" />
                  <span className="absolute top-1/2 start-[38%] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground" />
                  <span className="absolute inset-y-0 end-0 w-[24%] rounded-full bg-foreground/10" />
                </div>
                <div className="mt-2 flex justify-between text-[10px] tracking-wide text-muted-foreground/80">
                  <span>0.01%</span>
                  <span>50%</span>
                  <span>99.99%</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="open-markets" className="border-b border-border/60">
        <div className="page-container py-16 md:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="quiet-label">Live now</p>
              <h2
                id="open-markets"
                className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em] md:text-4xl"
              >
                Open markets
              </h2>
            </div>
            <Link
              href="/markets"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all markets
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                strokeWidth={1.8}
              />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CategoryPill name="All markets" slug="" active className="pointer-events-none opacity-100" />
              {categories.map((category) => (
                <CategoryPill
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            {marketsQuery.isLoading ? <MarketGridSkeleton /> : null}
            {marketsQuery.isError ? (
              <ErrorState
                title="Markets didn’t load"
                description="The market service may be unavailable. Try again in a moment."
                onRetry={() => marketsQuery.refetch()}
              />
            ) : null}
            {marketsQuery.isSuccess && markets.length === 0 ? (
              <EmptyState
                icon={ChartLineData01Icon}
                title="No open markets right now"
                description="New questions are added by the MarketX team. Check the full market list for closed and resolved questions."
                action={
                  <Button variant="outline" render={<Link href="/markets" />} nativeButton={false}>
                    Browse all markets
                  </Button>
                }
              />
            ) : null}
            {markets.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {markets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-it-works-title"
        className="border-b border-border/60"
      >
        <div className="page-container grid gap-12 py-16 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="max-w-md">
            <p className="quiet-label">How it works</p>
            <h2
              id="how-it-works-title"
              className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em] md:text-4xl"
            >
              Conviction, quoted.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-[15px]">
              MarketX turns what you believe into a price. No leverage, no
              complex derivatives — just a clear question and a market to
              answer it.
            </p>
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border/80 bg-surface/60 px-4 py-3">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.7}
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Every order executes immediately, and every fill updates your
                portfolio.
              </p>
            </div>
          </div>

          <ol className="divide-y divide-border/70 border-t border-border/70">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6"
              >
                <span className="tabular text-xs font-medium text-muted-foreground/70">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-medium tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-container py-16 md:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-12 text-background md:px-12 md:py-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium tracking-[0.12em] text-background/50 uppercase">
              Your move
            </p>
            <h2 className="mt-4 font-heading text-3xl leading-[1.05] font-medium tracking-[-0.04em] text-balance md:text-[2.75rem]">
              The next price is yours to set.
            </h2>
            <p className="mt-4 text-sm leading-6 text-background/60">
              {isAuthenticated
                ? "Choose a market and place your next order. Your portfolio is ready when you are."
                : "Sign in with Google, choose a market, and place your first order."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
                render={<Link href={isAuthenticated ? "/portfolio" : "/signup"} />}
                nativeButton={false}
              >
                {isAuthenticated ? "Open portfolio" : "Create your account"}
                <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" strokeWidth={1.8} />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-background/70 hover:bg-background/10 hover:text-background"
                render={<Link href="/markets" />}
                nativeButton={false}
              >
                Browse markets
              </Button>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-20 -top-20 size-72 rounded-full border border-background/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-8 top-10 size-48 rounded-full border border-background/10"
          />
        </div>
      </section>
    </>
  )
}
