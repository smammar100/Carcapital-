import { mockListings } from "../mock-data"
import type { Listing } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

export const listingService = {
  async list(ctx: ActorCtx): Promise<Listing[]> {
    // TODO: Replace with Supabase query
    return simulateLatency(filterByCompany(mockListings, ctx.companyId))
  },

  async getById(ctx: ActorCtx, id: string): Promise<Listing | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(
      mockListings.find((l) => l.id === id && l.companyId === ctx.companyId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<Listing, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<Listing> {
    // TODO: Replace with Supabase insert
    const row: Listing = {
      ...input,
      id: generateId("lst"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockListings.unshift(row)
    if (row.status === "active") {
      pushActivity({
        companyId: ctx.companyId,
        userId: ctx.userId,
        userName: ctx.userName,
        actionType: "listing_published",
        entity: "listing",
        entityId: row.id,
        summary: `Listing published on ${row.channel}`,
      })
    }
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<Listing>,
  ): Promise<Listing | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockListings.findIndex(
      (l) => l.id === id && l.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    mockListings[idx] = { ...mockListings[idx], ...patch, updatedAt: isoNow() }
    return simulateLatency(mockListings[idx])
  },

  async delete(ctx: ActorCtx, id: string): Promise<boolean> {
    // TODO: Replace with Supabase delete
    const idx = mockListings.findIndex(
      (l) => l.id === id && l.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(false)
    mockListings.splice(idx, 1)
    return simulateLatency(true)
  },
}
