import { mockVendors } from "../mock-data"
import type { Vendor } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  simulateLatency,
} from "./shared"

export const vendorService = {
  async list(ctx: ActorCtx): Promise<Vendor[]> {
    // TODO: Replace with Supabase `.from('vendors').select().eq('company_id', ctx.companyId)`
    return simulateLatency(filterByCompany(mockVendors, ctx.companyId))
  },

  async getById(ctx: ActorCtx, id: string): Promise<Vendor | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(
      mockVendors.find((v) => v.id === id && v.companyId === ctx.companyId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<Vendor, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<Vendor> {
    // TODO: Replace with Supabase insert
    const row: Vendor = {
      ...input,
      id: generateId("vnd"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockVendors.unshift(row)
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<Vendor>,
  ): Promise<Vendor | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockVendors.findIndex(
      (v) => v.id === id && v.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    mockVendors[idx] = { ...mockVendors[idx], ...patch, updatedAt: isoNow() }
    return simulateLatency(mockVendors[idx])
  },

  async delete(ctx: ActorCtx, id: string): Promise<boolean> {
    // TODO: Replace with Supabase delete (soft delete preferred)
    const idx = mockVendors.findIndex(
      (v) => v.id === id && v.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(false)
    mockVendors.splice(idx, 1)
    return simulateLatency(true)
  },
}
