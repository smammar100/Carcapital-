"use client"

import { formatDistanceToNow } from "date-fns"
import {
  RiAddLine,
  RiArrowRightLine,
  RiCheckLine,
  RiEditLine,
  RiLoginCircleLine,
  RiShieldCheckLine,
  RiShoppingBag3Line,
  RiToolsLine,
  RiUserStarLine,
} from "@remixicon/react"
import type { ComponentType } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ActivityActionType, ActivityLogEntry } from "@/lib/types"

interface Props {
  entries: ActivityLogEntry[]
}

const ICONS: Record<ActivityActionType, ComponentType<{ className?: string }>> = {
  vehicle_created: RiAddLine,
  vehicle_updated: RiEditLine,
  vehicle_status_changed: RiArrowRightLine,
  inspection_check_saved: RiCheckLine,
  todo_created: RiAddLine,
  todo_completed: RiCheckLine,
  listing_published: RiArrowRightLine,
  lead_created: RiUserStarLine,
  lead_status_changed: RiArrowRightLine,
  appointment_booked: RiUserStarLine,
  workshop_job_created: RiToolsLine,
  workshop_job_completed: RiCheckLine,
  invoice_issued: RiShoppingBag3Line,
  warranty_created: RiShieldCheckLine,
  warranty_claim_filed: RiShieldCheckLine,
  auth_login: RiLoginCircleLine,
}

export function RecentActivity({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="Activity will show up as you use the platform"
        description="Every vehicle, lead, inspection, and invoice change lands here."
      />
    )
  }
  const recent = entries.slice(0, 10)
  return (
    <ScrollArea className="h-[24rem] pr-3">
      <ol className="space-y-3">
        {recent.map((entry) => {
          const Icon = ICONS[entry.actionType] ?? RiEditLine
          return (
            <li key={entry.id} className="flex gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-medium">{entry.userName}</span>{" "}
                  <span className="text-muted-foreground">{entry.summary}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </ScrollArea>
  )
}
