"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EntityCombobox } from "@/components/shared/entity-combobox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import {
  APPOINTMENT_DURATIONS,
  APPOINTMENT_KINDS,
  APPOINTMENT_STATUSES,
} from "@/lib/constants"
import { appointmentService } from "@/lib/services/appointment-service"
import { leadsService } from "@/lib/services/leads-service"
import { stockService } from "@/lib/services/stock-service"
import type {
  Appointment,
  AppointmentKind,
  AppointmentStatus,
  Lead,
  Vehicle,
} from "@/lib/types"
import { formatDateTimeInput } from "@/lib/utils/format"

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: Appointment | null
  defaultLeadId?: string
  defaultVehicleId?: string
  defaultCustomerName?: string
  defaultCustomerPhone?: string
  onSaved: (appt: Appointment) => void
}

interface FormState {
  leadId: string | undefined
  vehicleId: string | undefined
  customerName: string
  customerPhone: string
  kind: AppointmentKind
  status: AppointmentStatus
  scheduledFor: string
  durationMins: number
  notes: string
}

function nextHourIso(): string {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return d.toISOString()
}

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  defaultLeadId,
  defaultVehicleId,
  defaultCustomerName,
  defaultCustomerPhone,
  onSaved,
}: AppointmentDialogProps) {
  const { currentUser, currentCompany } = useAuth()
  const [form, setForm] = useState<FormState | null>(null)
  const [busy, setBusy] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    if (!open || !currentUser || !currentCompany) return
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    Promise.all([leadsService.list(ctx), stockService.list(ctx)]).then(([ls, vs]) => {
      setLeads(ls)
      setVehicles(vs)
    })
  }, [open, currentUser, currentCompany])

  useEffect(() => {
    if (!open) return
    if (appointment) {
      setForm({
        leadId: appointment.leadId,
        vehicleId: appointment.vehicleId,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone ?? "",
        kind: appointment.kind,
        status: appointment.status,
        scheduledFor: formatDateTimeInput(appointment.scheduledFor),
        durationMins: appointment.durationMins,
        notes: appointment.notes ?? "",
      })
    } else {
      setForm({
        leadId: defaultLeadId,
        vehicleId: defaultVehicleId,
        customerName: defaultCustomerName ?? "",
        customerPhone: defaultCustomerPhone ?? "",
        kind: "test_drive",
        status: "scheduled",
        scheduledFor: formatDateTimeInput(nextHourIso()),
        durationMins: currentCompany?.defaultAppointmentDurationMins ?? 30,
        notes: "",
      })
    }
  }, [open, appointment, defaultLeadId, defaultVehicleId, defaultCustomerName, defaultCustomerPhone, currentCompany])

  async function handleSubmit() {
    if (!form || !currentUser || !currentCompany) return
    if (!form.customerName.trim()) {
      toast.error("Customer name is required")
      return
    }
    if (!form.scheduledFor) {
      toast.error("Pick a date and time")
      return
    }
    setBusy(true)
    try {
      const ctx = {
        companyId: currentCompany.id,
        userId: currentUser.id,
        userName: currentUser.name,
      }
      const payload = {
        leadId: form.leadId,
        vehicleId: form.vehicleId,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
        kind: form.kind,
        status: form.status,
        scheduledFor: new Date(form.scheduledFor).toISOString(),
        durationMins: form.durationMins,
        notes: form.notes.trim() || undefined,
        remindersSent: [] as string[],
      }
      let saved: Appointment | undefined
      if (appointment) {
        saved = await appointmentService.update(ctx, appointment.id, payload)
        toast.success("Appointment updated")
      } else {
        saved = await appointmentService.create(ctx, payload)
        toast.success("Appointment booked")
      }
      if (saved) onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save appointment")
    } finally {
      setBusy(false)
    }
  }

  if (!form) return null

  const leadOptions = leads.map((l) => ({
    value: l.id,
    label: l.customerName,
    description: l.phone,
  }))
  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
    description: `${v.stockId} · ${v.registration}`,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit appointment" : "Book appointment"}</DialogTitle>
          <DialogDescription>
            Schedule a test drive, viewing, or collection.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Linked lead</Label>
            <EntityCombobox
              value={form.leadId}
              onChange={(leadId) => {
                const l = leads.find((x) => x.id === leadId)
                setForm({
                  ...form,
                  leadId,
                  customerName: l?.customerName ?? form.customerName,
                  customerPhone: l?.phone ?? form.customerPhone,
                  vehicleId: l?.vehicleId ?? form.vehicleId,
                })
              }}
              options={leadOptions}
              placeholder="No lead linked"
              emptyMessage="No leads — create one on /leads first."
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="a-name">Customer name</Label>
              <Input
                id="a-name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="a-phone">Phone</Label>
              <Input
                id="a-phone"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Vehicle</Label>
            <EntityCombobox
              value={form.vehicleId}
              onChange={(vehicleId) => setForm({ ...form, vehicleId })}
              options={vehicleOptions}
              placeholder="No vehicle selected"
              emptyMessage="No vehicles in stock."
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Kind</Label>
              <Select
                value={form.kind}
                onValueChange={(v) => setForm({ ...form, kind: v as AppointmentKind })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Duration</Label>
              <Select
                value={String(form.durationMins)}
                onValueChange={(v) => setForm({ ...form, durationMins: Number(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as AppointmentStatus })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="a-when">Date & time</Label>
            <Input
              id="a-when"
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="a-notes">Notes</Label>
            <Textarea
              id="a-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : appointment ? "Save changes" : "Book appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
