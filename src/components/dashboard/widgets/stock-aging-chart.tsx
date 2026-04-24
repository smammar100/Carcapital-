"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { EmptyState } from "@/components/shared/empty-state"
import type { Vehicle } from "@/lib/types"

interface Props {
  vehicles: Vehicle[]
}

const BUCKETS = [
  { label: "0–30", min: 0, max: 30 },
  { label: "30–60", min: 30, max: 60 },
  { label: "60–90", min: 60, max: 90 },
  { label: "90+", min: 90, max: Infinity },
]

export function StockAgingChart({ vehicles }: Props) {
  const inStock = vehicles.filter((v) => v.status !== "sold")
  if (inStock.length === 0) {
    return <EmptyState title="No vehicles in stock yet" />
  }
  const data = BUCKETS.map((b) => ({
    label: b.label,
    count: inStock.filter((v) => v.daysInStock >= b.min && v.daysInStock < b.max).length,
  }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
        <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="count" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
