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
import { WARRANTY_PROVIDERS, WARRANTY_STATUSES } from "@/lib/constants"
import { stockService } from "@/lib/services/stock-service"
import { warrantyService } from "@/lib/services/warranty-service"
import type {
  Vehicle,
  Warranty,
  WarrantyProvider,
  WarrantyStatus,
} from "@/lib/types"
import { formatDateInput } from "@/lib/utils/format"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  warranty?: Warranty | null
  onSaved: () => void
}

interface FormState {
  vehicleId: string | undefined
  customerName: string
  provider: WarrantyProvider
  providerName: string
  startAt: string
  endAt: string
  coverageSummary: string
  status: WarrantyStatus
}

function today(): string {
  return formatDateInput(new Date().toISOString())
}

function addMonths(dateStr: string, months: number): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return formatDateInput(d.toISOString())
}

export function WarrantyDialog({ open, onOpenChange, warranty, onSaved }: Props) {
  const { currentUser, currentCompany } = useAuth()
  const [form, setForm] = useState<FormState | null>(null)
  const [busy, setBusy] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    if (!open || !currentUser || !currentCompany) return
    stockService
      .list({ companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name })
      .then(setVehicles)
  }, [open, currentUser, currentCompany])

  useEffect(() => {
    if (!open) return
    if (warranty) {
      setForm({
        vehicleId: warranty.vehicleId,
        customerName: warranty.customerName,
        provider: warranty.provider,
        providerName: warranty.providerName ?? "",
        startAt: formatDateInput(warranty.startAt),
        endAt: formatDateInput(warranty.endAt),
        coverageSummary: warranty.coverageSummary ?? "",
        status: warranty.status,
      })
    } else {
      const start = today()
      setForm({
        vehicleId: undefined,
        customerName: "",
        provider: "in_house",
        providerName: "",
        startAt: start,
        endAt: addMonths(start, 12),
        coverageSummary: "",
        status: "active",
      })
    }
  }, [open, warranty])

  async function handleSubmit() {
    if (!form || !currentUser || !currentCompany) return
    if (!form.vehicleId) {
      toast.error("Pick a vehicle")
      return
    }
    if (!form.customerName.trim()) {
      toast.error("Customer name is required")
      return
    }
    if (!form.startAt || !form.endAt) {
      toast.error("Start and end dates are required")
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
        vehicleId: form.vehicleId,
        customerName: form.customerName.trim(),
        provider: form.provider,
        providerName: form.providerName.trim() || undefined,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        coverageSummary: form.coverageSummary.trim() || undefined,
        status: form.status,
      }
      if (warranty) {
        await warrantyService.update(ctx, warranty.id, payload)
        toast.success("Warranty updated")
      } else {
        await warrantyService.create(ctx, payload)
        toast.success("Warranty created")
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save warranty")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{warranty ? "Edit warranty" : "New warranty"}</DialogTitle>
          <DialogDescription>
            In-house or third-party cover for a sold vehicle.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Vehicle</Label>
            <EntityCombobox
              value={form.vehicleId}
              onChange={(v) => setForm({ ...form, vehicleId: v })}
              options={vehicleOptions}
              placeholder="Pick a vehicle"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wd-cust">Customer name</Label>
            <Input
              id="wd-cust"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Provider</Label>
              <Select
                value={form.provider}
                onValueChange={(v) => setForm({ ...form, provider: v as WarrantyProvider })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WARRANTY_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wd-provname">Provider name</Label>
              <Input
                id="wd-provname"
                value={form.providerName}
                onChange={(e) => setForm({ ...form, providerName: e.target.value })}
                placeholder={form.provider === "third_party" ? "e.g. Warrantywise" : "Optional"}
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="wd-start">Start</Label>
              <Input
                id="wd-start"
                type="date"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wd-end">End</Label>
              <Input
                id="wd-end"
                type="date"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wd-cover">Coverage summary</Label>
            <Textarea
              id="wd-cover"
              rows={3}
              value={form.coverageSummary}
              onChange={(e) => setForm({ ...form, coverageSummary: e.target.value })}
              placeholder="e.g. Engine, gearbox, drivetrain — parts and labour"
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as WarrantyStatus })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {WARRANTY_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : warranty ? "Save changes" : "Create warranty"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
