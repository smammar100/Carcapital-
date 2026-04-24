"use client"

import { useEffect, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FinancialSummary } from "@/components/dashboard/widgets/financial-summary"
import { KpiAvgDays } from "@/components/dashboard/widgets/kpi-avg-days"
import { KpiLeads24h } from "@/components/dashboard/widgets/kpi-leads-24h"
import { KpiReadiness } from "@/components/dashboard/widgets/kpi-readiness"
import { KpiSoldMtd } from "@/components/dashboard/widgets/kpi-sold-mtd"
import { KpiStock } from "@/components/dashboard/widgets/kpi-stock"
import { KpiWarrantyClaims } from "@/components/dashboard/widgets/kpi-warranty-claims"
import { MaintenanceSummary } from "@/components/dashboard/widgets/maintenance-summary"
import { MarketInsights } from "@/components/dashboard/widgets/market-insights"
import { RecentActivity } from "@/components/dashboard/widgets/recent-activity"
import { StockAgingChart } from "@/components/dashboard/widgets/stock-aging-chart"
import { VehiclePipelineKanban } from "@/components/dashboard/widgets/vehicle-pipeline-kanban"
import { useApp } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import { leadsService } from "@/lib/services/leads-service"
import { stockService } from "@/lib/services/stock-service"
import { warrantyClaimService } from "@/lib/services/warranty-service"
import { workshopService } from "@/lib/services/workshop-service"
import type { Lead, Vehicle, WarrantyClaim, WorkshopJob } from "@/lib/types"

export default function DashboardHome() {
  const { currentUser, currentCompany } = useAuth()
  const { activityLog } = useApp()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [claims, setClaims] = useState<WarrantyClaim[]>([])
  const [jobs, setJobs] = useState<WorkshopJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!currentUser || !currentCompany) return
      setLoading(true)
      const ctx = {
        companyId: currentCompany.id,
        userId: currentUser.id,
        userName: currentUser.name,
      }
      const [v, l, c, j] = await Promise.all([
        stockService.list(ctx),
        leadsService.list(ctx),
        warrantyClaimService.list(ctx),
        workshopService.list(ctx),
      ])
      if (cancelled) return
      setVehicles(v)
      setLeads(l)
      setClaims(c)
      setJobs(j)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentUser, currentCompany])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back
          {currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening at {currentCompany?.name ?? "your dealership"} today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : (
          <>
            <KpiStock vehicles={vehicles} />
            <KpiReadiness vehicles={vehicles} />
            <KpiSoldMtd vehicles={vehicles} />
            <KpiWarrantyClaims claims={claims} />
            <KpiLeads24h leads={leads} />
            <KpiAvgDays vehicles={vehicles} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle pipeline</CardTitle>
          <CardDescription>
            The lifecycle of every vehicle from arrival to sale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <VehiclePipelineKanban vehicles={vehicles} />
          )}
        </CardContent>
      </Card>

      <div>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <FinancialSummary vehicles={vehicles} />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stock aging</CardTitle>
            <CardDescription>Days on the forecourt.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <StockAgingChart vehicles={vehicles} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
            <CardDescription>Live prep &amp; workshop status.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <MaintenanceSummary jobs={jobs} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market insights</CardTitle>
          <CardDescription>
            AI-assisted pulse on the used-car market this week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarketInsights />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Who did what, and when.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity entries={activityLog} />
        </CardContent>
      </Card>
    </div>
  )
}
