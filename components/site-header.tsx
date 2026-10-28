"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  Home01Icon,
  Logout01Icon,
  Menu01Icon,
  Notification01Icon,
  Search01Icon,
  Settings01Icon,
  UserIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { Brand } from "@/components/brand"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCreditValue, fullName, initials } from "@/lib/format"
import {
  useAuth,
  useLogout,
  useUnreadNotificationCount,
  useWallet,
} from "@/lib/query/hooks"
import { cn } from "@/lib/utils"

const primaryLinks = [
  { href: "/markets", label: "Markets" },
  { href: "/activity", label: "Activity" },
]

const accountLinks = [
  { href: "/portfolio", label: "Portfolio", icon: Home01Icon },
  { href: "/wallet", label: "Wallet", icon: Wallet01Icon },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/notifications", label: "Notifications", icon: Notification01Icon },
  { href: "/settings", label: "Settings", icon: Settings01Icon },
]

function HeaderSearch() {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState("")

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return
      }
      event.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <form
      role="search"
      className="relative hidden lg:block"
      onSubmit={(event) => {
        event.preventDefault()
        const query = value.trim()
        router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search")
      }}
    >
      <label htmlFor="header-search" className="sr-only">
        Search markets
      </label>
      <HugeiconsIcon
        icon={Search01Icon}
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.7}
      />
      <input
        ref={inputRef}
        id="header-search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search markets"
        autoComplete="off"
        className="h-9 w-52 rounded-full border border-transparent bg-muted/70 ps-9 pe-7 text-sm transition-[width,background-color,border-color,box-shadow] duration-200 ease-out placeholder:text-muted-foreground/80 hover:bg-muted focus:w-64 focus:border-foreground/15 focus:bg-background focus:ring-2 focus:ring-ring/10 focus:outline-none"
      />
      <kbd className="pointer-events-none absolute end-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background/80 px-1 font-sans text-[10px] text-muted-foreground xl:block">
        /
      </kbd>
    </form>
  )
}

function NotificationBell() {
  const { isAuthenticated, isLoading } = useAuth()
  const unread = useUnreadNotificationCount(isAuthenticated)

  if (isLoading || !isAuthenticated) return null

  const count = unread.data?.unread_count ?? 0

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={
        count > 0 ? `Notifications, ${count} unread` : "Notifications"
      }
      render={<Link href="/notifications" />}
      nativeButton={false}
    >
      <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.7} />
      {count > 0 ? (
        <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Button>
  )
}

function WalletIndicator() {
  const { isAuthenticated, isLoading } = useAuth()
  const wallet = useWallet(isAuthenticated)

  if (isLoading) {
    return <Skeleton className="hidden h-9 w-28 rounded-full sm:block" />
  }

  if (!isAuthenticated) return null

  return (
    <Link
      href="/wallet"
      className="hidden h-9 items-center gap-2 rounded-full border border-border/80 px-3.5 text-sm transition-colors duration-150 ease-out hover:border-foreground/20 hover:bg-muted/60 sm:inline-flex"
    >
      <HugeiconsIcon icon={Wallet01Icon} className="size-4 text-muted-foreground" strokeWidth={1.7} />
      <span className="tabular font-medium">
        {wallet.data ? formatCreditValue(wallet.data.available_balance) : "—"}
      </span>
      <span className="text-xs text-muted-foreground">credits</span>
    </Link>
  )
}

function AccountMenu() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const logout = useLogout()
  const router = useRouter()

  if (isLoading) {
    return <Skeleton className="size-9 rounded-full" />
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/login" />}
          nativeButton={false}
          className={"hidden sm:inline-flex"}
        >
          Sign in
        </Button>
        <Button size="sm" render={<Link href="/signup" />} nativeButton={false}>
          Get started
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open account menu"
            className="rounded-full transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        }
      >
        <Avatar size="lg" className="size-9">
          {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
          <AvatarFallback className="text-xs font-medium">
            {initials(user.first_name, user.last_name, user.username)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 py-2">
            <span className="block truncate text-sm font-medium text-foreground">
              {fullName(user)}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {accountLinks.map((item) => (
          <DropdownMenuItem
            key={item.href}
            className="px-2.5 py-2"
            onClick={() => router.push(item.href)}
          >
            <HugeiconsIcon icon={item.icon} strokeWidth={1.7} />
            {item.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="px-2.5 py-2"
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.7} />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const logout = useLogout()

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.7} />
      </SheetTrigger>
      <SheetContent side="right" className="w-[86%] p-0">
        <SheetHeader className="border-b border-border/70 p-5 pb-6">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate MarketX and manage your account.
          </SheetDescription>
          <Brand />
          {isAuthenticated && user ? (
            <div className="mt-5 flex items-center gap-3">
              <Avatar>
                {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
                <AvatarFallback className="text-xs">
                  {initials(user.first_name, user.last_name, user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{fullName(user)}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              Sign in with Google to start trading.
            </p>
          )}
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
          {[...primaryLinks, ...(isAuthenticated ? accountLinks : [])].map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
                <SheetClose className={`w-full`}>
                   <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "w-full flex h-11 items-center justify-between rounded-lg px-3 text-left text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    {item.label}
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      className="size-4 opacity-40"
                      strokeWidth={1.7}
                    />
                  </button>
                </SheetClose>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border/70 p-3">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.7} />
              {logout.isPending ? "Signing out…" : "Sign out"}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                render={<Link href="/login" />}
                nativeButton={false}
              >
                Sign in
              </Button>
              <Button render={<Link href="/signup" />} nativeButton={false}>
                Get started
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="page-container flex h-16 items-center gap-5">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {primaryLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors duration-150",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <HeaderSearch />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Search markets"
            render={<Link href="/search" />}
            nativeButton={false}
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.7} />
          </Button>
          <WalletIndicator />
          <NotificationBell />
          <AccountMenu />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
