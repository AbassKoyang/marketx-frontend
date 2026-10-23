import type { Metadata } from "next"

import { OnboardingView } from "@/components/auth/onboarding-view"

export const metadata: Metadata = {
  title: "Finish setup",
  description: "Choose your MarketX username.",
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return <OnboardingView next={next} />
}
