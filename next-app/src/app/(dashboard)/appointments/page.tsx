"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  RiAddLine,
  RiCalendarCheckLine,
  RiMessage3Line,
} from "@remixicon/react"
import { toast } from "sonner"

import { AppointmentDialog } from "@/components/appointments/appointment-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
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
import { APPOINTMENT_KINDS, APPOINTMENT_STATUSES } from "@/lib/constants"
import { appointmentService } from "@/lib/services/appointment-service"
import { stockService } from "@/lib/services/stock-service"
import type { Appointment, AppointmentStatus, Vehicle } from "@/lib/types"
import { formatDateTime } from "@/lib/utils/format"

const STATUS_COLOURS: Record<AppointmentStatus, string> = {
  scheduled: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  cancelled: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
  no_show: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
}

interface Section {
  key: string
  title: string
  subtitle?: string
  items: Appointment[]
}

function buildSections(appts: Appointment[]): Section[] {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfDay)
  endOfToday.setDate(endOfToday.getDate() + 1)
  const endOfThisWeek = new Date(startOfDay)
  endOfThisWeek.setDate(endOfThisWeek.getDate() + 7)
  const endOfNextWeek = new Date(startOfDay)
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 14)

  const buckets: Record<string, Appointment[]> = {
    today: [],
    thisWeek: [],
    nextWeek: [],
    later: [],
    past: [],
  }

  for (const a of appts) {
    const when = new Date(a.scheduledFor)
    if (when < startOfDay) buckets.past.push(a)
    else if (when < endOfToday) buckets.today.push(a)
    else if (when < endOfThisWeek) buckets.thisWeek.push(a)
    else if (when < endOfNextWeek) buckets.nextWeek.push(a)
    else buckets.later.push(a)
  }

  const sortAsc = (arr: Appointment[]) =>
    arr.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
  const sortDesc = (arr: Appointment[]) =>
    arr.sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor))

  return [
    { key: "today", title: "Today", items: sortAsc(buckets.today) },
    { key: "thisWeek", title: "This week", items: sortAsc(buckets.thisWeek) },
    { key: "nextWeek", title: "Next week", items: sortAsc(buckets.nextWeek) },
    { key: "later", title: "Later", items: sortAsc(buckets.later) },
    { key: "past", title: "Past", items: sortDesc(buckets.past) },
  ]
}

export default function AppointmentsPage() {
  const { currentUser, currentCompany } = useAuth()
  const [appts, setAppts] = useState<Appointment[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [deleting, setDeleting] = useState<Appointment | null>(null)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const [rows, vs] = await Promise.all([
      appointmentService.list(ctx),
      stockService.list(ctx),
    ])
    setAppts(rows)
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

  const sections = useMemo(() => buildSections(appts), [appts])

  async function changeStatus(appt: Appointment, status: AppointmentStatus) {
    if (!currentUser || !currentCompany) return
    await appointmentService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      appt.id,
      { status },
    )
    toast.success(`Marked as ${APPOINTMENT_STATUSES.find((s) => s.value === status)?.label ?? status}`)
    load()
  }

  async function sendReminder(appt: Appointment, channel: "whatsapp" | "email") {
    if (!currentUser || !currentCompany) return
    const next = Array.from(new Set([...(appt.remindersSent ?? []), channel]))
    await appointmentService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      appt.id,
      { remindersSent: next },
    )
    toast.success(`Would send ${channel === "whatsapp" ? "WhatsApp" : "email"} reminder — mocked`)
    load()
  }

  async function handleDelete() {
    if (!deleting || !currentUser || !currentCompany) return
    await appointmentService.delete(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      deleting.id,
    )
    toast.success("Appointment removed")
    setDeleting(null)
    load()
  }

  const hasAny = appts.length > 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Appointments"
        subtitle="Test drives, viewings, and collections grouped by date."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <RiAddLine className="size-4" />
            Book appointment
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !hasAny ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={RiCalendarCheckLine}
              title="No appointments booked"
              description="Book a test drive, viewing, or collection to start your schedule."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(null)
                    setDialogOpen(true)
                  }}
                >
                  <RiAddLine className="size-4" />
                  Book first appointment
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        sections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <Card key={section.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{section.title}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {section.items.length} appointment{section.items.length === 1 ? "" : "s"}
                </span>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((appt) => {
                  const v = appt.vehicleId ? vehicleById.get(appt.vehicleId) : undefined
                  return (
                    <div
                      key={appt.id}
                      className="flex flex-col gap-2 rounded-md border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">
                            {appt.leadId ? (
                              <Link
                                href={`/leads/${appt.leadId}`}
                                className="hover:underline"
                              >
                                {appt.customerName}
                              </Link>
                            ) : (
                              appt.customerName
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(appt.scheduledFor)} · {appt.durationMins}m
                          </div>
                        </div>
                        <RowActionsMenu>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(appt)
                              setDialogOpen(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {APPOINTMENT_STATUSES.map((s) => (
                                <DropdownMenuItem
                                  key={s.value}
                                  disabled={appt.status === s.value}
                                  onClick={() => changeStatus(appt, s.value)}
                                >
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Send reminder</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => sendReminder(appt, "whatsapp")}>
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => sendReminder(appt, "email")}>
                                Email
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(appt)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </RowActionsMenu>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <Badge variant="outline">
                          {APPOINTMENT_KINDS.find((k) => k.value === appt.kind)?.label ?? appt.kind}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={STATUS_COLOURS[appt.status]}
                        >
                          {APPOINTMENT_STATUSES.find((s) => s.value === appt.status)?.label ?? appt.status}
                        </Badge>
                        {appt.remindersSent.length > 0 && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <RiMessage3Line className="size-3" />
                            {appt.remindersSent.join(", ")}
                          </span>
                        )}
                      </div>
                      {v && (
                        <div className="truncate text-xs text-muted-foreground">
                          {v.year} {v.make} {v.model} · {v.registration}
                        </div>
                      )}
                      {appt.customerPhone && (
                        <div className="text-xs text-muted-foreground">{appt.customerPhone}</div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))
      )}

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editing}
        onSaved={() => load()}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete appointment for ${deleting?.customerName ?? ""}?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
