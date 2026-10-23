import type { Metadata } from "next"

import { AuthView } from "@/components/auth/auth-view"

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a MarketX account with Google.",
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return <AuthView mode="signup" next={next} />
}
