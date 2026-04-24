import type { ActivityLogEntry } from "../types"
import { activityStore, filterByCompany, simulateLatency } from "./shared"

export const activityService = {
  async list(companyId: string, limit = 50): Promise<ActivityLogEntry[]> {
    // TODO: Replace with Supabase query ordered by created_at desc
    const rows = filterByCompany(activityStore, companyId)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
    return simulateLatency(rows)
  },
}
