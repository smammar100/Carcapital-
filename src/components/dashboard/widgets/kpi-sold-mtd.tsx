import { RiShoppingBag3Line } from "@remixicon/react"

import { KpiCard } from "@/components/dashboard/kpi-card"
import type { Vehicle } from "@/lib/types"

interface Props {
  vehicles: Vehicle[]
}

export function KpiSoldMtd({ vehicles }: Props) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const sold = vehicles.filter(
    (v) => v.status === "sold" && new Date(v.updatedAt) >= monthStart,
  )
  const isEmpty = sold.length === 0
  return (
    <KpiCard
      title="Sold This Month"
      icon={RiShoppingBag3Line}
      value={`${sold.length}`}
      hint={isEmpty ? "No sales yet this month" : "vehicles delivered"}
    />
  )
}
