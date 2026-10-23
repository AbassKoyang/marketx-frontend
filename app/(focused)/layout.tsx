import Link from "next/link"

import { Brand } from "@/components/brand"

export default function FocusedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between px-5 md:px-8">
        <Brand />
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to markets
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-12 md:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
