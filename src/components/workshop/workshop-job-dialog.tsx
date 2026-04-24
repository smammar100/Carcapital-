"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EntityCombobox } from "@/components/shared/entity-combobox"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { WORKSHOP_JOB_STATUSES } from "@/lib/constants"
import { invoiceService } from "@/lib/services/invoice-service"
import { stockService } from "@/lib/services/stock-service"
import { vendorService } from "@/lib/services/vendor-service"
import { workshopService } from "@/lib/services/workshop-service"
import type {
  Invoice,
  Vehicle,
  Vendor,
  WorkshopJob,
  WorkshopJobStatus,
  WorkshopJobType,
} from "@/lib/types"
import { formatDateTimeInput } from "@/lib/utils/format"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobType: WorkshopJobType
  job?: WorkshopJob | null
  onSaved: () => void
}

interface FormState {
  vehicleId: string | undefined
  mechanicId: string | undefined
  customerName: string
  customerPhone: string
  registration: string
  description: string
  scheduledFor: string
  cost: string
  status: WorkshopJobStatus
  notes: string
  generateInvoice: boolean
}

function nextHour(): string {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return d.toISOString()
}

export function WorkshopJobDialog({ open, onOpenChange, jobType, job, onSaved }: Props) {
  const { currentUser, currentCompany } = useAuth()
  const [form, setForm] = useState<FormState | null>(null)
  const [busy, setBusy] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  useEffect(() => {
    if (!open || !currentUser || !currentCompany) return
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    Promise.all([stockService.list(ctx), vendorService.list(ctx)]).then(([vs, vnds]) => {
      setVehicles(vs)
      setVendors(vnds.filter((v) => v.kind === "mechanic" || v.kind === "bodyshop" || v.kind === "electrical"))
    })
  }, [open, currentUser, currentCompany])

  useEffect(() => {
    if (!open) return
    if (job) {
      setForm({
        vehicleId: job.vehicleId,
        mechanicId: job.mechanicId,
        customerName: job.customerName ?? "",
        customerPhone: job.customerPhone ?? "",
        registration: job.registration ?? "",
        description: job.description,
        scheduledFor: formatDateTimeInput(job.scheduledFor),
        cost: String(job.cost ?? ""),
        status: job.status,
        notes: job.notes ?? "",
        generateInvoice: false,
      })
    } else {
      setForm({
        vehicleId: undefined,
        mechanicId: undefined,
        customerName: "",
        customerPhone: "",
        registration: "",
        description: "",
        scheduledFor: formatDateTimeInput(nextHour()),
        cost: "0",
        status: "scheduled",
        notes: "",
        generateInvoice: false,
      })
    }
  }, [open, job])

  async function handleSubmit() {
    if (!form || !currentUser || !currentCompany) return
    if (!form.description.trim()) {
      toast.error("Description is required")
      return
    }
    if (jobType === "external" && !form.customerName.trim()) {
      toast.error("Customer name is required for external jobs")
      return
    }
    setBusy(true)
    try {
      const ctx = {
        companyId: currentCompany.id,
        userId: currentUser.id,
        userName: currentUser.name,
      }
      const cost = Number(form.cost) || 0
      const payload = {
        jobType,
        vehicleId: form.vehicleId,
        mechanicId: form.mechanicId,
        customerName: form.customerName.trim() || undefined,
        customerPhone: form.customerPhone.trim() || undefined,
        registration: form.registration.trim().toUpperCase() || undefined,
        description: form.description.trim(),
        scheduledFor: new Date(form.scheduledFor).toISOString(),
        cost,
        status: form.status,
        notes: form.notes.trim() || undefined,
      }

      let saved: WorkshopJob | undefined
      if (job) {
        saved = await workshopService.update(ctx, job.id, payload)
        toast.success("Job updated")
      } else {
        saved = await workshopService.create(ctx, payload)
        toast.success(`${jobType === "internal" ? "Internal" : "External"} job booked`)
      }

      // Auto-invoice on completion for external jobs if checkbox ticked.
      if (
        saved &&
        form.generateInvoice &&
        jobType === "external" &&
        form.status === "completed" &&
        !saved.invoiceId
      ) {
        const invoice: Omit<Invoice, "id" | "companyId" | "createdAt" | "updatedAt"> = {
          type: "sale",
          number: `INV-${Date.now().toString().slice(-6)}`,
          workshopJobId: saved.id,
          buyerName: form.customerName.trim(),
          buyerPhone: form.customerPhone.trim() || undefined,
          issueDate: new Date().toISOString().slice(0, 10),
          lineItems: [
            {
              id: `li-${Date.now()}`,
              description: form.description.trim(),
              quantity: 1,
              unitPrice: cost,
              vatRate: currentCompany.vatRate ?? 20,
              total: cost,
            },
          ],
          customFields: [],
          subtotal: cost,
          vatTotal: cost * ((currentCompany.vatRate ?? 20) / 100),
          total: cost + cost * ((currentCompany.vatRate ?? 20) / 100),
          amountPaid: 0,
          balance: cost + cost * ((currentCompany.vatRate ?? 20) / 100),
          status: "issued",
        }
        const created = await invoiceService.create(ctx, invoice)
        await workshopService.update(ctx, saved.id, { invoiceId: created.id })
        toast.success(`Invoice ${created.number} generated`)
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save job")
    } finally {
      setBusy(false)
    }
  }

  if (!form) return null

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
    description: `${v.stockId} · ${v.registration}`,
  }))
  const mechanicOptions = vendors.map((v) => ({
    value: v.id,
    label: v.name,
    description: v.kind,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {job ? "Edit job" : jobType === "internal" ? "New internal job" : "New external job"}
          </DialogTitle>
          <DialogDescription>
            {jobType === "internal"
              ? "Prep work on a vehicle you own in stock."
              : "Walk-in customer service — links to an invoice on completion."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {jobType === "internal" ? (
            <div className="grid gap-2">
              <Label>Vehicle</Label>
              <EntityCombobox
                value={form.vehicleId}
                onChange={(v) => setForm({ ...form, vehicleId: v })}
                options={vehicleOptions}
                placeholder="Pick a stock vehicle"
              />
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="wj-cust">Customer name</Label>
                <Input
                  id="wj-cust"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wj-phone">Phone</Label>
                <Input
                  id="wj-phone"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="wj-reg">Registration</Label>
                <Input
                  id="wj-reg"
                  value={form.registration}
                  onChange={(e) => setForm({ ...form, registration: e.target.value })}
                  className="uppercase"
                />
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Mechanic / vendor</Label>
            <EntityCombobox
              value={form.mechanicId}
              onChange={(v) => setForm({ ...form, mechanicId: v })}
              options={mechanicOptions}
              placeholder="Pick a vendor"
              emptyMessage="Add mechanics on /vendors first."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wj-desc">Description</Label>
            <Textarea
              id="wj-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="wj-when">Scheduled for</Label>
              <Input
                id="wj-when"
                type="datetime-local"
                value={form.scheduledFor}
                onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wj-cost">Cost (£)</Label>
              <Input
                id="wj-cost"
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as WorkshopJobStatus })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {WORKSHOP_JOB_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {jobType === "external" && form.status === "completed" && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.generateInvoice}
                onCheckedChange={(checked) =>
                  setForm({ ...form, generateInvoice: checked === true })
                }
              />
              Generate sale invoice on completion
            </label>
          )}
          <div className="grid gap-2">
            <Label htmlFor="wj-notes">Notes</Label>
            <Textarea
              id="wj-notes"
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
            {busy ? "Saving…" : job ? "Save changes" : "Create job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
