import Link from "next/link"

import { cn } from "@/lib/utils"

export function CategoryPill({
  slug,
  name,
  active = false,
  count,
  className,
}: {
  slug?: string
  name: string
  active?: boolean
  count?: number
  className?: string
}) {
  const classes = cn(
    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-150 ease-out",
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
    className
  )

  if (!slug) {
    return <span className={classes}>{name}</span>
  }

  return (
    <Link href={`/categories/${encodeURIComponent(slug)}`} className={classes}>
      {name}
      {typeof count === "number" ? (
        <span
          className={cn(
            "tabular text-[10px]",
            active ? "text-background/60" : "text-muted-foreground/70"
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  )
}
