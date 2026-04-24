"use client"

import { RiLightbulbLine, RiStarLine } from "@remixicon/react"

import { PageHeader } from "@/components/layout/page-header"
import { MarketInsights } from "@/components/dashboard/widgets/market-insights"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Insights"
        subtitle="Weekly market pulse, AI-assisted."
        actions={
          <Badge variant="outline" className="gap-1.5">
            <RiLightbulbLine className="size-3.5" />
            Beta
          </Badge>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Market insights</CardTitle>
          <CardDescription>
            Snapshot of UK used-car dynamics relevant to your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarketInsights />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <RiStarLine className="size-6" />
          </div>
          <div className="text-sm font-semibold">Deeper analytics — coming in v2</div>
          <p className="max-w-xl text-sm text-muted-foreground">
            Paid add-on: competitor pricing feeds, auction hammer vs retail spreads, per-vehicle
            margin tracking, and AI recommendations on listing titles, price holds, and
            when to wholesale.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
