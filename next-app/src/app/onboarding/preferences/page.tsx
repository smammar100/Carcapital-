"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { APPOINTMENT_DURATIONS, FINANCE_PROVIDERS } from "@/lib/constants"
import { useAuth } from "@/lib/auth-context"
import { companiesService } from "@/lib/services/users-service"

interface FormState {
  stockIdPrefix: string
  defaultFinanceProvider: string
  defaultAppointmentDurationMins: string
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(form: FormState): Errors {
  const e: Errors = {}
  if (!form.stockIdPrefix.trim()) e.stockIdPrefix = "Pick a prefix."
  if (!/^[A-Z0-9-]{2,8}$/.test(form.stockIdPrefix.trim().toUpperCase()))
    e.stockIdPrefix = "2–8 characters, letters/numbers/- only."
  return e
}

export default function OnboardingPreferencesPage() {
  const router = useRouter()
  const { currentCompany } = useAuth()

  const [form, setForm] = useState<FormState>(() => ({
    stockIdPrefix: currentCompany?.stockIdPrefix ?? "",
    defaultFinanceProvider: currentCompany?.defaultFinanceProvider ?? "",
    defaultAppointmentDurationMins: String(
      currentCompany?.defaultAppointmentDurationMins ?? 30,
    ),
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
        stockIdPrefix: form.stockIdPrefix.trim().toUpperCase(),
        defaultFinanceProvider: form.defaultFinanceProvider || undefined,
        defaultAppointmentDurationMins: Number(form.defaultAppointmentDurationMins),
      })
      router.push("/onboarding/complete")
    } finally {
      setSaving(false)
    }
  }

  const prefix = form.stockIdPrefix.trim().toUpperCase()
  const previewId = prefix ? `${prefix.replace(/-$/, "")}-001` : "ABC-001"

  return (
    <OnboardingShell
      title="Workspace preferences"
      description="Sensible defaults now save clicks later. You can tweak all of this in Settings."
      footer={
        <>
          <Button asChild variant="ghost">
            <Link href="/onboarding/company-details">
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
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="stockIdPrefix">Stock ID prefix</FieldLabel>
          <Input
            id="stockIdPrefix"
            value={form.stockIdPrefix}
            onChange={(e) => update("stockIdPrefix", e.target.value.toUpperCase())}
            onBlur={() => markTouched("stockIdPrefix")}
            aria-invalid={!!visibleErrors.stockIdPrefix}
            placeholder="CCL-"
          />
          <FieldDescription>
            Each new vehicle is stamped with this prefix — e.g.{" "}
            <span className="font-mono text-foreground">{previewId}</span>.
          </FieldDescription>
          {visibleErrors.stockIdPrefix ? (
            <FieldError>{visibleErrors.stockIdPrefix}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="defaultFinanceProvider">
            Default finance provider (optional)
          </FieldLabel>
          <Select
            value={form.defaultFinanceProvider}
            onValueChange={(v) => update("defaultFinanceProvider", v)}
          >
            <SelectTrigger id="defaultFinanceProvider">
              <SelectValue placeholder="Choose one…" />
            </SelectTrigger>
            <SelectContent>
              {FINANCE_PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Pre-fills on new finance applications. You can still switch per deal.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="defaultAppointmentDurationMins">
            Default appointment duration
          </FieldLabel>
          <Select
            value={form.defaultAppointmentDurationMins}
            onValueChange={(v) => update("defaultAppointmentDurationMins", v)}
          >
            <SelectTrigger id="defaultAppointmentDurationMins">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPOINTMENT_DURATIONS.map((d) => (
                <SelectItem key={d.value} value={String(d.value)}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </OnboardingShell>
  )
}
