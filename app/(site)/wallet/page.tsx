import type { Metadata } from "next"

import { RequireAuth } from "@/components/auth/require-auth"
import { WalletView } from "@/components/wallet/wallet-view"

export const metadata: Metadata = {
  title: "Wallet",
  description: "Your MarketX credits and ledger.",
}

export default function WalletPage() {
  return (
    <RequireAuth>
      <div className="page-container py-10 md:py-14">
        <WalletView />
      </div>
    </RequireAuth>
  )
}
