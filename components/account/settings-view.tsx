"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ComputerIcon,
  Loading03Icon,
  Logout01Icon,
  Moon02Icon,
  Notification01Icon,
  Sun01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { AccountSettingsNav } from "@/components/account/account-settings-nav"
import { PageHeader } from "@/components/page-states"
import { Button } from "@/components/ui/button"
import { fullName } from "@/lib/format"
import { useAuth, useLogout } from "@/lib/query/hooks"
import { cn } from "@/lib/utils"

const themes = [
  {
    value: "light",
    label: "Light",
    description: "White surfaces, near-black type.",
    icon: Sun01Icon,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Near-black surfaces, soft white type.",
    icon: Moon02Icon,
  },
  {
    value: "system",
    label: "System",
    description: "Match your device appearance.",
    icon: ComputerIcon,
  },
] as const

export function SettingsView() {
  const { user } = useAuth()
  const logout = useLogout()
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Appearance and session preferences for this browser."
      />

      <AccountSettingsNav className="mt-6" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <section
          aria-labelledby="appearance-title"
          className="rounded-xl border border-border/80 bg-card"
        >
          <div className="border-b border-border/60 px-5 py-4">
            <h2
              id="appearance-title"
              className="font-heading text-base font-medium tracking-[-0.02em]"
            >
              Appearance
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The theme is stored in this browser.
            </p>
          </div>

          <div className="grid gap-2 p-5 sm:grid-cols-3">
            {themes.map((option) => {
              const active = theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-[border-color,background-color] duration-150",
                    active
                      ? "border-foreground/30 bg-foreground/[0.03]"
                      : "border-border/80 hover:border-foreground/20"
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <HugeiconsIcon
                      icon={option.icon}
                      className="size-5"
                      strokeWidth={1.6}
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 rounded-full",
                        active
                          ? "bg-foreground"
                          : "border border-muted-foreground/50"
                      )}
                    />
                  </span>
                  <span className="mt-3 block text-sm font-medium">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border/80 bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-heading text-base font-medium tracking-[-0.02em]">
                  Account
                </h2>
                <p className="mt-1 truncate text-sm">{user ? fullName(user) : "—"}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border">
                <HugeiconsIcon icon={UserIcon} className="size-4" strokeWidth={1.6} />
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/profile" />}
                nativeButton={false}
              >
                Edit profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/wallet" />}
                nativeButton={false}
              >
                Wallet
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  data-icon="inline-end"
                  strokeWidth={1.8}
                />
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border/80 bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border">
                <HugeiconsIcon
                  icon={Notification01Icon}
                  className="size-4"
                  strokeWidth={1.6}
                />
              </span>
              <div className="min-w-0">
                <h2 className="font-heading text-base font-medium tracking-[-0.02em]">
                  Notifications
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Order fills, market resolutions, and account updates.
                </p>
                <Link
                  href="/notifications"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
                >
                  View notifications
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-3"
                    strokeWidth={1.8}
                  />
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/80 bg-card p-5">
            <h2 className="font-heading text-base font-medium tracking-[-0.02em]">
              Session
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Signing out clears this browser’s MarketX session cookies.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              {logout.isPending ? (
                <>
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="size-3.5 animate-spin"
                    strokeWidth={2}
                  />
                  Signing out…
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    icon={Logout01Icon}
                    className="size-3.5"
                    strokeWidth={1.7}
                  />
                  Sign out
                </>
              )}
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}
