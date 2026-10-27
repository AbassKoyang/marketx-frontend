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
    "A quieter prediction market for the events you follow. Put your money where your mouth is.",
  applicationName: "MarketX",
  keywords: ["prediction market", "MarketX", "outcomes", "trading"],
  manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "MarketX — Trade what happens next",
    },
    openGraph: {
      title: "MarketX — Trade what happens next",
      description: "A quieter prediction market for the events you follow. Put your money where your mouth is.",
      url: "https://usemarketx.vercel.app",
      siteName: "Koyang",
      images: [
        {
          url: "https://usemarketx.vercel.app/icon-512.png",
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "MarketX — Trade what happens next",
      description: "A quieter prediction market for the events you follow. Put your money where your mouth is.",
      images: ["https://usemarketx.vercel.app/icon-512.png"]
    },
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
