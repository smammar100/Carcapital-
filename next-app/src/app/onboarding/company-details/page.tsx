"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RiArrowLeftLine, RiArrowRightLine, RiImageAddLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { useAuth } from "@/lib/auth-context"
import { companiesService } from "@/lib/services/users-service"

interface FormState {
  address: string
  city: string
  postcode: string
  openingHours: string
  vatNumber: string
  vatRate: string
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(form: FormState): Errors {
  const e: Errors = {}
  if (!form.address.trim()) e.address = "Address is required."
  if (!form.city.trim()) e.city = "City is required."
  if (!form.postcode.trim()) e.postcode = "Postcode is required."
  const rate = Number(form.vatRate)
  if (!Number.isFinite(rate) || rate < 0 || rate > 30)
    e.vatRate = "VAT rate should be between 0 and 30."
  return e
}

export default function OnboardingCompanyDetailsPage() {
  const router = useRouter()
  const { currentCompany } = useAuth()
  const [form, setForm] = useState<FormState>(() => ({
    address: currentCompany?.address ?? "",
    city: currentCompany?.city ?? "",
    postcode: currentCompany?.postcode ?? "",
    openingHours: currentCompany?.openingHours ?? "Mon–Sat 09:00–18:00",
    vatNumber: currentCompany?.vatNumber ?? "",
    vatRate: String(currentCompany?.vatRate ?? 20),
  }))
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [saving, setSaving] = useState(false)

  const errors = useMemo(() => validate(form), [form])
  const visibleErrors: Errors = useMemo(() => {
    const out: Errors = {}
    for (const key of Object.keys(errors) as (keyof FormState)[]) {
      if (touched[key]) out[key] = errors[key]
    }
    return out
  }, [errors, touched])
  const isValid = Object.keys(errors).length === 0

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function markTouched(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  async function next() {
    if (!isValid) {
      const all: Partial<Record<keyof FormState, boolean>> = { ...touched }
      for (const key of Object.keys(errors) as (keyof FormState)[]) all[key] = true
      setTouched(all)
      toast.error("Please fix the highlighted fields.")
      return
    }
    if (!currentCompany) return
    setSaving(true)
    try {
      await companiesService.update(currentCompany.id, {
        address: form.address.trim(),
        city: form.city.trim(),
        postcode: form.postcode.trim().toUpperCase(),
        openingHours: form.openingHours.trim() || undefined,
        vatNumber: form.vatNumber.trim() || undefined,
        vatRate: Number(form.vatRate),
      })
      router.push("/onboarding/preferences")
    } finally {
      setSaving(false)
    }
  }

  return (
    <OnboardingShell
      title="Confirm your dealership details"
      description="We&apos;ll use these on invoices, delivery notes and finance paperwork."
      footer={
        <>
          <Button asChild variant="ghost">
            <Link href="/onboarding/welcome">
              <RiArrowLeftLine className="size-4" />
              Back
            </Link>
          </Button>
          <Button onClick={next} disabled={!isValid || saving}>
            Next
            <RiArrowRightLine className="size-4" />
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 rounded-md border border-dashed border-border/60 bg-background p-4">
        <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <RiImageAddLine className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-medium">Logo upload</div>
          <div className="text-sm text-muted-foreground">
            Coming soon — you&apos;ll be able to upload a logo from Settings.
          </div>
        </div>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="address">Street address</FieldLabel>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            onBlur={() => markTouched("address")}
            aria-invalid={!!visibleErrors.address}
          />
          {visibleErrors.address ? <FieldError>{visibleErrors.address}</FieldError> : null}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              onBlur={() => markTouched("city")}
              aria-invalid={!!visibleErrors.city}
            />
            {visibleErrors.city ? <FieldError>{visibleErrors.city}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="postcode">Postcode</FieldLabel>
            <Input
              id="postcode"
              value={form.postcode}
              onChange={(e) => update("postcode", e.target.value.toUpperCase())}
              onBlur={() => markTouched("postcode")}
              aria-invalid={!!visibleErrors.postcode}
            />
            {visibleErrors.postcode ? <FieldError>{visibleErrors.postcode}</FieldError> : null}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="openingHours">Opening hours (optional)</FieldLabel>
          <Textarea
            id="openingHours"
            rows={2}
            value={form.openingHours}
            onChange={(e) => update("openingHours", e.target.value)}
          />
          <FieldDescription>Free text — e.g. &ldquo;Mon–Sat 09:00–18:00&rdquo;.</FieldDescription>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="vatNumber">VAT number (optional)</FieldLabel>
            <Input
              id="vatNumber"
              value={form.vatNumber}
              onChange={(e) => update("vatNumber", e.target.value)}
              placeholder="GB123456789"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="vatRate">VAT rate (%)</FieldLabel>
            <Input
              id="vatRate"
              type="number"
              min={0}
              max={30}
              value={form.vatRate}
              onChange={(e) => update("vatRate", e.target.value)}
              onBlur={() => markTouched("vatRate")}
              aria-invalid={!!visibleErrors.vatRate}
            />
            {visibleErrors.vatRate ? <FieldError>{visibleErrors.vatRate}</FieldError> : null}
          </Field>
        </div>
      </FieldGroup>
    </OnboardingShell>
  )
}
