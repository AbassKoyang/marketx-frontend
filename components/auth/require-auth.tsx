"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { ErrorState, PageLoading } from "@/components/page-states"
import { isApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/query/hooks"

export function RequireAuth({
  children,
  next,
  allowUnonboarded = false,
}: {
  children: React.ReactNode
  next?: string
  allowUnonboarded?: boolean
}) {
  const { user, error, isLoading, refetch } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const target = next ?? pathname
  const isAuthFailure =
    isApiError(error) && (error.status === 401 || error.status === 403)

  React.useEffect(() => {
    if (isAuthFailure) {
      router.replace(`/login?next=${encodeURIComponent(target)}`)
      return
    }
    if (user && !user.is_onboarded && !allowUnonboarded) {
      router.replace(`/onboarding?next=${encodeURIComponent(target)}`)
    }
  }, [allowUnonboarded, isAuthFailure, router, target, user])

  if (isLoading) {
    return <PageLoading label="Checking your session" />
  }

  if (isAuthFailure) {
    return <PageLoading label="Redirecting to sign in" />
  }

  if (error) {
    return (
      <div className="page-container py-16">
        <ErrorState
          title="We couldn’t verify your session"
          description="The account service did not respond. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  if (!user) {
    return <PageLoading label="Redirecting to sign in" />
  }

  if (!user.is_onboarded && !allowUnonboarded) {
    return <PageLoading label="Finishing account setup" />
  }

  return <>{children}</>
}
