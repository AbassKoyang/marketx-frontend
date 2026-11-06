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
    <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
      <nav className="flex items-center p-2 bg-background/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[2rem] w-full max-w-md">
        {tabs.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <HugeiconsIcon icon={Icon} className={cn("w-5 shrink-0 animate-in fade-in", isActive && "size-4.5 text-primary")} />
              <span className={cn("font-bold text-[10px]  tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 font-raleway text-muted-foreground", isActive && "text-primary")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
