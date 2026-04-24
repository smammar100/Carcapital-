import { mockWarranties, mockWarrantyClaims } from "../mock-data"
import type { Warranty, WarrantyClaim } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

export const warrantyService = {
  async list(ctx: ActorCtx): Promise<Warranty[]> {
    // TODO: Replace with Supabase query
    return simulateLatency(filterByCompany(mockWarranties, ctx.companyId))
  },

  async getById(ctx: ActorCtx, id: string): Promise<Warranty | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(
      mockWarranties.find((w) => w.id === id && w.companyId === ctx.companyId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<Warranty, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<Warranty> {
    // TODO: Replace with Supabase insert
    const row: Warranty = {
      ...input,
      id: generateId("war"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockWarranties.unshift(row)
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "warranty_created",
      entity: "warranty",
      entityId: row.id,
      summary: `Warranty issued for ${row.customerName}`,
    })
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<Warranty>,
  ): Promise<Warranty | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockWarranties.findIndex(
      (w) => w.id === id && w.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    mockWarranties[idx] = { ...mockWarranties[idx], ...patch, updatedAt: isoNow() }
    return simulateLatency(mockWarranties[idx])
  },
}

export const warrantyClaimService = {
  async list(ctx: ActorCtx): Promise<WarrantyClaim[]> {
    // TODO: Replace with Supabase query
    return simulateLatency(filterByCompany(mockWarrantyClaims, ctx.companyId))
  },

  async listByWarranty(ctx: ActorCtx, warrantyId: string): Promise<WarrantyClaim[]> {
    // TODO: Replace with Supabase query filtered by warranty_id
    return simulateLatency(
      mockWarrantyClaims.filter(
        (c) => c.companyId === ctx.companyId && c.warrantyId === warrantyId,
      ),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<WarrantyClaim, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<WarrantyClaim> {
    // TODO: Replace with Supabase insert
    const row: WarrantyClaim = {
      ...input,
      id: generateId("wcl"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockWarrantyClaims.unshift(row)
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "warranty_claim_filed",
      entity: "warranty_claim",
      entityId: row.id,
      summary: `Warranty claim filed — ${row.customerName}`,
    })
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<WarrantyClaim>,
  ): Promise<WarrantyClaim | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockWarrantyClaims.findIndex(
      (c) => c.id === id && c.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    mockWarrantyClaims[idx] = {
      ...mockWarrantyClaims[idx],
      ...patch,
      updatedAt: isoNow(),
    }
    return simulateLatency(mockWarrantyClaims[idx])
  },
}
