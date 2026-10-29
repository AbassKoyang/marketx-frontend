import Link from "next/link"

import { StatusBadge } from "@/components/status-badge"
import type { Market } from "@/lib/api/types"
import {
  formatDate,
  formatRelative,
  formatTicksPercent,
  pluralize,
} from "@/lib/format"

export function MarketCard({ market }: { market: Market }) {
  const outcomes = [...market.outcomes]
    .filter((outcome) => outcome.is_active)
    .sort((a, b) => (b.current_price ?? -1) - (a.current_price ?? -1))
  const visibleOutcomes = outcomes.slice(0, 2)
  const hasPrice = visibleOutcomes.some((outcome) => outcome.current_price !== null)
  const resolution = market.resolution
  const settled =
    (market.status === "resolved" || market.status === "void") &&
    resolution !== null
  const winningOutcome =
    resolution?.winning_outcome !== null && resolution?.winning_outcome !== undefined
      ? outcomes.find((outcome) => outcome.id === resolution.winning_outcome)
      : null

  return (
    <Link
      href={`/markets/${encodeURIComponent(market.slug)}`}
      className="group max-w-full col-span-1 flex h-full flex-col rounded-xl border border-border/80 bg-card p-5 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_10px_30px_-18px_rgb(0_0_0/0.25)] focus-visible:-translate-y-0.5"
    >
      <div className="w-full flex items-center justify-between gap-3">
        <span className="truncate text-xs font-medium text-muted-foreground">
          {market.category.name}
        </span>
        <StatusBadge status={market.status} />
      </div>

      <h2 className="mt-3 line-clamp-3 font-heading text-[17px] leading-[1.35] font-medium tracking-[-0.02em] text-foreground decoration-foreground/30 underline-offset-4 group-hover:underline">
        {market.title}
      </h2>

      <div className="mt-5 space-y-3">
        {settled ? (
          <div className="py-1">
            <p
              className="line-clamp-2 text-sm font-medium text-foreground"
              title={
                resolution!.is_void
                  ? "Market voided"
                  : winningOutcome
                    ? `Won by ${winningOutcome.name}`
                    : "Resolved"
              }
            >
              {resolution!.is_void
                ? "Market voided"
                : winningOutcome
                  ? `Won by ${winningOutcome.name}`
                  : "Resolved"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {resolution!.is_void
                ? "Positions were returned."
                : `Resolved ${formatRelative(resolution!.resolved_at)}`}
            </p>
          </div>
        ) : hasPrice ? (
          visibleOutcomes.map((outcome) => {
            const percent = outcome.current_price === null ? 0 : outcome.current_price / 100
            return (
              <div className="w-full max-w-full" key={outcome.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-muted-foreground">
                    {outcome.name}
                  </span>
                  <span className="tabular shrink-0 text-sm font-medium text-foreground">
                    {formatTicksPercent(outcome.current_price)}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${outcome.name} current price ${formatTicksPercent(outcome.current_price)}`}
                >
                  <div
                    className="h-full rounded-full bg-foreground/80 transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-1">
            <p className="text-sm text-muted-foreground">
              Pricing unavailable
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {market.status === "open"
                ? "Prices will appear once the market-maker vector is available."
                : market.status === "draft"
                  ? "This market has not started trading yet."
                  : "This market closed without a final price vector."}
            </p>
          </div>
        )}
        {outcomes.length > 2 ? (
          <p className="text-xs text-muted-foreground/70">
            +{outcomes.length - 2} more outcomes
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span>{pluralize(outcomes.length, "outcome")}</span>
        <span>
          {market.status === "open"
            ? `Closes ${formatDate(market.closes_at)}`
            : formatDate(market.closes_at)}
        </span>
      </div>
    </Link>
  )
}
