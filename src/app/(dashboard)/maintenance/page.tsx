"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RiAddLine, RiToolsLine } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { WorkshopJobDialog } from "@/components/workshop/workshop-job-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { WORKSHOP_JOB_STATUSES } from "@/lib/constants"
import { stockService } from "@/lib/services/stock-service"
import { vendorService } from "@/lib/services/vendor-service"
import { workshopService } from "@/lib/services/workshop-service"
import type {
  Vehicle,
  Vendor,
  WorkshopJob,
  WorkshopJobStatus,
} from "@/lib/types"
import { formatDateTime, formatMoney } from "@/lib/utils/format"

const COLUMNS: WorkshopJobStatus[] = [
  "scheduled",
  "in_progress",
  "awaiting_parts",
  "completed",
]

export default function MaintenancePage() {
  const { currentUser, currentCompany } = useAuth()
  const [jobs, setJobs] = useState<WorkshopJob[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WorkshopJob | null>(null)
  const [deleting, setDeleting] = useState<WorkshopJob | null>(null)
  const [showCancelled, setShowCancelled] = useState(false)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const [js, vs, vnds] = await Promise.all([
      workshopService.list(ctx, "internal"),
      stockService.list(ctx),
      vendorService.list(ctx),
    ])
    setJobs(js)
    setVehicles(vs)
    setVendors(vnds)
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

  const vendorById = useMemo(() => {
    const m = new Map<string, Vendor>()
    vendors.forEach((v) => m.set(v.id, v))
    return m
  }, [vendors])

  const grouped = useMemo(() => {
    const m = new Map<WorkshopJobStatus, WorkshopJob[]>()
    WORKSHOP_JOB_STATUSES.forEach((s) => m.set(s.value, []))
    jobs.forEach((j) => m.get(j.status)?.push(j))
    return m
  }, [jobs])

  const cancelledCount = grouped.get("cancelled")?.length ?? 0

  async function changeStatus(job: WorkshopJob, status: WorkshopJobStatus) {
    if (!currentUser || !currentCompany) return
    await workshopService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      job.id,
      { status },
    )
    toast.success(`Job → ${WORKSHOP_JOB_STATUSES.find((s) => s.value === status)?.label}`)
    load()
  }

  async function handleDelete() {
    if (!deleting || !currentUser || !currentCompany) return
    await workshopService.delete(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      deleting.id,
    )
    toast.success("Job deleted")
    setDeleting(null)
    load()
  }

  const columns = showCancelled ? [...COLUMNS, "cancelled" as WorkshopJobStatus] : COLUMNS

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Maintenance"
        subtitle="Internal prep jobs for stock being readied for sale."
        actions={
          <div className="flex items-center gap-2">
            {cancelledCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelled((s) => !s)}
              >
                {showCancelled ? "Hide" : "Show"} cancelled ({cancelledCount})
              </Button>
            )}
            <Button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <RiAddLine className="size-4" />
              New internal job
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={RiToolsLine}
          title="No prep jobs yet"
          description="Book an internal job on a stock vehicle — valet, MOT, mechanical fix."
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <RiAddLine className="size-4" />
              New internal job
            </Button>
          }
        />
      ) : (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          style={showCancelled ? { gridTemplateColumns: "repeat(5, minmax(0, 1fr))" } : undefined}
        >
          {columns.map((status) => {
            const col = grouped.get(status) ?? []
            const label = WORKSHOP_JOB_STATUSES.find((s) => s.value === status)?.label ?? status
            return (
              <Card key={status} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <span>{label}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {col.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2">
                  {col.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                      No jobs
                    </div>
                  ) : (
                    col.map((job) => {
                      const v = job.vehicleId ? vehicleById.get(job.vehicleId) : undefined
                      const mech = job.mechanicId ? vendorById.get(job.mechanicId) : undefined
                      return (
                        <div
                          key={job.id}
                          className="flex flex-col gap-2 rounded-md border bg-card p-3 text-xs shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col gap-0.5">
                              <div className="font-medium text-foreground">
                                {v ? `${v.stockId} · ${v.registration}` : "Vehicle removed"}
                              </div>
                              <div className="text-muted-foreground">
                                {v ? `${v.make} ${v.model}` : "—"}
                              </div>
                            </div>
                            <RowActionsMenu>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(job)
                                  setDialogOpen(true)
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {WORKSHOP_JOB_STATUSES.map((s) => (
                                    <DropdownMenuItem
                                      key={s.value}
                                      disabled={job.status === s.value}
                                      onClick={() => changeStatus(job, s.value)}
                                    >
                                      {s.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(job)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </RowActionsMenu>
                          </div>
                          <div className="line-clamp-2 text-foreground/80">{job.description}</div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="truncate">{mech?.name ?? "No vendor"}</span>
                            <span className="font-mono">{formatMoney(job.cost)}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {formatDateTime(job.scheduledFor)}
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <WorkshopJobDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        jobType="internal"
        job={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this job?"
        description="The prep record will be removed. Cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
