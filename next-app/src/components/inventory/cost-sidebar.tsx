"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/utils/format"

export interface CostInputs {
  purchasePrice: number
  auctionFee: number
  transportCost: number
  adminFee: number
  inspectionCost: number
  valetCost: number
  vatOnPurchase: number
  stockingLoadingFee: number
  stockingDailyCharge: number
  stockingUnloadingFee: number
  expectedStockingDays: number
  preparationCost: number
  valueAddition: number
  listPrice: number
}

export interface DerivedCosts {
  baseCost: number
  landedCost: number
  totalStockingCost: number
  totalPreparationCost: number
  allInCost: number
  expectedMargin: number
  marginPct: number
}

export function deriveCosts(input: CostInputs): DerivedCosts {
  const baseCost =
    input.purchasePrice + input.auctionFee + input.transportCost + input.adminFee
  const landedCost = baseCost + input.valetCost + input.inspectionCost + input.vatOnPurchase
  const totalStockingCost =
    input.stockingLoadingFee +
    input.stockingDailyCharge * input.expectedStockingDays +
    input.stockingUnloadingFee
  const totalPreparationCost = input.preparationCost + input.valueAddition
  const allInCost = landedCost + totalStockingCost + totalPreparationCost
  const expectedMargin = input.listPrice - allInCost
  const marginPct = input.listPrice > 0 ? (expectedMargin / input.listPrice) * 100 : 0
  return {
    baseCost,
    landedCost,
    totalStockingCost,
    totalPreparationCost,
    allInCost,
    expectedMargin,
    marginPct,
  }
}

interface CostSidebarProps {
  inputs: CostInputs
}

export function CostSidebar({ inputs }: CostSidebarProps) {
  const d = deriveCosts(inputs)
  const marginColour =
    d.expectedMargin >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400"

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-base">Cost preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <Row label="Base cost" value={d.baseCost} />
        <Row label="Landed cost" value={d.landedCost} />
        <Row label="Stocking" value={d.totalStockingCost} />
        <Row label="Prep + add-ons" value={d.totalPreparationCost} />
        <div className="h-px bg-border" />
        <Row label="All-in cost" value={d.allInCost} bold />
        <Row label="List price" value={inputs.listPrice} />
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <span>Expected margin</span>
          <span className={`font-semibold ${marginColour}`}>
            {formatMoney(d.expectedMargin)} · {d.marginPct.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{formatMoney(value)}</span>
    </div>
  )
}
