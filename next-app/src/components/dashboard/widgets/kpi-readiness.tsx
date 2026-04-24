import Link from "next/link"
import { RiToolsLine } from "@remixicon/react"

import { KpiCard } from "@/components/dashboard/kpi-card"
import type { Vehicle } from "@/lib/types"

interface Props {
  vehicles: Vehicle[]
}

export function KpiReadiness({ vehicles }: Props) {
  const prep = vehicles.filter(
    (v) => v.status === "being_prepared" || v.status === "inspection_pending",
  )
  const isEmpty = prep.length === 0
  return (
    <KpiCard
      title="Cars in Readiness"
      icon={RiToolsLine}
      value={`${prep.length}`}
      hint={isEmpty ? "Nothing being prepped" : "being prepared / inspected"}
      action={
        isEmpty ? (
          <Link
            href="/maintenance"
            className="font-medium text-primary hover:underline"
          >
            View maintenance →
          </Link>
        ) : null
      }
    />
  )
}
