"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  DEALERSHIP_TYPES,
  MONTHLY_STOCK_VOLUMES,
  PRIMARY_SOURCING,
} from "@/lib/constants"
import { useAuth } from "@/lib/auth-context"
import type {
  DealershipType,
  MonthlyStockVolume,
  PrimarySourcing,
} from "@/lib/types"

interface FormState {
  // Step 1 — account
  fullName: string
  email: string
  phone: string
  password: string
  // Step 2 — dealership
  companyName: string
  address: string
  city: string
  postcode: string
  companyRegistrationNumber: string
  website: string
  // Step 3 — profile
  dealershipType: DealershipType | ""
  monthlyStockVolume: MonthlyStockVolume | ""
  primarySourcing: PrimarySourcing | ""
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  companyName: "",
  address: "",
  city: "",
  postcode: "",
  companyRegistrationNumber: "",
  website: "",
  dealershipType: "",
  monthlyStockVolume: "",
  primarySourcing: "",
}

type Errors = Partial<Record<keyof FormState, string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// UK postcode: loose but realistic (e.g. "EC4Y 1JU", "B21 9SA")
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

const STEPS = [
  { title: "Account", description: "Your name + sign-in email." },
  { title: "Dealership", description: "Where you trade from." },
  { title: "Business profile", description: "Tell us how you run." },
  { title: "Confirm", description: "Double-check and create." },
] as const

