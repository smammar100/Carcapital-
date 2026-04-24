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
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants"
import { leadsService } from "@/lib/services/leads-service"
import { stockService } from "@/lib/services/stock-service"
import type { Lead, LeadSource, LeadStatus, Vehicle } from "@/lib/types"

interface LeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead | null
  onSaved: () => void
}

interface FormState {
  customerName: string
  email: string
  phone: string
  source: LeadSource
  status: LeadStatus
  vehicleId: string | undefined
  budget: string
  notes: string
}

const EMPTY: FormState = {
  customerName: "",
  email: "",
  phone: "",
  source: "website",
  status: "new",
  vehicleId: undefined,
  budget: "",
  notes: "",
}

export function LeadDialog({ open, onOpenChange, lead, onSaved }: LeadDialogProps) {
  const { currentUser, currentCompany } = useAuth()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    if (!open || !currentUser || !currentCompany) return
    stockService
      .list({ companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name })
      .then(setVehicles)
  }, [open, currentUser, currentCompany])

  useEffect(() => {
    if (open) {
      setForm(
        lead
          ? {
              customerName: lead.customerName,
              email: lead.email ?? "",
              phone: lead.phone,
              source: lead.source,
              status: lead.status,
              vehicleId: lead.vehicleId,
              budget: lead.budget ? String(lead.budget) : "",
              notes: "",
            }
          : EMPTY,
      )
    }
  }, [open, lead])

  async function handleSubmit() {
    if (!currentUser || !currentCompany) return
    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.error("Customer name and phone are required")
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
        customerName: form.customerName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim(),
        source: form.source,
        status: form.status,
        vehicleId: form.vehicleId,
        budget: form.budget ? Number(form.budget) : undefined,
      }
      if (lead) {
        await leadsService.update(ctx, lead.id, payload)
        toast.success("Lead updated")
      } else {
        const created = await leadsService.create(ctx, payload)
        if (form.notes.trim()) {
          await leadsService.update(ctx, created.id, {
            notes: [
              {
                id: `note-${Date.now()}`,
                authorId: currentUser.id,
                authorName: currentUser.name,
                body: form.notes.trim(),
                createdAt: new Date().toISOString(),
              },
            ],
          })
        }
        toast.success("Lead created")
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save lead")
    } finally {
      setBusy(false)
    }
  }

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.stockId} · ${v.year} ${v.make} ${v.model}`,
    description: v.registration,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit lead" : "New lead"}</DialogTitle>
          <DialogDescription>
            Capture a customer enquiry and link it to a vehicle of interest.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="l-name">Customer name</Label>
              <Input id="l-name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="l-phone">Phone</Label>
              <Input id="l-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="l-email">Email</Label>
              <Input id="l-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as LeadSource })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LeadStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Interested vehicle</Label>
            <EntityCombobox
              value={form.vehicleId}
              onChange={(v) => setForm({ ...form, vehicleId: v })}
              options={vehicleOptions}
              placeholder="No vehicle selected"
              emptyMessage="No vehicles — add one in Inventory first."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="l-budget">Budget (£)</Label>
            <Input id="l-budget" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          </div>
          {!lead && (
            <div className="grid gap-2">
              <Label htmlFor="l-notes">Opening note (optional)</Label>
              <Textarea id="l-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : lead ? "Save changes" : "Create lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
