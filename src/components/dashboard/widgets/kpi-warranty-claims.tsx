import Link from "next/link"
import { RiShieldCheckLine } from "@remixicon/react"

import { KpiCard } from "@/components/dashboard/kpi-card"
import type { WarrantyClaim } from "@/lib/types"

interface Props {
  claims: WarrantyClaim[]
}

export function KpiWarrantyClaims({ claims }: Props) {
  const open = claims.filter((c) => c.status === "open")
  const isEmpty = open.length === 0
  return (
    <KpiCard
      title="Open Warranty Claims"
      icon={RiShieldCheckLine}
      value={`${open.length}`}
      hint={isEmpty ? "No open claims" : "awaiting resolution"}
      action={
        isEmpty ? (
          <Link
            href="/warranties"
            className="font-medium text-primary hover:underline"
          >
            View warranties →
          </Link>
        ) : null
      }
    />
  )
}
