"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { AccountNav } from "@/components/portfolio/account-nav"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from "@/components/page-states"
import { Button } from "@/components/ui/button"
import {
  formatCreditValue,
  formatDateTime,
  formatSignedCreditValue,
  ledgerLabel,
  pluralize,
} from "@/lib/format"
import { useWallet, useWalletLedger } from "@/lib/query/hooks"
import { flattenPages } from "@/lib/query/pagination"

export function WalletView() {
  const wallet = useWallet()
  const ledger = useWalletLedger()
  const entries = flattenPages(ledger.data?.pages)

  const total =
    wallet.data !== undefined
      ? wallet.data.available_balance + wallet.data.reserved_balance
      : undefined

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Wallet"
        description="Your credits and every balance movement."
        actions={
          <Button
            variant="outline"
            render={<Link href="/portfolio/positions" />}
            nativeButton={false}
          >
            View positions
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              data-icon="inline-end"
              strokeWidth={1.8}
            />
          </Button>
        }
      />

      <AccountNav className="mt-6" />

      <div className="mt-8 overflow-hidden rounded-2xl bg-foreground p-6 text-background md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.1em] text-background/50 uppercase">
              Available balance
            </p>
            <p className="tabular mt-3 font-heading text-4xl font-medium tracking-[-0.04em] md:text-5xl">
              {wallet.data ? formatCreditValue(wallet.data.available_balance) : "—"}
              <span className="ms-2 text-base font-normal tracking-normal text-background/50">
                credits
              </span>
            </p>
          </div>

        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-background/15 pt-5">
          <div>
            <p className="text-[11px] text-background/50">Reserved</p>
            <p className="tabular mt-1 text-base font-medium">
              {wallet.data ? formatCreditValue(wallet.data.reserved_balance) : "—"}
            </p>
            <p className="mt-0.5 text-[10px] text-background/40">
              Held for legacy open orders
            </p>
          </div>
          <div>
            <p className="text-[11px] text-background/50">Total</p>
            <p className="tabular mt-1 text-base font-medium">
              {total === undefined ? "—" : formatCreditValue(total)}
            </p>
            <p className="mt-0.5 text-[10px] text-background/40">
              Available plus reserved
            </p>
          </div>
        </div>
      </div>

      {wallet.isError ? (
        <div className="mt-6">
          <ErrorState
            title="Wallet didn’t load"
            description="We couldn’t fetch your balance. Try again in a moment."
            onRetry={() => wallet.refetch()}
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <section
          aria-labelledby="ledger-title"
          className="overflow-hidden rounded-xl border border-border/80 bg-card"
        >
          <div className="flex items-end justify-between gap-3 border-b border-border/60 px-4 py-4">
            <div>
              <h2
                id="ledger-title"
                className="font-heading text-base font-medium tracking-[-0.02em]"
              >
                Ledger
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Every credit movement on your account
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {ledger.data
                ? pluralize(ledger.data.pages[0]?.count ?? 0, "entry", "entries")
                : ""}
            </p>
          </div>

          {ledger.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : null}

          {ledger.isError ? (
            <div className="p-4">
              <ErrorState
                title="Ledger didn’t load"
                description="We couldn’t fetch your wallet history."
                onRetry={() => ledger.refetch()}
              />
            </div>
          ) : null}

          {ledger.isSuccess && entries.length === 0 ? (
            <div className="px-4 py-10">
              <EmptyState
                icon={Wallet01Icon}
                title="No ledger entries"
                description="Your starting balance and every trade will be recorded here."
                className="border-0 py-0"
              />
            </div>
          ) : null}

          {entries.length > 0 ? (
            <>
              <ul className="divide-y divide-border/50">
                {entries.map((entry) => {
                  const available = entry.available_delta
                  const reserved = entry.reserved_delta
                  const label = ledgerLabel(entry)
                  const showDescription =
                    entry.description && entry.description !== label
                  return (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{label}</p>
                        {showDescription ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {entry.description}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatDateTime(entry.created_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-6 text-end">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Available</p>
                          <p className="tabular mt-0.5 text-sm font-medium">
                            {available === 0
                              ? "—"
                              : formatSignedCreditValue(available)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Reserved</p>
                          <p className="tabular mt-0.5 text-sm font-medium">
                            {reserved === 0
                              ? "—"
                              : formatSignedCreditValue(reserved)}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="flex justify-center border-t border-border/60 px-4 py-3">
                {ledger.hasNextPage ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => ledger.fetchNextPage()}
                    disabled={ledger.isFetchingNextPage}
                  >
                    {ledger.isFetchingNextPage ? (
                      <>
                        <Spinner className="size-3" />
                        Loading
                      </>
                    ) : (
                      "Load more entries"
                    )}
                  </Button>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Beginning of ledger history
                  </p>
                )}
              </div>
            </>
          ) : null}
        </section>

        <div className="space-y-4">
          <section
            aria-labelledby="credits-title"
            className="rounded-xl border border-border/80 bg-card p-5"
          >
            <h2
              id="credits-title"
              className="font-heading text-base font-medium tracking-[-0.02em]"
            >
              How credits work
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li>
                <p className="font-medium">Starting balance</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  New accounts receive a starting balance to begin trading.
                </p>
              </li>
              <li>
                <p className="font-medium">Immediate execution</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Orders execute immediately at the market-maker price. Your
                  available balance is debited or credited as each order fills.
                </p>
              </li>
              <li>
                <p className="font-medium">Settlement</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Winning contracts pay out credits when a market resolves.
                </p>
              </li>
            </ul>
          </section>

          <div className="rounded-xl border border-border/80 bg-surface/50 p-5">
            <p className="text-xs leading-5 text-muted-foreground">
              Orders never rest. Your available balance updates immediately
              whenever an order executes.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              render={<Link href="/portfolio/orders" />}
              nativeButton={false}
            >
              View order history
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
