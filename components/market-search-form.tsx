"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

export function MarketSearchForm({
  size = "lg",
  placeholder = "Search markets",
  className,
  autoFocus = false,
  initialValue = "",
}: {
  size?: "default" | "lg"
  placeholder?: string
  className?: string
  autoFocus?: boolean
  initialValue?: string
}) {
  const router = useRouter()
  const [value, setValue] = React.useState(initialValue)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = value.trim()
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search")
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        "relative flex w-full items-center rounded-full border border-border bg-background transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-ring/10",
        size === "lg" ? "h-12 ps-11 pe-2" : "h-10 ps-9 pe-1.5",
        className
      )}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "start-4 size-[18px]" : "start-3 size-4"
        )}
        strokeWidth={1.7}
      />
      <label htmlFor="market-search" className="sr-only">
        {placeholder}
      </label>
      <input
        id="market-search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent outline-none placeholder:text-muted-foreground/80",
          size === "lg" ? "text-[15px]" : "text-sm"
        )}
      />
      <button
        type="submit"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:outline-none",
          size === "lg" ? "size-9" : "size-7"
        )}
      >
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          className={size === "lg" ? "size-4" : "size-3.5"}
          strokeWidth={1.8}
        />
        <span className="sr-only">Search</span>
      </button>
    </form>
  )
}
