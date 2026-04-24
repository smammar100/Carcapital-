import { mockVehicles } from "../mock-data"
import type { Vehicle, VehicleStatus } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

export const stockService = {
  async list(ctx: ActorCtx): Promise<Vehicle[]> {
    // TODO: Replace with Supabase `.from('vehicles').select().eq('company_id', ctx.companyId)`
    return simulateLatency(filterByCompany(mockVehicles, ctx.companyId))
  },

  async getById(ctx: ActorCtx, id: string): Promise<Vehicle | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(
      mockVehicles.find((v) => v.id === id && v.companyId === ctx.companyId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<Vehicle, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<Vehicle> {
    // TODO: Replace with Supabase insert
    const row: Vehicle = {
      ...input,
      id: generateId("veh"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockVehicles.unshift(row)
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "vehicle_created",
      entity: "vehicle",
      entityId: row.id,
      summary: `Added ${row.make} ${row.model} to stock`,
    })
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<Vehicle>,
  ): Promise<Vehicle | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockVehicles.findIndex(
      (v) => v.id === id && v.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    const prev = mockVehicles[idx]
    mockVehicles[idx] = { ...prev, ...patch, updatedAt: isoNow() }
    if (patch.status && patch.status !== prev.status) {
      pushActivity({
        companyId: ctx.companyId,
        userId: ctx.userId,
        userName: ctx.userName,
        actionType: "vehicle_status_changed",
        entity: "vehicle",
        entityId: id,
        summary: `${prev.make} ${prev.model} → ${patch.status}`,
      })
    } else {
      pushActivity({
        companyId: ctx.companyId,
        userId: ctx.userId,
        userName: ctx.userName,
        actionType: "vehicle_updated",
        entity: "vehicle",
        entityId: id,
        summary: `Updated ${prev.make} ${prev.model}`,
      })
    }
    return simulateLatency(mockVehicles[idx])
  },

  async changeStatus(
    ctx: ActorCtx,
    id: string,
    status: VehicleStatus,
  ): Promise<Vehicle | undefined> {
    return this.update(ctx, id, { status })
  },

  async delete(ctx: ActorCtx, id: string): Promise<boolean> {
    // TODO: Replace with Supabase delete (soft delete preferred)
    const idx = mockVehicles.findIndex(
      (v) => v.id === id && v.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(false)
    mockVehicles.splice(idx, 1)
    return simulateLatency(true)
  },
}
