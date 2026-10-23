"use client"

import { MarketActivity } from "@/components/market/market-activity"
import { MarketTrades } from "@/components/market/market-trades"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { MarketStatus } from "@/lib/api/types"

export function MarketTabs({
  outcomeId,
  outcomeName,
  marketStatus,
}: {
  outcomeId: number
  outcomeName: string
  marketStatus: MarketStatus
}) {
  return (
    <section
      aria-labelledby="market-activity-title"
      className="overflow-hidden rounded-xl border border-border/80 bg-card"
    >
      <Tabs defaultValue="trades" className="gap-0">
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="market-activity-title"
            className="font-heading text-base font-medium tracking-[-0.02em]"
          >
            Market activity
          </h2>
          <TabsList className="h-9 w-full sm:w-auto">
            <TabsTrigger value="trades" className="px-4">
              Trades
            </TabsTrigger>
            <TabsTrigger value="activity" className="px-4">
              Activity
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="border-t border-border/60" />
        <TabsContent value="trades">
          <MarketTrades
            outcomeId={outcomeId}
            outcomeName={outcomeName}
            marketStatus={marketStatus}
          />
        </TabsContent>
        <TabsContent value="activity">
          <MarketActivity
            outcomeId={outcomeId}
            outcomeName={outcomeName}
            marketStatus={marketStatus}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
