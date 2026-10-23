import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-lg border border-input bg-transparent px-3.5 py-3 text-base transition-[border-color,box-shadow] duration-150 ease-out outline-none placeholder:text-muted-foreground/80 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/10 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-55 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/10 sm:text-sm dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
