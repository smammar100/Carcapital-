"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DEALERSHIP_TYPES,
  FINANCE_PROVIDERS,
  MONTHLY_STOCK_VOLUMES,
  PRIMARY_SOURCING,
} from "@/lib/constants"
import { companiesService } from "@/lib/services/users-service"
import type {
  DealershipType,
  MonthlyStockVolume,
  PrimarySourcing,
} from "@/lib/types"

interface FormState {
  name: string
  address: string
  phone: string
  email: string
  website: string
  city: string
  postcode: string
  companyRegistrationNumber: string
  vatNumber: string
  vatRate: string
  openingHours: string
  stockIdPrefix: string
  defaultFinanceProvider: string
  defaultAppointmentDurationMins: string
  dealershipType: DealershipType
  monthlyStockVolume: MonthlyStockVolume
  primarySourcing: PrimarySourcing
}

export default function AdminSettingsPage() {
  const { currentCompany, refreshSession } = useAuth()
  const [form, setForm] = useState<FormState | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!currentCompany) {
      setForm(null)
      return
    }
    setForm({
      name: currentCompany.name ?? "",
      address: currentCompany.address ?? "",
      phone: currentCompany.phone ?? "",
      email: currentCompany.email ?? "",
      website: currentCompany.website ?? "",
      city: currentCompany.city ?? "",
      postcode: currentCompany.postcode ?? "",
      companyRegistrationNumber: currentCompany.companyRegistrationNumber ?? "",
      vatNumber: currentCompany.vatNumber ?? "",
      vatRate: String(currentCompany.vatRate ?? 20),
      openingHours: currentCompany.openingHours ?? "",
      stockIdPrefix: currentCompany.stockIdPrefix ?? "",
      defaultFinanceProvider: currentCompany.defaultFinanceProvider ?? "none",
      defaultAppointmentDurationMins: String(
        currentCompany.defaultAppointmentDurationMins ?? 30,
      ),
      dealershipType: currentCompany.dealershipType ?? "independent",
      monthlyStockVolume: currentCompany.monthlyStockVolume ?? "<10",
      primarySourcing: currentCompany.primarySourcing ?? "mix",
    })
  }, [currentCompany])

  async function handleSave() {
    if (!form || !currentCompany) return
    setBusy(true)
    try {
      await companiesService.update(currentCompany.id, {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        website: form.website.trim() || undefined,
        city: form.city.trim() || undefined,
        postcode: form.postcode.trim() || undefined,
        companyRegistrationNumber: form.companyRegistrationNumber.trim() || undefined,
        vatNumber: form.vatNumber.trim() || undefined,
        vatRate: Number(form.vatRate) || 0,
        openingHours: form.openingHours.trim() || undefined,
        stockIdPrefix: form.stockIdPrefix.trim() || undefined,
        defaultFinanceProvider: form.defaultFinanceProvider,
        defaultAppointmentDurationMins: Number(form.defaultAppointmentDurationMins) || 30,
        dealershipType: form.dealershipType,
        monthlyStockVolume: form.monthlyStockVolume,
        primarySourcing: form.primarySourcing,
      })
      await refreshSession()
      toast.success("Company settings saved")
    } catch (err) {
      console.error(err)
      toast.error("Could not save settings")
    } finally {
      setBusy(false)
    }
  }

  if (!form) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Company settings" subtitle="Branding, VAT, defaults, and dealership profile." />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Company settings"
        subtitle="Branding, VAT, defaults, and dealership profile."
        actions={
          <Button onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>How your dealership appears on invoices, quotes, and listings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="s-name">Company name</Label>
            <Input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="s-address">Address</Label>
            <Input id="s-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-city">City</Label>
            <Input id="s-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-post">Postcode</Label>
            <Input id="s-post" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-phone">Phone</Label>
            <Input id="s-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-email">Email</Label>
            <Input id="s-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-site">Website</Label>
            <Input id="s-site" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-hours">Opening hours</Label>
            <Input id="s-hours" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} placeholder="Mon–Fri 9–6, Sat 10–4" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-reg">Company reg. number</Label>
            <Input id="s-reg" value={form.companyRegistrationNumber} onChange={(e) => setForm({ ...form, companyRegistrationNumber: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-vatno">VAT number</Label>
            <Input id="s-vatno" value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational defaults</CardTitle>
          <CardDescription>Used when creating vehicles, invoices and appointments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="s-vat">VAT rate (%)</Label>
            <Input
              id="s-vat"
              type="number"
              value={form.vatRate}
              onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-prefix">Stock ID prefix</Label>
            <Input
              id="s-prefix"
              value={form.stockIdPrefix}
              onChange={(e) => setForm({ ...form, stockIdPrefix: e.target.value })}
              placeholder="CC-"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-appt">Default appointment (mins)</Label>
            <Input
              id="s-appt"
              type="number"
              value={form.defaultAppointmentDurationMins}
              onChange={(e) => setForm({ ...form, defaultAppointmentDurationMins: e.target.value })}
            />
          </div>
          <div className="grid gap-2 sm:col-span-3">
            <Label htmlFor="s-finance">Default stocking finance provider</Label>
            <Select
              value={form.defaultFinanceProvider}
              onValueChange={(v) => setForm({ ...form, defaultFinanceProvider: v })}
            >
              <SelectTrigger id="s-finance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FINANCE_PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dealership profile</CardTitle>
          <CardDescription>Used by insights and to tune recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="s-type">Dealership type</Label>
            <Select
              value={form.dealershipType}
              onValueChange={(v) => setForm({ ...form, dealershipType: v as DealershipType })}
            >
              <SelectTrigger id="s-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEALERSHIP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-vol">Monthly stock volume</Label>
            <Select
              value={form.monthlyStockVolume}
              onValueChange={(v) => setForm({ ...form, monthlyStockVolume: v as MonthlyStockVolume })}
            >
              <SelectTrigger id="s-vol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHLY_STOCK_VOLUMES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-src">Primary sourcing</Label>
            <Select
              value={form.primarySourcing}
              onValueChange={(v) => setForm({ ...form, primarySourcing: v as PrimarySourcing })}
            >
              <SelectTrigger id="s-src">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_SOURCING.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-3">
            <Label htmlFor="s-notes">Opening notes / public blurb</Label>
            <Textarea
              id="s-notes"
              rows={3}
              value={form.openingHours}
              onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
              placeholder="Short tagline or operating notes"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
