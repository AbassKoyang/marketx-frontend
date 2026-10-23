"use client"

import * as React from "react"
import { useReducedMotion } from "framer-motion"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ErrorState, Spinner } from "@/components/page-states"
import { formatDateTime, formatProbability } from "@/lib/format"
import type { MarketStatus, PriceHistoryRange } from "@/lib/api/types"
import { usePriceHistory } from "@/lib/query/hooks"
import { cn } from "@/lib/utils"

const ranges: PriceHistoryRange[] = ["1H", "6H", "1D", "1W", "1M", "ALL"]

function axisTick(value: number, range: PriceHistoryRange): string {
  if (!Number.isFinite(value)) return ""
  const date = new Date(value)
  if (range === "1H" || range === "6H" || range === "1D") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

export function PriceChart({
  outcomeId,
  outcomeName,
  lastPriceTicks,
  marketStatus,
}: {
  outcomeId: number
  outcomeName: string
  lastPriceTicks: number | null
  marketStatus: MarketStatus
}) {
  const [range, setRange] = React.useState<PriceHistoryRange>("ALL")
  const history = usePriceHistory(outcomeId, range)
  const reduceMotion = useReducedMotion()
  const gradientId = `price-${React.useId().replace(/[:]/g, "")}`

  const data = React.useMemo(() => {
    const points = history.data?.data ?? []
    return points
      .map((point) => ({
        ...point,
        percent: Math.min(Math.max(point.price * 100, 0), 100),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [history.data])

  const first = data[0]
  const last = data[data.length - 1]
  const change = first && last ? (last.price - first.price) * 100 : null
  const current = last?.price ?? (lastPriceTicks !== null ? lastPriceTicks / 10000 : null)
  const ended = marketStatus !== "open" && marketStatus !== "draft"
  const emptyTitle = ended
    ? "No trades were recorded"
    : marketStatus === "draft"
      ? "Trading hasn’t opened"
      : "No trades yet"
  const emptyDescription = ended
    ? "This outcome closed without a matched trade."
    : marketStatus === "draft"
      ? "The chart begins after trading opens and the first trade matches."
      : "The chart begins after the first matched trade in this outcome."

  return (
    <section
      aria-labelledby="price-history-title"
      className="rounded-xl border border-border/80 bg-card"
    >
      <div className="flex flex-col gap-4 p-5 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="price-history-title"
            className="font-heading text-base font-medium tracking-[-0.02em]"
          >
            Price history
          </h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="tabular font-heading text-3xl font-medium tracking-[-0.03em]">
              {current === null ? "—" : formatProbability(current, 1)}
            </span>
            <span className="text-sm text-muted-foreground">{outcomeName}</span>
            {change !== null ? (
              <span
                className={cn(
                  "tabular text-xs",
                  change > 0
                    ? "text-foreground"
                    : change < 0
                      ? "text-muted-foreground"
                      : "text-muted-foreground"
                )}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(1)} pts over {range}
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="flex w-fit items-center gap-0.5 rounded-lg bg-muted/70 p-0.5"
          role="group"
          aria-label="Chart range"
        >
          {ranges.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={cn(
                "h-7 rounded-md px-2.5 text-[11px] font-medium transition-[background-color,color,box-shadow] duration-150",
                range === option
                  ? "bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 pb-3">
        {history.isLoading ? (
          <div className="flex h-[280px] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Loading price history
          </div>
        ) : null}

        {history.isError ? (
          <div className="flex h-[280px] items-center justify-center px-4">
            <ErrorState
              title="History didn’t load"
              description="We couldn’t fetch price history for this outcome."
              onRetry={() => history.refetch()}
            />
          </div>
        ) : null}

        {history.isSuccess && data.length === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">
              {emptyDescription}
            </p>
            {range !== "ALL" ? (
              <button
                type="button"
                onClick={() => setRange("ALL")}
                className="mt-3 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                View all history
              </button>
            ) : null}
          </div>
        ) : null}

        {data.length > 0 ? (
          <div
            className="h-[280px] w-full"
            role="img"
            aria-label={`${outcomeName} price history over ${range}. Latest ${current === null ? "unavailable" : formatProbability(current, 1)}.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
                accessibilityLayer
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value: number) => axisTick(value, range)}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                  height={28}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value: number) => `${value}%`}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 12,
                    boxShadow: "0 8px 24px -16px rgb(0 0 0 / 0.35)",
                  }}
                  labelStyle={{ color: "var(--muted-foreground)", marginBottom: 2 }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(label) => formatDateTime(label as number)}
                  formatter={(value) => {
                    const number = typeof value === "number" ? value : Number(value)
                    return [`${number.toFixed(1)}%`, "Price"]
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="percent"
                  stroke="var(--foreground)"
                  strokeWidth={1.8}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{
                    r: 3.5,
                    fill: "var(--foreground)",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={!reduceMotion}
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border/60 px-5 py-3">
        <p className="text-[11px] leading-5 text-muted-foreground/80">
          Prices reflect the last matched trade.
        </p>
      </div>
    </section>
  )
}
