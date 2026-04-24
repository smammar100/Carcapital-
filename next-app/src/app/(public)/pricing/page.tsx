import Link from "next/link"
import { RiCheckLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const TIERS = [
  {
    name: "Starter",
    price: "£100",
    blurb: "For independents just moving off spreadsheets.",
    features: [
      "Up to 25 live stock",
      "3 users",
      "Stock, inspections & CRM",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "£250",
    highlighted: true,
    blurb: "Most UK independents live here.",
    features: [
      "Up to 100 live stock",
      "10 users",
      "Finance & aftersales modules",
      "Reports & dashboards",
      "Priority email support",
    ],
  },
  {
    name: "Scale",
    price: "£500",
    blurb: "Multi-site operators and franchise groups.",
    features: [
      "Unlimited live stock & users",
      "Multi-site reporting",
      "API access & integrations",
      "Dedicated onboarding manager",
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <Badge variant="secondary" className="mx-auto w-fit">Pricing</Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Priced per dealership. Never per seat.
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Pick the tier that matches your stock volume. Upgrade, downgrade, or cancel
          from the dashboard any time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((t) => (
          <Card
            key={t.name}
            className={t.highlighted ? "border-primary shadow-md ring-1 ring-primary/30" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.name}</CardTitle>
                {t.highlighted ? <Badge>Most popular</Badge> : null}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{t.price}</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <CardDescription className="mt-2">{t.blurb}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <RiCheckLine className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full" variant={t.highlighted ? "default" : "outline"}>
                <Link href="/register">Start free trial</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 rounded-lg border border-dashed border-border/60 p-8 text-center">
        <h2 className="text-xl font-semibold">Not sure which plan fits?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Register your dealership — you&apos;ll land on Growth by default and can switch any time.
        </p>
        <Button asChild className="mt-4">
          <Link href="/register">Register your dealership</Link>
        </Button>
      </div>
    </div>
  )
}
