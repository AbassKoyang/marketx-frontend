"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { AccountSettingsNav } from "@/components/account/account-settings-nav"
import { Field } from "@/components/form-field"
import { PageHeader } from "@/components/page-states"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage, isApiError } from "@/lib/api/client"
import { fullName, initials } from "@/lib/format"
import { useAuth, useUpdateProfile } from "@/lib/query/hooks"

export function ProfileView() {
  const { user } = useAuth()
  const update = useUpdateProfile()
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const initializedFor = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!user || initializedFor.current === user.id) return
    initializedFor.current = user.id
    setFirstName(user.first_name ?? "")
    setLastName(user.last_name ?? "")
    setUsername(user.username ?? "")
  }, [user])

  if (!user) return null

  const dirty =
    firstName !== (user.first_name ?? "") ||
    lastName !== (user.last_name ?? "") ||
    username !== (user.username ?? "")

  const formError = errors.non_field_errors || errors.detail || null
  const isGoogle = user.auth_provider === "google"

  function reset() {
    if (!user) return
    setFirstName(user.first_name ?? "")
    setLastName(user.last_name ?? "")
    setUsername(user.username ?? "")
    setErrors({})
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const cleanFirst = firstName.trim()
    const cleanLast = lastName.trim()
    const cleanUsername = username.trim()
    const nextErrors: Record<string, string> = {}

    if (!cleanFirst) nextErrors.first_name = "Enter your first name."
    if (!cleanLast) nextErrors.last_name = "Enter your last name."
    if (cleanUsername.length < 3) {
      nextErrors.username = "Use at least 3 characters."
    } else if (cleanUsername.length > 30) {
      nextErrors.username = "Use 30 characters or fewer."
    } else if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      nextErrors.username = "Use letters, numbers, hyphens, or underscores."
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    update.mutate(
      {
        id: user.id,
        payload: {
          first_name: cleanFirst,
          last_name: cleanLast,
          username: cleanUsername,
        },
      },
      {
        onSuccess: () => {
          toast.success("Profile updated")
          setErrors({})
        },
        onError: (error) => {
          if (isApiError(error)) {
            setErrors(error.fieldErrors)
          }
          toast.error(errorMessage(error, "We couldn’t update your profile."))
        },
      }
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="How you appear across MarketX, and the sign-in account connected to your profile."
      />

      <AccountSettingsNav className="mt-6" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <section
          aria-labelledby="profile-details-title"
          className="rounded-xl border border-border/80 bg-card"
        >
          <div className="border-b border-border/60 px-5 py-4">
            <h2
              id="profile-details-title"
              className="font-heading text-base font-medium tracking-[-0.02em]"
            >
              Your details
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Changes are saved to your MarketX account.
            </p>
          </div>

          <div className="flex items-center gap-4 px-5 py-5">
            <Avatar size="lg" className="size-16">
              {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
              <AvatarFallback className="text-lg font-medium">
                {initials(user.first_name, user.last_name, user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-medium tracking-[-0.02em]">
                {fullName(user)}
              </p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {user.username ? `@${user.username}` : "No username yet"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-5 pb-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="profile-first-name" error={errors.first_name}>
                <Input
                  id="profile-first-name"
                  name="first_name"
                  autoComplete="given-name"
                  maxLength={100}
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value)
                    setErrors((current) => ({ ...current, first_name: "" }))
                  }}
                  aria-invalid={Boolean(errors.first_name)}
                  aria-describedby={
                    errors.first_name ? "profile-first-name-error" : undefined
                  }
                />
              </Field>
              <Field label="Last name" htmlFor="profile-last-name" error={errors.last_name}>
                <Input
                  id="profile-last-name"
                  name="last_name"
                  autoComplete="family-name"
                  maxLength={100}
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value)
                    setErrors((current) => ({ ...current, last_name: "" }))
                  }}
                  aria-invalid={Boolean(errors.last_name)}
                  aria-describedby={
                    errors.last_name ? "profile-last-name-error" : undefined
                  }
                />
              </Field>
            </div>

            <Field
              label="Username"
              htmlFor="profile-username"
              hint="3–30 characters"
              error={errors.username}
            >
              <div className="relative">
                <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="profile-username"
                  name="username"
                  autoComplete="username"
                  maxLength={30}
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    setErrors((current) => ({ ...current, username: "" }))
                  }}
                  className="ps-8"
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={
                    errors.username ? "profile-username-error" : undefined
                  }
                />
              </div>
            </Field>

            {formError ? (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-5">
              <Button type="submit" disabled={!dirty || update.isPending}>
                {update.isPending ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="size-4 animate-spin"
                      strokeWidth={2}
                    />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
              {dirty ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={reset}
                  disabled={update.isPending}
                >
                  Reset
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border/80 bg-card p-5">
            <h2 className="font-heading text-base font-medium tracking-[-0.02em]">
              {isGoogle ? "Google account" : "Sign-in account"}
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-[11px] text-muted-foreground">Email</dt>
                <dd className="mt-0.5 truncate font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Sign-in method</dt>
                <dd className="mt-0.5 font-medium">
                  {isGoogle ? "Google" : "Email"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-border/60 pt-4 text-xs leading-5 text-muted-foreground">
              {isGoogle
                ? "Your email is provided by Google and can’t be changed here. You use the same Google account each time you sign in."
                : "This account signs in with its email address. Public MarketX sign-in uses Google."}
            </p>
          </section>

          <section className="rounded-xl border border-border/80 bg-surface/50 p-5">
            <h2 className="font-heading text-base font-medium tracking-[-0.02em]">
              Account
            </h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Review appearance and session options, or visit notifications.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/settings" />}
                nativeButton={false}
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/wallet" />}
                nativeButton={false}
              >
                Wallet
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
