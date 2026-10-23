"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api/client"
import type { UserProfile } from "@/lib/api/types"
import { useGoogleLogin } from "@/lib/query/hooks"

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""

let scriptPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-marketx-google="true"]'
    )
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("Google sign-in failed to load.")))
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.dataset.marketxGoogle = "true"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Google sign-in failed to load."))
    document.head.appendChild(script)
  })

  return scriptPromise
}

export function GoogleSignIn({
  next = "/",
  mode = "login",
}: {
  next?: string
  mode?: "login" | "signup"
}) {
  const router = useRouter()
  const login = useGoogleLogin()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const callbackRef = React.useRef<(credential: string) => void>(() => {})
  const [width, setWidth] = React.useState(320)
  const [scriptError, setScriptError] = React.useState<string | null>(null)
  const { mutate } = login

  React.useEffect(() => {
    callbackRef.current = (credential) => {
      mutate(credential, {
        onSuccess: (user: UserProfile) => {
          toast.success(mode === "signup" ? "Welcome to MarketX" : "Signed in")
          if (!user.is_onboarded) {
            router.replace(`/onboarding?next=${encodeURIComponent(next)}`)
          } else {
            router.replace(next || "/")
          }
          router.refresh()
        },
        onError: (error) => {
          toast.error(errorMessage(error, "Google sign-in failed."))
        },
      })
    }
  }, [mode, mutate, next, router])

  React.useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateWidth = () => {
      const nextWidth = Math.min(Math.max(Math.floor(element.clientWidth), 240), 360)
      setWidth(nextWidth)
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    let cancelled = false
    const element = containerRef.current
    if (!element) return

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => callbackRef.current(response.credential),
        })
        containerRef.current.innerHTML = ""
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width,
        })
      })
      .catch((error: unknown) => {
        if (!cancelled) setScriptError(errorMessage(error, "Google sign-in failed to load."))
      })

    return () => {
      cancelled = true
    }
  }, [mode, width])

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="flex h-11 w-full items-center justify-center overflow-hidden rounded-lg"
        aria-label="Continue with Google"
      />
      {login.isPending ? (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <HugeiconsIcon
            icon={Loading03Icon}
            className="size-3.5 animate-spin"
            strokeWidth={2}
          />
          Signing you in…
        </p>
      ) : null}
      {scriptError ? (
        <p role="alert" className="text-center text-xs text-destructive">
          {scriptError}
        </p>
      ) : null}
      {login.isError ? (
        <p role="alert" className="text-center text-xs text-destructive">
          {errorMessage(login.error, "Google sign-in failed.")}
        </p>
      ) : null}
    </div>
  )
}
