import Link from "next/link"
import { RiUserStarLine } from "@remixicon/react"

import { KpiCard } from "@/components/dashboard/kpi-card"
import type { Lead } from "@/lib/types"

interface Props {
  leads: Lead[]
}

export function KpiLeads24h({ leads }: Props) {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const fresh = leads.filter((l) => new Date(l.createdAt).getTime() >= cutoff)
  const isEmpty = fresh.length === 0
  return (
    <KpiCard
      title="New Leads (24h)"
      icon={RiUserStarLine}
      value={`${fresh.length}`}
      hint={isEmpty ? "Quiet today" : "in the last day"}
      action={
        isEmpty ? (
          <Link
            href="/leads"
            className="font-medium text-primary hover:underline"
          >
            View leads →
          </Link>
        ) : null
      }
    />
  )
}
