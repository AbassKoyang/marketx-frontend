"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const links = [
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
  { href: "/notifications", label: "Notifications" },
]

export function AccountSettingsNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Account settings"
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-border/70 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {links.map((link) => {
        const active = pathname === link.href
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
