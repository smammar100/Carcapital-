"use client"

import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RiFileList3Line, RiMagicLine, RiSaveLine } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { EntityCombobox } from "@/components/shared/entity-combobox"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import {
  INSPECTION_CHECK_STATUSES,
  INSPECTION_ITEMS,
} from "@/lib/constants"
import { inspectionsService } from "@/lib/services/inspections-service"
import { stockService } from "@/lib/services/stock-service"
import { todoService } from "@/lib/services/todo-service"
import type {
  InspectionCheck,
  InspectionCheckStatus,
  Vehicle,
} from "@/lib/types"

interface RowState {
  status: InspectionCheckStatus
  actionRequired: string
  notes: string
  dirty: boolean
  loadedId?: string
}

function initialRow(existing?: InspectionCheck): RowState {
  return {
    status: existing?.status ?? "ok",
    actionRequired: existing?.actionRequired ?? "",
    notes: existing?.notes ?? "",
    dirty: false,
    loadedId: existing?.id,
  }
}

export default function InspectionsPage() {
  const { currentUser, currentCompany } = useAuth()
  const params = useSearchParams()
  const initialVehicleId = params.get("vehicleId") ?? undefined

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleId, setVehicleId] = useState<string | undefined>(initialVehicleId)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Record<number, RowState>>({})
  const [saving, setSaving] = useState(false)

  const loadVehicles = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    const vs = await stockService.list({
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    })
    setVehicles(vs)
    if (!vehicleId && vs.length > 0) setVehicleId(vs[0].id)
    setLoading(false)
  }, [currentUser, currentCompany, vehicleId])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const loadChecks = useCallback(async () => {
    if (!currentUser || !currentCompany || !vehicleId) {
      setRows({})
      return
    }
    const checks = await inspectionsService.listByVehicle(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      vehicleId,
    )
    const m: Record<number, RowState> = {}
    INSPECTION_ITEMS.forEach((item) => {
      const existing = checks.find((c) => c.checkNumber === item.number)
      m[item.number] = initialRow(existing)
    })
    setRows(m)
  }, [currentUser, currentCompany, vehicleId])

  useEffect(() => {
    loadChecks()
  }, [loadChecks])

  const vehicle = useMemo(
    () => vehicles.find((v) => v.id === vehicleId) ?? null,
    [vehicles, vehicleId],
  )

  const summary = useMemo(() => {
    const tallies = { ok: 0, attention: 0, fail: 0, na: 0 }
    Object.values(rows).forEach((r) => {
      tallies[r.status] += 1
    })
    return tallies
  }, [rows])

  function updateRow(num: number, patch: Partial<RowState>) {
    setRows((prev) => ({
      ...prev,
      [num]: { ...prev[num], ...patch, dirty: true },
    }))
  }

  async function saveAll() {
    if (!currentUser || !currentCompany || !vehicleId) return
    setSaving(true)
    try {
      const ctx = {
        companyId: currentCompany.id,
        userId: currentUser.id,
        userName: currentUser.name,
      }
      let saved = 0
      for (const [numStr, row] of Object.entries(rows)) {
        if (!row.dirty) continue
        const num = Number(numStr)
        await inspectionsService.saveCheck(
          ctx,
          vehicleId,
          num,
          row.status,
          row.actionRequired.trim() || undefined,
          row.notes.trim() || undefined,
        )
        saved += 1
      }
      toast.success(saved === 0 ? "Nothing to save" : `Saved ${saved} check${saved === 1 ? "" : "s"}`)
      loadChecks()
    } catch (err) {
      console.error(err)
      toast.error("Could not save checks")
    } finally {
      setSaving(false)
    }
  }

  async function generateTodos() {
    if (!currentUser || !currentCompany || !vehicleId) return
    const fails = INSPECTION_ITEMS.filter((item) => {
      const r = rows[item.number]
      return r && (r.status === "fail" || r.status === "attention")
    })
    if (fails.length === 0) {
      toast.info("No fails or attention-needed items to turn into todos")
      return
    }
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    for (const item of fails) {
      const row = rows[item.number]
      await todoService.create(ctx, {
        vehicleId,
        title: `Check ${item.number} — ${item.label}${row.status === "fail" ? " (FAIL)" : " (attention)"}`,
        description: row.actionRequired || row.notes || undefined,
        status: "open",
      })
    }
    toast.success(`Created ${fails.length} todo${fails.length === 1 ? "" : "s"}`)
  }

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
    description: `${v.stockId} · ${v.registration}`,
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inspections"
        subtitle="20-point checklist per vehicle. Turn fails into todos with one click."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={generateTodos} disabled={!vehicleId}>
              <RiMagicLine className="size-4" />
              Generate todos from failures
            </Button>
            <Button onClick={saveAll} disabled={saving || !vehicleId}>
              <RiSaveLine className="size-4" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loading ? (
            <Skeleton className="h-10 w-80" />
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={RiFileList3Line}
              title="No vehicles to inspect"
              description="Add a vehicle on /inventory/new to start inspecting."
            />
          ) : (
            <>
              <div className="max-w-md">
                <EntityCombobox
                  value={vehicleId}
                  onChange={setVehicleId}
                  options={vehicleOptions}
                  placeholder="Pick a vehicle"
                  allowClear={false}
                />
              </div>
              {vehicle && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{vehicle.registration}</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                    OK {summary.ok}
                  </Badge>
                  <Badge variant="outline" className="bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Attention {summary.attention}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200">
                    Fail {summary.fail}
                  </Badge>
                  <Badge variant="outline">N/A {summary.na}</Badge>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {vehicleId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">20-point checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Check</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead>Action required</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INSPECTION_ITEMS.map((item) => {
                  const row = rows[item.number] ?? initialRow()
                  const needsAction = row.status === "attention" || row.status === "fail"
                  return (
                    <TableRow key={item.number}>
                      <TableCell className="align-top">{item.number}</TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Select
                          value={row.status}
                          onValueChange={(v) => updateRow(item.number, { status: v as InspectionCheckStatus })}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INSPECTION_CHECK_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="align-top">
                        {needsAction ? (
                          <Textarea
                            rows={2}
                            value={row.actionRequired}
                            onChange={(e) => updateRow(item.number, { actionRequired: e.target.value })}
                            placeholder="What needs to happen?"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea
                          rows={2}
                          value={row.notes}
                          onChange={(e) => updateRow(item.number, { notes: e.target.value })}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
