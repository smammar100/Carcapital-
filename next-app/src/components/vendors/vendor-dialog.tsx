"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

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
import { VENDOR_KINDS } from "@/lib/constants"
import { vendorService } from "@/lib/services/vendor-service"
import type { Vendor, VendorKind } from "@/lib/types"

interface VendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendor?: Vendor | null
  onSaved: () => void
}

interface FormState {
  name: string
  kind: VendorKind
  contactName: string
  phone: string
  email: string
  address: string
  notes: string
}

const EMPTY: FormState = {
  name: "",
  kind: "mechanic",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {}
  if (!form.name.trim()) errors.name = "Name is required"
  if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email"
  }
  return errors
}

export function VendorDialog({ open, onOpenChange, vendor, onSaved }: VendorDialogProps) {
  const { currentUser, currentCompany } = useAuth()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        vendor
          ? {
              name: vendor.name,
              kind: vendor.kind,
              contactName: vendor.contactName ?? "",
              phone: vendor.phone ?? "",
              email: vendor.email ?? "",
              address: vendor.address ?? "",
              notes: vendor.notes ?? "",
            }
          : EMPTY,
      )
      setTouched({})
    }
  }, [open, vendor])

  const errors = validate(form)
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => touched[key as keyof FormState]),
  ) as Partial<Record<keyof FormState, string>>

  async function handleSubmit() {
    if (!currentUser || !currentCompany) return
    const fullTouched = Object.keys(EMPTY).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Partial<Record<keyof FormState, boolean>>,
    )
    setTouched(fullTouched)
    if (Object.keys(errors).length > 0) return

    setBusy(true)
    try {
      const ctx = {
        companyId: currentCompany.id,
        userId: currentUser.id,
        userName: currentUser.name,
      }
      const payload = {
        name: form.name.trim(),
        kind: form.kind,
        contactName: form.contactName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      }
      if (vendor) {
        await vendorService.update(ctx, vendor.id, payload)
        toast.success("Vendor updated")
      } else {
        await vendorService.create(ctx, payload)
        toast.success("Vendor added")
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save vendor")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit vendor" : "New vendor"}</DialogTitle>
          <DialogDescription>
            {vendor ? "Update supplier details." : "Add a supplier to your directory."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="vendor-name">Name</Label>
            <Input
              id="vendor-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
            {visibleErrors.name && <p className="text-xs text-destructive">{visibleErrors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vendor-kind">Kind</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as VendorKind })}>
              <SelectTrigger id="vendor-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="vendor-contact">Contact name</Label>
              <Input
                id="vendor-contact"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendor-phone">Phone</Label>
              <Input
                id="vendor-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vendor-email">Email</Label>
            <Input
              id="vendor-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            />
            {visibleErrors.email && <p className="text-xs text-destructive">{visibleErrors.email}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vendor-address">Address</Label>
            <Input
              id="vendor-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vendor-notes">Notes</Label>
            <Textarea
              id="vendor-notes"
              rows={3}
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
            {busy ? "Saving…" : vendor ? "Save changes" : "Add vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
