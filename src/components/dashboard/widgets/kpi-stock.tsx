import Link from "next/link"
import { RiCarLine } from "@remixicon/react"

import { KpiCard } from "@/components/dashboard/kpi-card"
import type { Vehicle } from "@/lib/types"

interface Props {
  vehicles: Vehicle[]
}

export function KpiStock({ vehicles }: Props) {
  const inStock = vehicles.filter((v) => v.status !== "sold")
  const isEmpty = inStock.length === 0
  return (
    <KpiCard
      title="Cars in Stock"
      icon={RiCarLine}
      value={`${inStock.length}`}
      hint={isEmpty ? "No vehicles yet" : `of ${vehicles.length} total`}
      action={
        isEmpty ? (
          <Link
            href="/inventory/new"
            className="font-medium text-primary hover:underline"
          >
            Add your first vehicle →
          </Link>
        ) : null
      }
    />
  )
}
