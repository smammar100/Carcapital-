import { RiCalendarLine } from "@remixicon/react"

import { KpiCard } from "@/components/dashboard/kpi-card"
import { daysInStockBucket } from "@/components/shared/days-in-stock-badge"
import type { Vehicle } from "@/lib/types"

interface Props {
  vehicles: Vehicle[]
}

export function KpiAvgDays({ vehicles }: Props) {
  const inStock = vehicles.filter((v) => v.status !== "sold")
  const avg = inStock.length
    ? Math.round(
        inStock.reduce((sum, v) => sum + v.daysInStock, 0) / inStock.length,
      )
    : 0
  const bucket = daysInStockBucket(avg)
  const isEmpty = inStock.length === 0
  return (
    <KpiCard
      title="Avg Days in Stock"
      icon={RiCalendarLine}
      value={isEmpty ? "—" : `${avg}d`}
      hint={isEmpty ? "Add vehicles to track" : bucket.label}
      valueClassName={isEmpty ? "" : bucket.colour}
    />
  )
}
