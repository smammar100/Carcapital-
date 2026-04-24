import { mockInspectionChecks } from "../mock-data"
import type { InspectionCheck, InspectionCheckStatus } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

// Per-check inspection model. Each row represents one of the 20 numbered
// checks, keyed by (vehicleId, checkNumber). The list for a vehicle is a
// flat array of up to 20 rows; missing rows mean that check has not been
// performed yet.

export const inspectionsService = {
  async listByVehicle(ctx: ActorCtx, vehicleId: string): Promise<InspectionCheck[]> {
    // TODO: Replace with Supabase query filtered by vehicle_id
    return simulateLatency(
      mockInspectionChecks.filter(
        (c) => c.companyId === ctx.companyId && c.vehicleId === vehicleId,
      ),
    )
  },

  async listAll(ctx: ActorCtx): Promise<InspectionCheck[]> {
    // TODO: Replace with Supabase query
    return simulateLatency(filterByCompany(mockInspectionChecks, ctx.companyId))
  },

  async saveCheck(
    ctx: ActorCtx,
    vehicleId: string,
    checkNumber: number,
    status: InspectionCheckStatus,
    actionRequired?: string,
    notes?: string,
  ): Promise<InspectionCheck> {
    // TODO: Replace with Supabase upsert keyed on (company_id, vehicle_id, check_number)
    const idx = mockInspectionChecks.findIndex(
      (c) =>
        c.companyId === ctx.companyId &&
        c.vehicleId === vehicleId &&
        c.checkNumber === checkNumber,
    )
    if (idx !== -1) {
      mockInspectionChecks[idx] = {
        ...mockInspectionChecks[idx],
        status,
        actionRequired,
        notes,
        inspectorId: ctx.userId,
        inspectorName: ctx.userName,
        updatedAt: isoNow(),
      }
      pushActivity({
        companyId: ctx.companyId,
        userId: ctx.userId,
        userName: ctx.userName,
        actionType: "inspection_check_saved",
        entity: "inspection",
        entityId: mockInspectionChecks[idx].id,
        summary: `Updated inspection check ${checkNumber}`,
      })
      return simulateLatency(mockInspectionChecks[idx])
    }

    const row: InspectionCheck = {
      id: generateId("ic"),
      companyId: ctx.companyId,
      vehicleId,
      checkNumber,
      status,
      actionRequired,
      notes,
      inspectorId: ctx.userId,
      inspectorName: ctx.userName,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockInspectionChecks.unshift(row)
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "inspection_check_saved",
      entity: "inspection",
      entityId: row.id,
      summary: `Recorded inspection check ${checkNumber}`,
    })
    return simulateLatency(row)
  },
}
