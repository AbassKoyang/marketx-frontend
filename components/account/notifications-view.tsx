"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Notification01Icon,
  ReceiptTextIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"

import { AccountSettingsNav } from "@/components/account/account-settings-nav"
import { PageHeader } from "@/components/page-states"
import { Button } from "@/components/ui/button"

export function NotificationsView() {
  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description="Updates about your orders, markets, and account."
      />

      <AccountSettingsNav className="mt-6" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <section className="rounded-xl border border-border/80 bg-card px-5 py-10 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full border border-border bg-surface">
            <HugeiconsIcon
              icon={Notification01Icon}
              className="size-5"
              strokeWidth={1.5}
            />
          </span>
          <h2 className="mt-5 font-heading text-xl font-medium tracking-[-0.025em]">
            No notifications yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Order fills, market resolutions, and account updates will appear
            here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button render={<Link href="/activity" />} nativeButton={false}>
              View activity
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                data-icon="inline-end"
                strokeWidth={1.8}
              />
            </Button>
            <Button
              variant="outline"
              render={<Link href="/portfolio/orders" />}
              nativeButton={false}
            >
              Order history
            </Button>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border/80 bg-card p-5">
            <h2 className="font-heading text-base font-medium tracking-[-0.02em]">
              Where to follow activity
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.6}
                />
                <div>
                  <p className="font-medium">Activity</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    Public market events plus your own orders, fills, and
                    settlements.
                  </p>
                  <Link
                    href="/activity"
                    className="mt-1 inline-block text-xs font-medium underline-offset-4 hover:underline"
                  >
                    Open activity
                  </Link>
                </div>
              </li>
              <li className="flex gap-3">
                <HugeiconsIcon
                  icon={ReceiptTextIcon}
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.6}
                />
                <div>
                  <p className="font-medium">Orders</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    Executions, fills, and cancellations for your account.
                  </p>
                  <Link
                    href="/portfolio/orders"
                    className="mt-1 inline-block text-xs font-medium underline-offset-4 hover:underline"
                  >
                    Open orders
                  </Link>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
