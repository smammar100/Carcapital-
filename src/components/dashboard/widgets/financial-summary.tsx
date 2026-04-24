import type { Vehicle } from "@/lib/types"

interface Props {
  vehicles: Vehicle[]
}

function formatGbp(value: number): string {
  return `£${Math.round(value).toLocaleString("en-GB")}`
}

export function FinancialSummary({ vehicles }: Props) {
  const inStock = vehicles.filter((v) => v.status !== "sold")
  const isEmpty = inStock.length === 0

  const stockValue = inStock.reduce((sum, v) => sum + v.allInCost, 0)
  const dailyBurn = inStock.reduce(
    (sum, v) => sum + (v.stockingDailyCharge || 0),
    0,
  )
  const estProfit = inStock.reduce(
    (sum, v) => sum + Math.max(0, v.listPrice - v.allInCost),
    0,
  )

  const rows = [
    {
      label: "Total Stock Value (at cost)",
      value: isEmpty ? "£0" : formatGbp(stockValue),
    },
    {
      label: "Daily Stocking Burn",
      value: isEmpty ? "£0" : `${formatGbp(dailyBurn)}/day`,
    },
    {
      label: "Est. Profit if All Sold",
      value: isEmpty ? "£0" : formatGbp(estProfit),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-md border bg-muted/10 px-4 py-3"
        >
          <div className="text-xs text-muted-foreground">{row.label}</div>
          <div className="mt-1 text-lg font-semibold tabular-nums">
            {row.value}
          </div>
          {isEmpty && (
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Add vehicles to start tracking
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
