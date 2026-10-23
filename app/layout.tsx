import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import "./globals.css"
import { OfflineBanner } from "@/components/offline-banner"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: {
    default: "MarketX — Trade what happens next",
    template: "%s · MarketX",
  },
  description:
    "A quieter prediction market for the events you follow. Set your price with limit orders and follow every outcome.",
  applicationName: "MarketX",
  keywords: ["prediction market", "MarketX", "outcomes", "limit orders"],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}
    >
      <body>
        <OfflineBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
