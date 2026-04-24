"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RiAddLine, RiShoppingBag3Line } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { LeadDialog } from "@/components/leads/lead-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants"
import { leadsService } from "@/lib/services/leads-service"
import { stockService } from "@/lib/services/stock-service"
import type { Lead, LeadStatus, Vehicle } from "@/lib/types"
import { formatMoney } from "@/lib/utils/format"

const COLUMN_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "lost",
]

export default function SalesPipelinePage() {
  const { currentUser, currentCompany } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const [ls, vs] = await Promise.all([leadsService.list(ctx), stockService.list(ctx)])
    setLeads(ls)
    setVehicles(vs)
    setLoading(false)
  }, [currentUser, currentCompany])

  useEffect(() => {
    load()
  }, [load])

  const vehicleById = useMemo(() => {
    const m = new Map<string, Vehicle>()
    vehicles.forEach((v) => m.set(v.id, v))
    return m
  }, [vehicles])

  const byStatus = useMemo(() => {
    const m = new Map<LeadStatus, Lead[]>()
    COLUMN_STATUSES.forEach((s) => m.set(s, []))
    leads.forEach((l) => {
      const arr = m.get(l.status)
      if (arr) arr.push(l)
    })
    // Sort each column newest first.
    m.forEach((arr) => arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    return m
  }, [leads])

  async function changeStatus(lead: Lead, status: LeadStatus) {
    if (!currentUser || !currentCompany) return
    await leadsService.changeStatus(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      lead.id,
      status,
    )
    toast.success(`Moved to ${LEAD_STATUSES.find((s) => s.value === status)?.label ?? status}`)
    load()
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Sales pipeline" subtitle="Leads by stage." />
        <div className="grid gap-4 lg:grid-cols-5">
          {COLUMN_STATUSES.map((s) => (
            <Skeleton key={s} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sales pipeline"
        subtitle="Drag leads through the stages — use each card's dropdown to change status."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <RiAddLine className="size-4" />
            New lead
          </Button>
        }
      />

      {leads.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={RiShoppingBag3Line}
              title="No leads to pipeline yet"
              description="Create your first lead — walk-in, phone, website, or AutoTrader."
              action={
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <RiAddLine className="size-4" />
                  New lead
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {COLUMN_STATUSES.map((status) => {
            const items = byStatus.get(status) ?? []
            const meta = LEAD_STATUSES.find((s) => s.value === status)
            return (
              <div key={status} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <div className="text-sm font-semibold">{meta?.label ?? status}</div>
                  <Badge variant="outline" className="text-xs">
                    {items.length}
                  </Badge>
                </div>
                <div className="flex min-h-24 flex-col gap-2 rounded-md border bg-muted/30 p-2">
                  {items.length === 0 ? (
                    <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                      No leads at this stage yet.
                    </div>
                  ) : (
                    items.map((l) => {
                      const v = l.vehicleId ? vehicleById.get(l.vehicleId) : undefined
                      return (
                        <Card key={l.id} className="gap-2 p-3 shadow-xs">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/leads/${l.id}`}
                              className="text-sm font-medium hover:underline"
                            >
                              {l.customerName}
                            </Link>
                            <Badge variant="outline" className="text-[10px]">
                              {LEAD_SOURCES.find((s) => s.value === l.source)?.label ?? l.source}
                            </Badge>
                          </div>
                          {v ? (
                            <div className="truncate text-xs text-muted-foreground">
                              {v.year} {v.make} {v.model}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">No vehicle yet</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Budget {formatMoney(l.budget)}
                          </div>
                          <Select
                            value={l.status}
                            onValueChange={(v) => changeStatus(l, v as LeadStatus)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LEAD_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <LeadDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} />
    </div>
  )
}
