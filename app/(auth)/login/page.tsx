import type { Metadata } from "next"

import { AuthView } from "@/components/auth/auth-view"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to MarketX with Google.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return <AuthView mode="login" next={next} />
}
