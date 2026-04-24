import { mockNotifications } from "../mock-data"
import type { Notification } from "../types"
import { filterByCompany, simulateLatency } from "./shared"

const store: Notification[] = [...mockNotifications]

export const notificationsService = {
  async listForUser(companyId: string, userId: string): Promise<Notification[]> {
    // TODO: Replace with Supabase query filtered by company_id + user_id
    const rows = filterByCompany(store, companyId)
      .filter((n) => n.userId === userId)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return simulateLatency(rows)
  },

  async markRead(id: string): Promise<boolean> {
    // TODO: Replace with Supabase update
    const idx = store.findIndex((n) => n.id === id)
    if (idx === -1) return simulateLatency(false)
    store[idx] = { ...store[idx], read: true }
    return simulateLatency(true)
  },

  async markAllRead(companyId: string, userId: string): Promise<number> {
    // TODO: Replace with Supabase bulk update
    let n = 0
    store.forEach((row, idx) => {
      if (row.companyId === companyId && row.userId === userId && !row.read) {
        store[idx] = { ...row, read: true }
        n++
      }
    })
    return simulateLatency(n)
  },
}
