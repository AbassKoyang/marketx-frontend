"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  CancelCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" strokeWidth={1.8} />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={1.8} />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} className="size-4" strokeWidth={1.8} />
        ),
        error: (
          <HugeiconsIcon icon={CancelCircleIcon} className="size-4" strokeWidth={1.8} />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" strokeWidth={1.8} />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
