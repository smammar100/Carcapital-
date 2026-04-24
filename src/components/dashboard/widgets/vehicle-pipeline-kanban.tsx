import Link from "next/link"
import { RiArrowRightLine, RiCarLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { VEHICLE_STATUSES } from "@/lib/constants"
import type { Vehicle } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
  vehicles: Vehicle[]
}

export function VehiclePipelineKanban({ vehicles }: Props) {
  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={RiCarLine}
        title="Your pipeline will appear here once you add vehicles"
        description="Each column tracks a vehicle lifecycle stage from arrival to sale."
        action={
          <Link
            href="/inventory/new"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Add Vehicle <RiArrowRightLine className="size-4" />
          </Link>
        }
      />
    )
  }

  const columns = VEHICLE_STATUSES.map((status) => ({
    ...status,
    items: vehicles.filter((v) => v.status === status.value),
  }))

  return (
    <div className="grid auto-rows-min grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {columns.map((col) => (
        <div
          key={col.value}
          className="flex min-h-[10rem] flex-col rounded-md border bg-muted/10 p-2"
        >
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-xs font-medium">{col.label}</span>
            <Badge variant="outline" className={cn("text-[10px]", col.colour)}>
              {col.items.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {col.items.slice(0, 4).map((v) => (
              <div
                key={v.id}
                className="rounded border bg-background px-2 py-1.5 text-xs"
              >
                <div className="font-medium">
                  {v.make} {v.model}
                </div>
                <div className="text-muted-foreground">
                  {v.registration} · {v.daysInStock}d
                </div>
              </div>
            ))}
            {col.items.length > 4 && (
              <div className="px-2 text-[11px] text-muted-foreground">
                + {col.items.length - 4} more
              </div>
            )}
            {col.items.length === 0 && (
              <div className="px-2 text-[11px] text-muted-foreground">
                No vehicles
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
