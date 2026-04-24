import { Badge } from "@/components/ui/badge"
import { LEAD_STATUSES } from "@/lib/constants"
import type { LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_CLASSES: Record<LeadStatus, string> = {
  new: "text-sky-600",
  contacted: "text-indigo-600",
  qualified: "text-violet-600",
  appointment_booked: "text-amber-600",
  lost: "text-muted-foreground",
}

export function LeadStatusBadge({
  status,
  className,
}: {
  status: LeadStatus
  className?: string
}) {
  const label = LEAD_STATUSES.find((s) => s.value === status)?.label ?? status
  return (
    <Badge variant="outline" className={cn(STATUS_CLASSES[status], className)}>
      {label}
    </Badge>
  )
}
