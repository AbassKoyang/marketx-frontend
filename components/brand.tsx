import Link from "next/link"

import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-foreground text-background",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-3.5">
        <path
          d="M6.8 6.8 17.2 17.2M17.2 6.8 6.8 17.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function Brand({
  className,
  markClassName,
  textClassName,
  href = "/",
  showWordmark = true,
}: {
  className?: string
  markClassName?: string
  textClassName?: string
  href?: string
  showWordmark?: boolean
}) {
  return (
    <Link
      href={href}
      aria-label="MarketX home"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md focus-visible:outline-offset-4",
        className
      )}
    >
      <BrandMark className={markClassName} />
      {showWordmark ? (
        <span
          className={cn(
            "font-heading text-[15px] font-semibold tracking-[-0.03em] text-foreground",
            textClassName
          )}
        >
          MarketX
        </span>
      ) : null}
    </Link>
  )
}
