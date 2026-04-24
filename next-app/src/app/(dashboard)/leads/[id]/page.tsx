"use client"

import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiCarLine,
  RiChat3Line,
  RiDeleteBinLine,
  RiEditLine,
  RiExchangeLine,
} from "@remixicon/react"
import { toast } from "sonner"

import { AppointmentDialog } from "@/components/appointments/appointment-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { LeadDialog } from "@/components/leads/lead-dialog"
import { LeadStatusBadge } from "@/components/leads/lead-status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import {
  APPOINTMENT_KINDS,
  APPOINTMENT_STATUSES,
  LEAD_SOURCES,
  LEAD_STATUSES,
} from "@/lib/constants"
import { appointmentService } from "@/lib/services/appointment-service"
import { leadsService } from "@/lib/services/leads-service"
import { stockService } from "@/lib/services/stock-service"
import type { Appointment, Lead, LeadStatus, Vehicle } from "@/lib/types"
import {
  formatDateTime,
  formatMoney,
  formatRelative,
} from "@/lib/utils/format"

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { currentUser, currentCompany } = useAuth()

  const [lead, setLead] = useState<Lead | null | undefined>(undefined)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [appts, setAppts] = useState<Appointment[]>([])
  const [noteDraft, setNoteDraft] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [apptOpen, setApptOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const found = await leadsService.getById(ctx, params.id)
    setLead(found ?? null)
    if (found?.vehicleId) {
      const v = await stockService.getById(ctx, found.vehicleId)
      setVehicle(v ?? null)
    } else {
      setVehicle(null)
    }
    const allAppts = await appointmentService.list(ctx)
    setAppts(allAppts.filter((a) => a.leadId === params.id))
  }, [currentUser, currentCompany, params.id])

  useEffect(() => {
    load()
  }, [load])

  const sortedNotes = useMemo(() => {
    if (!lead) return []
    return [...lead.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [lead])

  if (lead === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (lead === null) {
    notFound()
  }

  async function changeStatus(status: LeadStatus) {
    if (!currentUser || !currentCompany || !lead) return
    await leadsService.changeStatus(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      lead.id,
      status,
    )
    toast.success(`Moved to ${LEAD_STATUSES.find((s) => s.value === status)?.label ?? status}`)
    load()
  }

  async function addNote() {
    if (!currentUser || !currentCompany || !lead) return
    const body = noteDraft.trim()
    if (!body) return
    setSavingNote(true)
    const nextNotes = [
      ...lead.notes,
      {
        id: `note-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        body,
        createdAt: new Date().toISOString(),
      },
    ]
    await leadsService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      lead.id,
      { notes: nextNotes },
    )
    setNoteDraft("")
    setSavingNote(false)
    toast.success("Note added")
    load()
  }

  async function handleDelete() {
    if (!currentUser || !currentCompany || !lead) return
    await leadsService.delete(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      lead.id,
    )
    toast.success("Lead deleted")
    router.push("/leads")
  }

  async function handleAppointmentSaved() {
    if (!lead) return
    // If lead is pre-appointment, auto-move to appointment_booked.
    if (
      lead.status === "new" ||
      lead.status === "contacted" ||
      lead.status === "qualified"
    ) {
      if (currentUser && currentCompany) {
        await leadsService.changeStatus(
          {
            companyId: currentCompany.id,
            userId: currentUser.id,
            userName: currentUser.name,
          },
          lead.id,
          "appointment_booked",
        )
      }
    }
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/leads">
            <RiArrowLeftLine className="size-4" />
            Back to leads
          </Link>
        </Button>
        <PageHeader
          title={lead.customerName}
          subtitle={`${LEAD_SOURCES.find((s) => s.value === lead.source)?.label ?? lead.source} · opened ${formatRelative(lead.createdAt)}`}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <RiEditLine className="size-4" />
                Edit
              </Button>
              <Button onClick={() => setApptOpen(true)}>
                <RiCalendarEventLine className="size-4" />
                Book appointment
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RiChat3Line className="size-4" />
                Timeline
              </CardTitle>
              <CardDescription>
                Add a call note, a customer update, or context for the next touch.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Textarea
                  rows={3}
                  placeholder="Add a note — call summary, email reply, what to chase next…"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={addNote}
                    disabled={savingNote || !noteDraft.trim()}
                  >
                    {savingNote ? "Saving…" : "Post note"}
                  </Button>
                </div>
              </div>
              {sortedNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No notes yet. The first one you post will kick off the timeline.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {sortedNotes.map((note) => (
                    <li key={note.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">{note.authorName}</div>
                        <div
                          className="text-xs text-muted-foreground"
                          title={formatDateTime(note.createdAt)}
                        >
                          {formatRelative(note.createdAt)}
                        </div>
                      </div>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{note.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RiCalendarEventLine className="size-4" />
                Appointments
              </CardTitle>
              <CardDescription>Booked against this lead.</CardDescription>
            </CardHeader>
            <CardContent>
              {appts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No appointments booked for this lead yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {appts
                    .slice()
                    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor))
                    .map((appt) => (
                      <li
                        key={appt.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {formatDateTime(appt.scheduledFor)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {APPOINTMENT_KINDS.find((k) => k.value === appt.kind)?.label ?? appt.kind}
                            {" · "}
                            {appt.durationMins}m
                          </div>
                        </div>
                        <Badge variant="outline">
                          {APPOINTMENT_STATUSES.find((s) => s.value === appt.status)?.label ?? appt.status}
                        </Badge>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Phone</div>
                <div>{lead.phone || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div>{lead.email || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Budget</div>
                <div>{formatMoney(lead.budget)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Source</div>
                <div>
                  {LEAD_SOURCES.find((s) => s.value === lead.source)?.label ?? lead.source}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RiExchangeLine className="size-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <LeadStatusBadge status={lead.status} />
              <Select
                value={lead.status}
                onValueChange={(v) => changeStatus(v as LeadStatus)}
              >
                <SelectTrigger>
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
              {lead.status === "lost" && lead.lostReason && (
                <div className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
                  Lost reason: {lead.lostReason}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RiCarLine className="size-4" />
                Interested vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {vehicle ? (
                <Link
                  href={`/inventory/${vehicle.id}`}
                  className="flex flex-col gap-1 rounded-md border p-3 hover:bg-muted/60"
                >
                  <div className="font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {vehicle.stockId} · {vehicle.registration}
                  </div>
                  <div className="mt-1 text-xs">
                    List {formatMoney(vehicle.listPrice)}
                  </div>
                </Link>
              ) : (
                <p className="text-muted-foreground">
                  No vehicle linked. Edit the lead to link one from stock.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <RiDeleteBinLine className="size-4" />
                Delete lead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <LeadDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        lead={lead}
        onSaved={load}
      />

      <AppointmentDialog
        open={apptOpen}
        onOpenChange={setApptOpen}
        defaultLeadId={lead.id}
        defaultVehicleId={lead.vehicleId}
        defaultCustomerName={lead.customerName}
        defaultCustomerPhone={lead.phone}
        onSaved={handleAppointmentSaved}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${lead.customerName}?`}
        description="This removes the lead and its note history. Cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
