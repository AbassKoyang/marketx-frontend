"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { GoogleSignIn } from "@/components/auth/google-sign-in"
import { safeNext } from "@/lib/navigation"
import { useAuth } from "@/lib/query/hooks"

export function AuthView({
  mode,
  next,
}: {
  mode: "login" | "signup"
  next?: string
}) {
  const router = useRouter()
  const { user } = useAuth()
  const destination = safeNext(next)

  React.useEffect(() => {
    if (!user) return
    if (!user.is_onboarded) {
      router.replace(`/onboarding?next=${encodeURIComponent(destination)}`)
      return
    }
    router.replace(destination)
  }, [destination, router, user])

  const isLogin = mode === "login"

  return (
    <div>
      <p className="quiet-label">{isLogin ? "Welcome back" : "Join MarketX"}</p>
      <h1 className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em]">
        {isLogin ? "Sign in to your account" : "Create your account"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {isLogin
          ? "Continue with Google to reach your portfolio, open orders, and wallet."
          : "MarketX accounts are created with Google. You’ll choose a username in the next step."}
      </p>

      <div className="mt-8">
        <GoogleSignIn next={destination} mode={mode} />
      </div>

      <div className="mt-10 rounded-xl border border-border/80 bg-surface/60 p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          MarketX uses Google to secure your account. We never post on your
          behalf.
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            New to MarketX?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(destination)}`}
              className="font-medium text-foreground link-underline"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(destination)}`}
              className="font-medium text-foreground link-underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
