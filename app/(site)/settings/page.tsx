import type { Metadata } from "next"

import { RequireAuth } from "@/components/auth/require-auth"
import { SettingsView } from "@/components/account/settings-view"

export const metadata: Metadata = {
  title: "Settings",
  description: "Appearance and session settings for your MarketX account.",
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <div className="page-container py-10 md:py-14">
        <SettingsView />
      </div>
    </RequireAuth>
  )
}