function validateStep(step: number, form: FormState): Errors {
  const e: Errors = {}
  if (step === 0) {
    if (!form.fullName.trim()) e.fullName = "Your name is required."
    if (!EMAIL_REGEX.test(form.email.trim())) e.email = "Enter a valid email address."
    if (form.password.length > 0 && form.password.length < 8)
      e.password = "Password must be at least 8 characters."
    if (!form.password) e.password = "Pick a password (8+ characters)."
  }
  if (step === 1) {
    if (!form.companyName.trim()) e.companyName = "Dealership name is required."
    if (!form.address.trim()) e.address = "Address is required."
    if (!form.city.trim()) e.city = "City is required."
    if (!UK_POSTCODE_REGEX.test(form.postcode.trim()))
      e.postcode = "Enter a valid UK postcode."
  }
  if (step === 2) {
    if (!form.dealershipType) e.dealershipType = "Pick a dealership type."
    if (!form.monthlyStockVolume) e.monthlyStockVolume = "Pick your volume."
    if (!form.primarySourcing) e.primarySourcing = "Pick a primary sourcing."
  }
  return e
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)

  const errors = useMemo(() => validateStep(step, form), [step, form])
  const visibleErrors: Errors = useMemo(() => {
    const out: Errors = {}
    for (const key of Object.keys(errors) as (keyof FormState)[]) {
      if (touched[key]) out[key] = errors[key]
    }
    return out
  }, [errors, touched])

  const isStepValid = Object.keys(errors).length === 0

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function markTouched(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  function next() {
    if (!isStepValid) {
      // surface all errors for the current step on Next
      const all: Partial<Record<keyof FormState, boolean>> = { ...touched }
      for (const key of Object.keys(errors) as (keyof FormState)[]) all[key] = true
      setTouched(all)
      toast.error("Please fix the highlighted fields before continuing.")
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function submit() {
    setSubmitting(true)
    try {
      const { company } = await register({
        account: {
          name: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
        },
        company: {
          name: form.companyName.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postcode: form.postcode.trim().toUpperCase(),
          companyRegistrationNumber:
            form.companyRegistrationNumber.trim() || undefined,
          website: form.website.trim() || undefined,
        },
        profile: {
          dealershipType: form.dealershipType as DealershipType,
          monthlyStockVolume: form.monthlyStockVolume as MonthlyStockVolume,
          primarySourcing: form.primarySourcing as PrimarySourcing,
        },
      })
      toast.success(`Welcome, ${company.name}!`)
      router.replace("/onboarding/welcome")
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong registering your dealership.")
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          Step {step + 1} of {STEPS.length}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          {STEPS[step].title}
        </h1>
        <p className="text-muted-foreground">{STEPS[step].description}</p>
        <Progress value={progress} className="mt-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 0 && "Create your account"}
            {step === 1 && "Where's your dealership?"}
            {step === 2 && "How do you trade?"}
            {step === 3 && "Review and confirm"}
          </CardTitle>
          <CardDescription>
            {step === 0 && "This becomes your primary login for the dealership."}
            {step === 1 && "We'll use this on invoices, delivery notes and finance paperwork."}
            {step === 2 && "Helps us tailor defaults — you can change any of this later."}
            {step === 3 && "Nothing here is billed — you're in demo mode."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {step === 0 && (
            <FieldSet>
              <FieldLegend>Account</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    onBlur={() => markTouched("fullName")}
                    aria-invalid={!!visibleErrors.fullName}
                  />
                  {visibleErrors.fullName ? <FieldError>{visibleErrors.fullName}</FieldError> : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Work email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => markTouched("email")}
                    aria-invalid={!!visibleErrors.email}
                  />
                  {visibleErrors.email ? <FieldError>{visibleErrors.email}</FieldError> : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="07700 900000"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    onBlur={() => markTouched("password")}
                    aria-invalid={!!visibleErrors.password}
                  />
                  <FieldDescription>
                    Demo mode — passwords aren&apos;t stored. Login is email-only for now.
                  </FieldDescription>
                  {visibleErrors.password ? <FieldError>{visibleErrors.password}</FieldError> : null}
                </Field>
              </FieldGroup>
            </FieldSet>
          )}

          {step === 1 && (
            <FieldSet>
              <FieldLegend>Dealership details</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="companyName">Dealership name</FieldLabel>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    onBlur={() => markTouched("companyName")}
                    aria-invalid={!!visibleErrors.companyName}
                  />
                  {visibleErrors.companyName ? (
                    <FieldError>{visibleErrors.companyName}</FieldError>
                  ) : null}
                </Field>
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
                      placeholder="EC4Y 1JU"
                    />
                    {visibleErrors.postcode ? <FieldError>{visibleErrors.postcode}</FieldError> : null}
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="companyRegistrationNumber">
                    Companies House number (optional)
                  </FieldLabel>
                  <Input
                    id="companyRegistrationNumber"
                    value={form.companyRegistrationNumber}
                    onChange={(e) => update("companyRegistrationNumber", e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="website">Website (optional)</FieldLabel>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          )}

          {step === 2 && (
            <FieldSet>
              <FieldLegend>Business profile</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="dealershipType">Dealership type</FieldLabel>
                  <Select
                    value={form.dealershipType}
                    onValueChange={(v) => {
                      update("dealershipType", v as DealershipType)
                      markTouched("dealershipType")
                    }}
                  >
                    <SelectTrigger id="dealershipType" aria-invalid={!!visibleErrors.dealershipType}>
                      <SelectValue placeholder="Choose one…" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEALERSHIP_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {visibleErrors.dealershipType ? (
                    <FieldError>{visibleErrors.dealershipType}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="monthlyStockVolume">Monthly stock volume</FieldLabel>
                  <Select
                    value={form.monthlyStockVolume}
                    onValueChange={(v) => {
                      update("monthlyStockVolume", v as MonthlyStockVolume)
                      markTouched("monthlyStockVolume")
                    }}
                  >
                    <SelectTrigger
                      id="monthlyStockVolume"
                      aria-invalid={!!visibleErrors.monthlyStockVolume}
                    >
                      <SelectValue placeholder="Choose one…" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHLY_STOCK_VOLUMES.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {visibleErrors.monthlyStockVolume ? (
                    <FieldError>{visibleErrors.monthlyStockVolume}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>Primary sourcing</FieldLabel>
                  <RadioGroup
                    value={form.primarySourcing}
                    onValueChange={(v) => {
                      update("primarySourcing", v as PrimarySourcing)
                      markTouched("primarySourcing")
                    }}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {PRIMARY_SOURCING.map((p) => (
                      <label
                        key={p.value}
                        htmlFor={`src-${p.value}`}
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-muted/40"
                      >
                        <RadioGroupItem id={`src-${p.value}`} value={p.value} />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  {visibleErrors.primarySourcing ? (
                    <FieldError>{visibleErrors.primarySourcing}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </FieldSet>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4 text-sm">
              <ReviewRow label="Name" value={form.fullName} />
              <ReviewRow label="Email" value={form.email} />
              {form.phone ? <ReviewRow label="Phone" value={form.phone} /> : null}
              <ReviewRow label="Dealership" value={form.companyName} />
              <ReviewRow
                label="Address"
                value={`${form.address}, ${form.city} ${form.postcode.toUpperCase()}`}
              />
              {form.companyRegistrationNumber ? (
                <ReviewRow label="Companies House" value={form.companyRegistrationNumber} />
              ) : null}
              {form.website ? <ReviewRow label="Website" value={form.website} /> : null}
              <ReviewRow
                label="Type"
                value={
                  DEALERSHIP_TYPES.find((t) => t.value === form.dealershipType)?.label ?? "—"
                }
              />
              <ReviewRow
                label="Volume"
                value={
                  MONTHLY_STOCK_VOLUMES.find((v) => v.value === form.monthlyStockVolume)?.label ??
                  "—"
                }
              />
              <ReviewRow
                label="Sourcing"
                value={
                  PRIMARY_SOURCING.find((p) => p.value === form.primarySourcing)?.label ?? "—"
                }
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <div>
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={back} disabled={submitting}>
                  <RiArrowLeftLine className="size-4" />
                  Back
                </Button>
              ) : (
                <Button asChild variant="ghost">
                  <Link href="/">
                    <RiArrowLeftLine className="size-4" />
                    Cancel
                  </Link>
                </Button>
              )}
            </div>
            <div>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={next} disabled={!isStepValid}>
                  Next
                  <RiArrowRightLine className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={submit}
                  disabled={submitting || isLoading}
                >
                  {submitting ? (
                    <Spinner className="size-4" />
                  ) : (
                    <RiCheckLine className="size-4" />
                  )}
                  Create dealership
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
