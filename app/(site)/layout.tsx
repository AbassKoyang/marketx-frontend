import { MobileTabBar } from "@/components/mobile-tab-bar"
import { PushNotificationsProvider } from "@/components/notifications/push-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PushNotificationsProvider>
      <div className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-foreground px-4 py-2 text-sm text-background focus:not-sr-only focus:fixed focus:start-4 focus:top-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileTabBar />
      </div>
    </PushNotificationsProvider>
  )
}
