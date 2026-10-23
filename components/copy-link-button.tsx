"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Link01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function CopyLinkButton() {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success("Link copied")
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn’t copy the link")
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      <HugeiconsIcon
        icon={copied ? CheckmarkCircle02Icon : Link01Icon}
        data-icon="inline-start"
        strokeWidth={1.7}
      />
      {copied ? "Copied" : "Share"}
    </Button>
  )
}
