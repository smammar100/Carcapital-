"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { RiArrowLeftLine, RiCarLine, RiSearchLine } from "@remixicon/react"
import { toast } from "sonner"

import { CostSidebar, deriveCosts } from "@/components/inventory/cost-sidebar"
import type { CostInputs } from "@/components/inventory/cost-sidebar"
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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  AUCTION_HOUSES,
  BODY_TYPES,
  FINANCE_PROVIDERS,
  FUEL_TYPES,
  SERVICE_HISTORY_OPTIONS,
  SOURCE_TYPES,
  TRANSMISSION_TYPES,
  UK_MAKES,
} from "@/lib/constants"
import { dvlaService } from "@/lib/services/dvla-service"
import { stockService } from "@/lib/services/stock-service"
import type {
  BodyType,
  FuelType,
  ServiceHistory,
  SourceType,
  TransmissionType,
} from "@/lib/types"
import { formatRegPlate } from "@/lib/utils/format"

interface FormState {
  registration: string
  vin: string
  make: string
  model: string
  variant: string
  year: string
  bodyType: BodyType
  doors: string
  fuelType: FuelType
  transmission: TransmissionType
  colour: string
  mileage: string
  serviceHistory: ServiceHistory
  v5Received: boolean
  motExpiry: string
  previousOwners: string
  keysCount: string
  sourceType: SourceType
  auctionHouse: string
  sourceRef: string
  sourceDate: string
  purchasePrice: string
  auctionFee: string
  transportCost: string
  vatOnPurchase: string
  adminFee: string
  inspectionCost: string
  valetCost: string
  financeProvider: string
  expectedStockingDays: string
  preparationCost: string
  valueAddition: string
  listPrice: string
  reservePrice: string
  targetMargin: string
  location: string
  notes: string
}

const EMPTY: FormState = {
  registration: "",
  vin: "",
  make: "",
  model: "",
  variant: "",
  year: String(new Date().getFullYear() - 3),
  bodyType: "Hatchback",
  doors: "5",
  fuelType: "petrol",
  transmission: "manual",
  colour: "",
  mileage: "",
  serviceHistory: "unknown",
  v5Received: false,
  motExpiry: "",
  previousOwners: "",
  keysCount: "2",
  sourceType: "auction",
  auctionHouse: "BCA",
  sourceRef: "",
  sourceDate: new Date().toISOString().slice(0, 10),
  purchasePrice: "",
  auctionFee: "",
  transportCost: "",
  vatOnPurchase: "0",
  adminFee: "0",
  inspectionCost: "0",
  valetCost: "0",
  financeProvider: "none",
  expectedStockingDays: "30",
  preparationCost: "0",
  valueAddition: "0",
  listPrice: "",
  reservePrice: "",
  targetMargin: "",
  location: "Main forecourt",
  notes: "",
}

