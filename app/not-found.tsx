import Link from "next/link"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border/70">
        <div className="page-container flex h-16 items-center">
          <Brand />
        </div>
      </header>
      <main className="page-container flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="quiet-label">404</p>
        <h1 className="mt-3 max-w-xl font-heading text-4xl font-medium tracking-[-0.04em] text-balance md:text-5xl">
          This page isn’t part of the market.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
          The link may be incorrect, or the page may have moved. Head back to the
          markets and keep exploring.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Button render={<Link href="/markets" />} nativeButton={false}>
            Browse markets
          </Button>
          <Button
            variant="outline"
            render={<Link href="/" />}
            nativeButton={false}
          >
            Go home
          </Button>
        </div>
      </main>
    </div>
  )
}
