import type { ComponentType, ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  hint?: string
  icon: ComponentType<{ className?: string }>
  trend?: { value: string; positive?: boolean }
  action?: ReactNode
  valueClassName?: string
}

export function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  trend,
  action,
  valueClassName,
}: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-semibold", valueClassName)}>{value}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.positive ? "text-emerald-600" : "text-destructive",
              )}
            >
              {trend.value}
            </span>
          )}
          {hint && <span>{hint}</span>}
        </div>
        {action && <div className="mt-3 text-xs">{action}</div>}
      </CardContent>
    </Card>
  )
}
