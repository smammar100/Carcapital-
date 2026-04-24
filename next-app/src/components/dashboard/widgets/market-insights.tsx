import { RiSparklingLine } from "@remixicon/react"

const CARDS = [
  {
    title: "Used-car prices up 3.2% Q1 2026",
    body: "Demand for compact SUVs continues to outstrip supply across the South East.",
  },
  {
    title: "Diesel residuals softening",
    body: "Diesels aged 6+ years are depreciating ~1.4% faster than petrol equivalents month-on-month.",
  },
  {
    title: "Auction footfall steady",
    body: "BCA Blackbushe throughput is flat vs Q4 — expect consistent supply through April.",
  },
  {
    title: "EV enquiries accelerating",
    body: "Website EV leads are up 22% YoY, but conversion lags by 11 days vs petrol.",
  },
]

export function MarketInsights() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {CARDS.map((c) => (
        <div
          key={c.title}
          className="rounded-md border bg-muted/10 px-3 py-2.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <RiSparklingLine className="size-3.5 text-primary" />
            <span>{c.title}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{c.body}</p>
        </div>
      ))}
    </div>
  )
}
