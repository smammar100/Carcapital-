import { Badge } from "@/components/ui/badge"
import { VEHICLE_STATUSES } from "@/lib/constants"
import type { VehicleStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function VehicleStatusBadge({
  status,
  className,
}: {
  status: VehicleStatus
  className?: string
}) {
  const entry = VEHICLE_STATUSES.find((s) => s.value === status)
  const label = entry?.label ?? status
  return (
    <Badge variant="outline" className={cn(entry?.colour, className)}>
      {label}
    </Badge>
  )
}
