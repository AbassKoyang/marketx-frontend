import type { Metadata } from "next"

import { RequireAuth } from "@/components/auth/require-auth"
import { ProfileView } from "@/components/account/profile-view"

export const metadata: Metadata = {
  title: "Profile",
  description: "Your MarketX profile and connected Google account.",
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <div className="page-container py-10 md:py-14">
        <ProfileView />
      </div>
    </RequireAuth>
  )
}
