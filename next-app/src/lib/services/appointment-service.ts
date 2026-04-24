import { mockAppointments } from "../mock-data"
import type { Appointment } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

export const appointmentService = {
  async list(ctx: ActorCtx): Promise<Appointment[]> {
    // TODO: Replace with Supabase query
    return simulateLatency(filterByCompany(mockAppointments, ctx.companyId))
  },

  async getById(ctx: ActorCtx, id: string): Promise<Appointment | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(
      mockAppointments.find((a) => a.id === id && a.companyId === ctx.companyId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<Appointment, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<Appointment> {
    // TODO: Replace with Supabase insert. Future: trigger WhatsApp/Email notifications.
    const row: Appointment = {
      ...input,
      id: generateId("apt"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockAppointments.unshift(row)
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "appointment_booked",
      entity: "appointment",
      entityId: row.id,
      summary: `Appointment booked — ${row.customerName}`,
    })
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<Appointment>,
  ): Promise<Appointment | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockAppointments.findIndex(
      (a) => a.id === id && a.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    mockAppointments[idx] = {
      ...mockAppointments[idx],
      ...patch,
      updatedAt: isoNow(),
    }
    return simulateLatency(mockAppointments[idx])
  },

  async delete(ctx: ActorCtx, id: string): Promise<boolean> {
    // TODO: Replace with Supabase delete
    const idx = mockAppointments.findIndex(
      (a) => a.id === id && a.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(false)
    mockAppointments.splice(idx, 1)
    return simulateLatency(true)
  },
}
