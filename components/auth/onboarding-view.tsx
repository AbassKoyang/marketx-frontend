"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { RequireAuth } from "@/components/auth/require-auth"
import { Field } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage, isApiError } from "@/lib/api/client"
import { safeNext } from "@/lib/navigation"
import { useAuth, useOnboard } from "@/lib/query/hooks"

function OnboardingForm({ next }: { next: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const onboard = useOnboard()
  const [firstName, setFirstName] = React.useState(user?.first_name ?? "")
  const [lastName, setLastName] = React.useState(user?.last_name ?? "")
  const [username, setUsername] = React.useState(user?.username ?? "")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (user?.is_onboarded) {
      router.replace(next)
    }
  }, [next, router, user])

  const formError = errors.non_field_errors ?? errors.detail ?? null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanFirst = firstName.trim()
    const cleanLast = lastName.trim()
    const cleanUsername = username.trim()
    const nextErrors: Record<string, string> = {}

    if (!cleanFirst) nextErrors.first_name = "Tell us your first name."
    if (!cleanLast) nextErrors.last_name = "Tell us your last name."
    if (cleanUsername.length < 3) {
      nextErrors.username = "Use at least 3 characters."
    } else if (cleanUsername.length > 30) {
      nextErrors.username = "Use 30 characters or fewer."
    } else if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      nextErrors.username = "Use letters, numbers, hyphens, or underscores."
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onboard.mutate(
      {
        first_name: cleanFirst,
        last_name: cleanLast,
        username: cleanUsername,
      },
      {
        onSuccess: () => {
          toast.success("Your account is ready")
          router.replace(next)
          router.refresh()
        },
        onError: (error) => {
          if (isApiError(error)) {
            setErrors(error.fieldErrors)
          }
          toast.error(errorMessage(error, "We couldn’t finish your setup."))
        },
      }
    )
  }

  return (
    <div>
      <p className="quiet-label">Account setup</p>
      <h1 className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em]">
        Make it yours.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Choose how you’ll appear on MarketX. Your email stays private and is
        only used for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="first_name" error={errors.first_name}>
            <Input
              id="first_name"
              name="first_name"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              aria-invalid={Boolean(errors.first_name)}
              aria-describedby={errors.first_name ? "first_name-error" : undefined}
            />
          </Field>
          <Field label="Last name" htmlFor="last_name" error={errors.last_name}>
            <Input
              id="last_name"
              name="last_name"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              aria-invalid={Boolean(errors.last_name)}
              aria-describedby={errors.last_name ? "last_name-error" : undefined}
            />
          </Field>
        </div>

        <Field
          label="Username"
          htmlFor="username"
          hint="3–30 characters"
          error={errors.username}
        >
          <div className="relative">
            <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="ps-8"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? "username-error" : undefined}
            />
          </div>
        </Field>

        <div className="rounded-xl border border-border/80 bg-surface/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="mt-0.5 truncate text-sm font-medium">{user?.email}</p>
        </div>

        {formError ? (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={onboard.isPending}
        >
          {onboard.isPending ? (
            <>
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-4 animate-spin"
                strokeWidth={2}
              />
              Finishing setup…
            </>
          ) : (
            "Finish setup"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        You can change your name and username later in profile settings.
      </p>
    </div>
  )
}

export function OnboardingView({ next }: { next?: string }) {
  const destination = safeNext(next)
  const target = destination.startsWith("/onboarding") ? "/" : destination

  return (
    <RequireAuth allowUnonboarded>
      <OnboardingForm next={target} />
    </RequireAuth>
  )
}
