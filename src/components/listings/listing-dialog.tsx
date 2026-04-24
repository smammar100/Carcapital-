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
import { LISTING_CHANNELS, LISTING_STATUSES } from "@/lib/constants"
import { listingService } from "@/lib/services/listing-service"
import { stockService } from "@/lib/services/stock-service"
import type {
  Listing,
  ListingChannel,
  ListingStatus,
  Vehicle,
} from "@/lib/types"

interface ListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing?: Listing | null
  onSaved: () => void
}

interface FormState {
  vehicleId: string | undefined
  channel: ListingChannel
  status: ListingStatus
  title: string
  description: string
  askingPrice: string
}

const EMPTY: FormState = {
  vehicleId: undefined,
  channel: "autotrader",
  status: "draft",
  title: "",
  description: "",
  askingPrice: "",
}

export function ListingDialog({ open, onOpenChange, listing, onSaved }: ListingDialogProps) {
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
    if (!open) return
    setForm(
      listing
        ? {
            vehicleId: listing.vehicleId,
            channel: listing.channel,
            status: listing.status,
            title: listing.title,
            description: listing.description,
            askingPrice: String(listing.askingPrice ?? ""),
          }
        : EMPTY,
    )
  }, [open, listing])

  async function handleSubmit() {
    if (!currentUser || !currentCompany) return
    if (!form.vehicleId) {
      toast.error("Pick a vehicle")
      return
    }
    if (!form.title.trim() || !form.askingPrice) {
      toast.error("Title and asking price are required")
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
        channel: form.channel,
        status: form.status,
        title: form.title.trim(),
        description: form.description.trim(),
        askingPrice: Number(form.askingPrice),
        publishedAt: form.status === "active" ? new Date().toISOString() : undefined,
      }
      if (listing) {
        await listingService.update(ctx, listing.id, payload)
        toast.success("Listing updated")
      } else {
        await listingService.create(ctx, payload)
        toast.success("Listing created")
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save listing")
    } finally {
      setBusy(false)
    }
  }

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
    description: `${v.stockId} · ${v.registration}`,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{listing ? "Edit listing" : "New listing"}</DialogTitle>
          <DialogDescription>
            Publish to AutoTrader, CarGurus, Facebook, or your own site.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Vehicle</Label>
            <EntityCombobox
              value={form.vehicleId}
              onChange={(vehicleId) => {
                const v = vehicles.find((x) => x.id === vehicleId)
                setForm({
                  ...form,
                  vehicleId,
                  title:
                    form.title ||
                    (v ? `${v.year} ${v.make} ${v.model} ${v.variant ?? ""}`.trim() : ""),
                  askingPrice: form.askingPrice || (v ? String(v.listPrice) : ""),
                })
              }}
              options={vehicleOptions}
              placeholder="Pick a vehicle"
              emptyMessage="Add a vehicle to Inventory first."
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Channel</Label>
              <Select
                value={form.channel}
                onValueChange={(v) => setForm({ ...form, channel: v as ListingChannel })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LISTING_CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as ListingStatus })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LISTING_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ls-title">Title</Label>
            <Input
              id="ls-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ls-desc">Description</Label>
            <Textarea
              id="ls-desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ls-price">Asking price (£)</Label>
            <Input
              id="ls-price"
              type="number"
              value={form.askingPrice}
              onChange={(e) => setForm({ ...form, askingPrice: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : listing ? "Save changes" : "Create listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
