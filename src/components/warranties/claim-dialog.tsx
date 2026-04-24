"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

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
import { WARRANTY_CLAIM_STATUSES } from "@/lib/constants"
import { warrantyClaimService } from "@/lib/services/warranty-service"
import type {
  Warranty,
  WarrantyClaim,
  WarrantyClaimStatus,
} from "@/lib/types"
import { formatDateInput } from "@/lib/utils/format"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  warranties: Warranty[]
  claim?: WarrantyClaim | null
  onSaved: () => void
}

interface FormState {
  warrantyId: string
  reportedAt: string
  description: string
  isComplaint: boolean
  status: WarrantyClaimStatus
  resolutionNotes: string
  cost: string
}

function today(): string {
  return formatDateInput(new Date().toISOString())
}

export function ClaimDialog({ open, onOpenChange, warranties, claim, onSaved }: Props) {
  const { currentUser, currentCompany } = useAuth()
  const [form, setForm] = useState<FormState | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    if (claim) {
      setForm({
        warrantyId: claim.warrantyId,
        reportedAt: formatDateInput(claim.reportedAt),
        description: claim.description,
        isComplaint: claim.isComplaint,
        status: claim.status,
        resolutionNotes: claim.resolutionNotes ?? "",
        cost: String(claim.cost ?? ""),
      })
    } else {
      setForm({
        warrantyId: warranties[0]?.id ?? "",
        reportedAt: today(),
        description: "",
        isComplaint: false,
        status: "open",
        resolutionNotes: "",
        cost: "",
      })
    }
  }, [open, claim, warranties])

  async function handleSubmit() {
    if (!form || !currentUser || !currentCompany) return
    if (!form.warrantyId) {
      toast.error("Pick a warranty")
      return
    }
    if (!form.description.trim()) {
      toast.error("Description is required")
      return
    }
    const warranty = warranties.find((w) => w.id === form.warrantyId)
    if (!warranty) {
      toast.error("Warranty not found")
      return
    }
    setBusy(true)
    try {
      const ctx = {
        companyId: currentCompany.id,
        userId: currentUser.id,
        userName: currentUser.name,
      }
      const resolved = form.status === "resolved" || form.status === "rejected"
      const payload = {
        warrantyId: form.warrantyId,
        vehicleId: warranty.vehicleId,
        customerName: warranty.customerName,
        reportedAt: new Date(form.reportedAt).toISOString(),
        description: form.description.trim(),
        isComplaint: form.isComplaint,
        status: form.status,
        resolutionNotes: form.resolutionNotes.trim() || undefined,
        cost: form.cost ? Number(form.cost) : undefined,
        resolvedAt: resolved ? (claim?.resolvedAt ?? new Date().toISOString()) : undefined,
      }
      if (claim) {
        await warrantyClaimService.update(ctx, claim.id, payload)
        toast.success("Claim updated")
      } else {
        await warrantyClaimService.create(ctx, payload)
        toast.success("Claim filed")
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save claim")
    } finally {
      setBusy(false)
    }
  }

  if (!form) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{claim ? "Edit claim" : "File warranty claim"}</DialogTitle>
          <DialogDescription>
            Tick "Complaint" to route this into the complaints log for audit.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Warranty</Label>
            <Select
              value={form.warrantyId}
              onValueChange={(v) => setForm({ ...form, warrantyId: v })}
            >
              <SelectTrigger><SelectValue placeholder="Pick a warranty" /></SelectTrigger>
              <SelectContent>
                {warranties.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.customerName} · {formatDateInput(w.startAt)} → {formatDateInput(w.endAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cd-reported">Reported on</Label>
              <Input
                id="cd-reported"
                type="date"
                value={form.reportedAt}
                onChange={(e) => setForm({ ...form, reportedAt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as WarrantyClaimStatus })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WARRANTY_CLAIM_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cd-desc">Description</Label>
            <Textarea
              id="cd-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isComplaint}
              onCheckedChange={(checked) =>
                setForm({ ...form, isComplaint: checked === true })
              }
            />
            Flag as formal complaint
          </label>
          {(form.status === "resolved" || form.status === "rejected" || form.status === "approved") && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="cd-res">Resolution notes</Label>
                <Textarea
                  id="cd-res"
                  rows={2}
                  value={form.resolutionNotes}
                  onChange={(e) => setForm({ ...form, resolutionNotes: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cd-cost">Cost to dealer (£)</Label>
                <Input
                  id="cd-cost"
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : claim ? "Save changes" : "File claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
