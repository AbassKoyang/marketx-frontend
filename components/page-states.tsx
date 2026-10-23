import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className="quiet-label">{eyebrow}</p> : null}
        <h1 className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em] text-balance md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: IconSvgElement
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center",
        className
      )}
    >
      {icon ? (
        <span className="mb-5 inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-surface text-muted-foreground">
          <HugeiconsIcon icon={icon} className="size-5" strokeWidth={1.6} />
        </span>
      ) : null}
      <h2 className="font-heading text-lg font-medium tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t load this just now.",
  onRetry,
  retryLabel = "Try again",
}: {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <span className="mb-5 inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-surface text-muted-foreground">
        <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
          <path
            d="M12 8v5m0 3.5v.5M10.3 4.2 2.6 17.4A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3.1L13.7 4.2a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 className="font-heading text-lg font-medium tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-6" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-e-transparent",
        className
      )}
    />
  )
}

export function PageLoading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="size-5" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function MarketCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/80 p-5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-4 h-5 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-5 w-3/5 animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-6 flex justify-between">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function MarketGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <MarketCardSkeleton key={index} />
      ))}
    </div>
  )
}
