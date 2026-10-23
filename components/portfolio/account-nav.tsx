"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const links = [
  { href: "/portfolio", label: "Overview", exact: true },
  { href: "/portfolio/positions", label: "Positions" },
  { href: "/portfolio/orders", label: "Orders" },
  { href: "/wallet", label: "Wallet" },
]

export function AccountNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Portfolio sections"
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-border/70 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm transition-[border-color,color] duration-150",
              active
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
