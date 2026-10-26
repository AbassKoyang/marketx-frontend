import Link from "next/link"

import { Brand } from "@/components/brand"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Brand markClassName="bg-background text-foreground" textClassName="text-background" />

        <div className="max-w-lg">
          <p className="text-[11px] font-medium tracking-[0.14em] text-background/50 uppercase">
            Prediction markets, without the noise
          </p>
          <p className="mt-6 font-heading text-5xl leading-[1.02] tracking-[-0.04em] text-balance">
            The future is priced one conviction at a time.
          </p>
          <p className="mt-6 max-w-md text-sm leading-6 text-background/60">
            Buy and sell outcomes on the events you follow. Place an order that
            executes immediately, then settle on the outcome.
          </p>
        </div>

        <div className="flex items-end justify-between gap-6 border-t border-background/15 pt-6">
          <p className="max-w-xs text-xs leading-5 text-background/50">
            One account for your portfolio, orders, and wallet.
          </p>
          <span className="quiet-label text-background/40">2026</span>
        </div>
      </aside>

      <main className="flex min-h-svh flex-col">
        <header className="flex h-16 items-center justify-between px-5 md:px-8">
          <div className="lg:hidden">
            <Brand />
          </div>
          <Link
            href="/"
            className="ms-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to markets
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 pb-16 pt-6 md:px-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  )
}
