import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border border-border/80 bg-card p-4", className)}>
      <p className="quiet-label">{label}</p>
      <div className="tabular mt-2 font-heading text-2xl font-medium tracking-[-0.03em]">
        {value}
      </div>
      {hint ? (
        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
