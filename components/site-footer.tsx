import Link from "next/link"

import { Brand } from "@/components/brand"

const exploreLinks = [
  { href: "/markets", label: "All markets" },
  { href: "/search", label: "Search" },
  { href: "/activity", label: "Activity" },
]

const accountLinks = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/wallet", label: "Wallet" },
  { href: "/settings", label: "Settings" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface/40">
      <div className="page-container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A quieter way to trade what happens next. Prices are set by
              conviction, one limit order at a time.
            </p>
          </div>

          <div>
            <p className="quiet-label">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="quiet-label">Account</p>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MarketX</p>
          <p>Clear questions. Considered trades.</p>
        </div>
      </div>
    </footer>
  )
}
