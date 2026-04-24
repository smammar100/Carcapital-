import Link from "next/link"
import { RiToolsLine } from "@remixicon/react"

import { EmptyState } from "@/components/shared/empty-state"
import type { WorkshopJob } from "@/lib/types"

interface Props {
  jobs: WorkshopJob[]
}

export function MaintenanceSummary({ jobs }: Props) {
  const now = Date.now()
  const inProgress = jobs.filter(
    (j) => j.status === "in_progress" || j.status === "awaiting_parts",
  )
  const overdue = jobs.filter(
    (j) =>
      j.status !== "completed" &&
      j.status !== "cancelled" &&
      j.scheduledFor &&
      new Date(j.scheduledFor).getTime() < now,
  )
  const upcoming = jobs
    .filter(
      (j) =>
        j.status === "scheduled" &&
        j.scheduledFor &&
        new Date(j.scheduledFor).getTime() >= now,
    )
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
    .slice(0, 3)

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No active jobs yet"
        description="Maintenance and workshop jobs will appear here as they're booked."
        action={
          <Link
            href="/maintenance"
            className="text-sm font-medium text-primary hover:underline"
          >
            Open maintenance →
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="In progress" value={inProgress.length} />
        <Stat
          label="Overdue"
          value={overdue.length}
          tone={overdue.length > 0 ? "warn" : undefined}
        />
      </div>
      <div>
        <div className="text-xs font-medium text-muted-foreground">Upcoming</div>
        {upcoming.length === 0 ? (
          <div className="mt-1 text-xs text-muted-foreground">
            Nothing scheduled.
          </div>
        ) : (
          <ul className="mt-2 space-y-1.5 text-xs">
            {upcoming.map((j) => (
              <li key={j.id} className="flex items-start gap-2">
                <RiToolsLine className="mt-0.5 size-3.5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{j.description}</div>
                  <div className="text-muted-foreground">
                    {new Date(j.scheduledFor).toLocaleDateString("en-GB")} · {j.jobType}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: "warn"
}) {
  return (
    <div className="rounded-md border bg-muted/10 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div
        className={`text-lg font-semibold tabular-nums ${
          tone === "warn" ? "text-amber-600" : ""
        }`}
      >
        {value}
      </div>
    </div>
  )
}
