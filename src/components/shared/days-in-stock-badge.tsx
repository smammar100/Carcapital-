import { Badge } from "@/components/ui/badge"
import { DAYS_IN_STOCK_THRESHOLDS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface DaysInStockBadgeProps {
  days: number
  className?: string
}

export function daysInStockBucket(days: number) {
  for (const bucket of DAYS_IN_STOCK_THRESHOLDS) {
    if (days <= bucket.max) return bucket
  }
  return DAYS_IN_STOCK_THRESHOLDS[DAYS_IN_STOCK_THRESHOLDS.length - 1]
}

export function DaysInStockBadge({ days, className }: DaysInStockBadgeProps) {
  const bucket = daysInStockBucket(days)
  return (
    <Badge variant="outline" className={cn(bucket.colour, className)}>
      {days}d · {bucket.label}
    </Badge>
  )
}
