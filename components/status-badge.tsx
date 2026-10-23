import type { MarketStatus } from "@/lib/api/types"
import { formatStatus } from "@/lib/format"
import { cn } from "@/lib/utils"

const styles: Record<MarketStatus, string> = {
  draft: "border-border text-muted-foreground",
  open: "border-foreground/15 bg-background text-foreground",
  closed: "border-border bg-muted/60 text-muted-foreground",
  resolved: "border-border bg-muted/60 text-muted-foreground",
  void: "border-destructive/20 bg-destructive/5 text-destructive",
}

const dots: Record<MarketStatus, string> = {
  draft: "bg-muted-foreground/50",
  open: "bg-foreground",
  closed: "bg-muted-foreground/70",
  resolved: "bg-muted-foreground/70",
  void: "bg-destructive",
}

export function StatusBadge({
  status,
  className,
}: {
  status: MarketStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium whitespace-nowrap",
        styles[status],
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", dots[status])}
      />
      {formatStatus(status)}
    </span>
  )
}
