import type { ActivityLogEntry } from "../types"
import { mockActivityLog } from "../mock-data"
import { schedulePersist } from "../persistence"

const LATENCY_MIN = 300
const LATENCY_MAX = 500

export function simulateLatency<T>(value: T): Promise<T> {
  const delay = LATENCY_MIN + Math.random() * (LATENCY_MAX - LATENCY_MIN)
  return new Promise((resolve) =>
    setTimeout(() => {
      // Every service call is a persistence opportunity. Cheap debounce
      // collapses bursts of mutations into a single localStorage write.
      schedulePersist()
      resolve(value)
    }, delay),
  )
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function isoNow(): string {
  return new Date().toISOString()
}

export const activityStore: ActivityLogEntry[] = mockActivityLog

type ActivityInput = Omit<ActivityLogEntry, "id" | "createdAt">

export function pushActivity(entry: ActivityInput): ActivityLogEntry {
  // TODO: Replace with Supabase insert into activity_log table
  const row: ActivityLogEntry = {
    ...entry,
    id: generateId("act"),
    createdAt: isoNow(),
  }
  activityStore.unshift(row)
  return row
}

export function filterByCompany<T extends { companyId: string }>(
  rows: T[],
  companyId: string,
): T[] {
  return rows.filter((r) => r.companyId === companyId)
}

export interface ActorCtx {
  companyId: string
  userId: string
  userName: string
}