export default function NewVehiclePage() {
  const router = useRouter()
  const { currentUser, currentCompany } = useAuth()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [dvlaLoading, setDvlaLoading] = useState(false)

  const financeConfig = FINANCE_PROVIDERS.find((p) => p.value === form.financeProvider)

  const costInputs: CostInputs = useMemo(
    () => ({
      purchasePrice: Number(form.purchasePrice) || 0,
      auctionFee: Number(form.auctionFee) || 0,
      transportCost: Number(form.transportCost) || 0,
      adminFee: Number(form.adminFee) || 0,
      inspectionCost: Number(form.inspectionCost) || 0,
      valetCost: Number(form.valetCost) || 0,
      vatOnPurchase: Number(form.vatOnPurchase) || 0,
      stockingLoadingFee: financeConfig?.loadingFee ?? 0,
      stockingDailyCharge: financeConfig?.dailyCharge ?? 0,
      stockingUnloadingFee: financeConfig?.unloadingFee ?? 0,
      expectedStockingDays: Number(form.expectedStockingDays) || 0,
      preparationCost: Number(form.preparationCost) || 0,
      valueAddition: Number(form.valueAddition) || 0,
      listPrice: Number(form.listPrice) || 0,
    }),
    [form, financeConfig],
  )

  async function handleDvla() {
    if (!form.registration.trim()) {
      toast.error("Enter a registration first")
      return
    }
    setDvlaLoading(true)
    try {
      const result = await dvlaService.lookup(form.registration)
      if (!result) {
        toast.error("No match from DVLA lookup")
        return
      }
      setForm((prev) => ({
        ...prev,
        registration: result.registration,
        make: result.make,
        model: result.model,
        variant: result.variant ?? prev.variant,
        year: String(result.year),
        fuelType: result.fuelType,
        transmission: result.transmission,
        colour: result.colour,
      }))
      toast.success("Auto-filled from DVLA")
    } finally {
      setDvlaLoading(false)
    }
  }

  async function handleSubmit() {
    if (!currentUser || !currentCompany) return
    if (!form.registration.trim() || !form.make.trim() || !form.model.trim()) {
      toast.error("Reg, make, and model are required")
      return
    }
    if (!form.purchasePrice || !form.listPrice) {
      toast.error("Purchase price and list price are required")
      return
    }
    setBusy(true)
    try {
      const derived = deriveCosts(costInputs)
      const prefix = currentCompany.stockIdPrefix ?? "CC-"
      const stockShort = Math.random().toString(36).slice(2, 7).toUpperCase()
      const regClean = formatRegPlate(form.registration)
      const created = await stockService.create(
        {
          companyId: currentCompany.id,
          userId: currentUser.id,
          userName: currentUser.name,
        },
        {
          stockId: `${prefix}${stockShort}`,
          vin: form.vin.trim() || `AUTO${stockShort}${regClean.replace(/\s+/g, "")}`,
          registration: regClean,
          make: form.make.trim(),
          model: form.model.trim(),
          variant: form.variant.trim() || undefined,
          year: Number(form.year) || new Date().getFullYear(),
          bodyType: form.bodyType,
          doors: Number(form.doors) || 5,
          fuelType: form.fuelType,
          transmission: form.transmission,
          colour: form.colour.trim() || "Unknown",
          mileage: Number(form.mileage) || 0,
          serviceHistory: form.serviceHistory,
          v5Received: form.v5Received,
          motExpiry: form.motExpiry || undefined,
          previousOwners: form.previousOwners ? Number(form.previousOwners) : undefined,
          keysCount: Number(form.keysCount) || undefined,
          sourceType: form.sourceType,
          auctionHouse: form.sourceType === "auction" ? form.auctionHouse : undefined,
          sourceRef: form.sourceRef.trim() || undefined,
          sourceDate: form.sourceDate || undefined,
          purchasePrice: costInputs.purchasePrice,
          auctionFee: costInputs.auctionFee,
          transportCost: costInputs.transportCost,
          vatOnPurchase: costInputs.vatOnPurchase,
          adminFee: costInputs.adminFee,
          inspectionCost: costInputs.inspectionCost,
          valetCost: costInputs.valetCost,
          financeProvider: form.financeProvider !== "none" ? form.financeProvider : undefined,
          stockingLoadingFee: costInputs.stockingLoadingFee,
          stockingDailyCharge: costInputs.stockingDailyCharge,
          stockingUnloadingFee: costInputs.stockingUnloadingFee,
          expectedStockingDays: costInputs.expectedStockingDays,
          preparationCost: costInputs.preparationCost,
          valueAddition: costInputs.valueAddition,
          baseCost: derived.baseCost,
          landedCost: derived.landedCost,
          totalPreparationCost: derived.totalPreparationCost,
          totalStockingCost: derived.totalStockingCost,
          allInCost: derived.allInCost,
          listPrice: costInputs.listPrice,
          reservePrice: Number(form.reservePrice) || costInputs.listPrice * 0.95,
          targetMargin: Number(form.targetMargin) || derived.expectedMargin,
          status: "received",
          daysInStock: 0,
          location: form.location.trim() || undefined,
          photos: [],
          notes: form.notes.trim() || undefined,
        },
      )
      toast.success(`${created.make} ${created.model} added to stock`)
      router.push(`/inventory/${created.id}`)
    } catch (err) {
      console.error(err)
      toast.error("Could not add vehicle")
    } finally {
      setBusy(false)
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/inventory">
            <RiArrowLeftLine className="size-4" />
            Back to inventory
          </Link>
        </Button>
        <PageHeader
          title="Add vehicle"
          subtitle="Log arrival — identity, cost, and prep plan in one pass."
          actions={
            <Button onClick={handleSubmit} disabled={busy}>
              <RiCarLine className="size-4" />
              {busy ? "Saving…" : "Add to stock"}
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Section title="Identity" description="Registration + DVLA auto-fill.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="n-reg">Registration</Label>
                <div className="flex gap-2">
                  <Input
                    id="n-reg"
                    value={form.registration}
                    onChange={(e) => update("registration", e.target.value)}
                    placeholder="LX68 CZK"
                    className="uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDvla}
                    disabled={dvlaLoading || !form.registration.trim()}
                  >
                    {dvlaLoading ? (
                      <Spinner className="size-4" />
                    ) : (
                      <RiSearchLine className="size-4" />
                    )}
                    DVLA lookup
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-vin">VIN</Label>
                <Input
                  id="n-vin"
                  value={form.vin}
                  onChange={(e) => update("vin", e.target.value)}
                  placeholder="17-character VIN"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-make">Make</Label>
                <Select value={form.make} onValueChange={(v) => update("make", v)}>
                  <SelectTrigger id="n-make"><SelectValue placeholder="Select make" /></SelectTrigger>
                  <SelectContent>
                    {UK_MAKES.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-model">Model</Label>
                <Input
                  id="n-model"
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="n-variant">Variant / trim</Label>
                <Input
                  id="n-variant"
                  value={form.variant}
                  onChange={(e) => update("variant", e.target.value)}
                  placeholder="e.g. Sport 35 TFSI"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-year">Year</Label>
                <Input id="n-year" type="number" value={form.year} onChange={(e) => update("year", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-mileage">Mileage</Label>
                <Input id="n-mileage" type="number" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Body</Label>
                <Select value={form.bodyType} onValueChange={(v) => update("bodyType", v as BodyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BODY_TYPES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-doors">Doors</Label>
                <Input id="n-doors" type="number" value={form.doors} onChange={(e) => update("doors", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Fuel</Label>
                <Select value={form.fuelType} onValueChange={(v) => update("fuelType", v as FuelType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Transmission</Label>
                <Select value={form.transmission} onValueChange={(v) => update("transmission", v as TransmissionType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSMISSION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="n-colour">Colour</Label>
                <Input id="n-colour" value={form.colour} onChange={(e) => update("colour", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Documentation" description="V5, MOT, previous owners, keys.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <input
                  id="n-v5"
                  type="checkbox"
                  className="size-4"
                  checked={form.v5Received}
                  onChange={(e) => update("v5Received", e.target.checked)}
                />
                <Label htmlFor="n-v5">V5C received</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-mot">MOT expiry</Label>
                <Input id="n-mot" type="date" value={form.motExpiry} onChange={(e) => update("motExpiry", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-owners">Previous owners</Label>
                <Input id="n-owners" type="number" value={form.previousOwners} onChange={(e) => update("previousOwners", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-keys">Keys</Label>
                <Input id="n-keys" type="number" value={form.keysCount} onChange={(e) => update("keysCount", e.target.value)} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>Service history</Label>
                <Select value={form.serviceHistory} onValueChange={(v) => update("serviceHistory", v as ServiceHistory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_HISTORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <Section title="Source" description="Where the vehicle came from.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Source type</Label>
                <Select value={form.sourceType} onValueChange={(v) => update("sourceType", v as SourceType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.sourceType === "auction" && (
                <div className="grid gap-2">
                  <Label>Auction house</Label>
                  <Select value={form.auctionHouse} onValueChange={(v) => update("auctionHouse", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUCTION_HOUSES.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="n-ref">Source reference</Label>
                <Input id="n-ref" value={form.sourceRef} onChange={(e) => update("sourceRef", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-date">Source date</Label>
                <Input id="n-date" type="date" value={form.sourceDate} onChange={(e) => update("sourceDate", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Purchase cost" description="The core buy-in breakdown.">
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyField id="n-pp" label="Purchase price" value={form.purchasePrice} onChange={(v) => update("purchasePrice", v)} />
              <MoneyField id="n-af" label="Auction fee" value={form.auctionFee} onChange={(v) => update("auctionFee", v)} />
              <MoneyField id="n-tc" label="Transport" value={form.transportCost} onChange={(v) => update("transportCost", v)} />
              <MoneyField id="n-vat" label="VAT on purchase" value={form.vatOnPurchase} onChange={(v) => update("vatOnPurchase", v)} />
              <MoneyField id="n-adm" label="Admin fee" value={form.adminFee} onChange={(v) => update("adminFee", v)} />
              <MoneyField id="n-ins" label="Inspection cost" value={form.inspectionCost} onChange={(v) => update("inspectionCost", v)} />
              <MoneyField id="n-val" label="Valet cost" value={form.valetCost} onChange={(v) => update("valetCost", v)} />
            </div>
          </Section>

          <Section title="Stocking plan" description="Finance provider drives the daily carry cost.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label>Finance provider</Label>
                <Select value={form.financeProvider} onValueChange={(v) => update("financeProvider", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FINANCE_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-days">Expected stocking days</Label>
                <Input id="n-days" type="number" value={form.expectedStockingDays} onChange={(e) => update("expectedStockingDays", e.target.value)} />
              </div>
              {financeConfig && financeConfig.value !== "none" && (
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Loading £{financeConfig.loadingFee} · Daily £{financeConfig.dailyCharge} · Unloading £{financeConfig.unloadingFee}
                </div>
              )}
            </div>
          </Section>

          <Section title="Preparation" description="Prep spend + any value-add work.">
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyField id="n-prep" label="Preparation cost" value={form.preparationCost} onChange={(v) => update("preparationCost", v)} />
              <MoneyField id="n-add" label="Value addition" value={form.valueAddition} onChange={(v) => update("valueAddition", v)} />
            </div>
          </Section>

          <Section title="Pricing" description="Asking, reserve, and target margin.">
            <div className="grid gap-4 sm:grid-cols-3">
              <MoneyField id="n-list" label="List price" value={form.listPrice} onChange={(v) => update("listPrice", v)} />
              <MoneyField id="n-res" label="Reserve price" value={form.reservePrice} onChange={(v) => update("reservePrice", v)} />
              <MoneyField id="n-tm" label="Target margin" value={form.targetMargin} onChange={(v) => update("targetMargin", v)} />
            </div>
          </Section>

          <Section title="Notes" description="Where the car sits, opening notes.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="n-loc">Location</Label>
                <Input id="n-loc" value={form.location} onChange={(e) => update("location", e.target.value)} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="n-notes">Notes</Label>
                <Textarea id="n-notes" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
              </div>
            </div>
          </Section>
        </div>

        <div className="hidden lg:block">
          <CostSidebar inputs={costInputs} />
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function MoneyField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label} (£)</Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
