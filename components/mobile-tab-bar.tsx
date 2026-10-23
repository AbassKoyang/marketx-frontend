"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartLineData01Icon,
  Home01Icon,
  Search01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { useAuth } from "@/lib/query/hooks"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Home", icon: Home01Icon, exact: true },
  { href: "/markets", label: "Markets", icon: ChartLineData01Icon },
  { href: "/search", label: "Search", icon: Search01Icon },
  { href: "/portfolio", label: "Portfolio", icon: Wallet01Icon },
]

export function MobileTabBar() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="h-16 md:hidden" aria-hidden="true" />
      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <div className="grid h-16 grid-cols-4">
          {tabs.map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-150",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                <HugeiconsIcon icon={tab.icon} strokeWidth={active ? 2 : 1.7} className="size-5" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
