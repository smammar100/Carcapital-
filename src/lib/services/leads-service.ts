import { mockLeads } from "../mock-data"
import type { Lead, LeadStatus } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

export const leadsService = {
  async list(ctx: ActorCtx): Promise<Lead[]> {
    // TODO: Replace with Supabase query filtered by company_id
    return simulateLatency(filterByCompany(mockLeads, ctx.companyId))
  },

  async getById(ctx: ActorCtx, id: string): Promise<Lead | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(
      mockLeads.find((l) => l.id === id && l.companyId === ctx.companyId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<Lead, "id" | "companyId" | "createdAt" | "updatedAt" | "notes"> & {
      notes?: Lead["notes"]
    },
  ): Promise<Lead> {
    // TODO: Replace with Supabase insert
    const row: Lead = {
      ...input,
      notes: input.notes ?? [],
      id: generateId("lead"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockLeads.unshift(row)
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "lead_created",
      entity: "lead",
      entityId: row.id,
      summary: `Created new lead — ${row.customerName}`,
    })
    return simulateLatency(row)
  },

  // Public-site form integration stub (no actor context — system-created).
  async createFromPublicForm(
    companyId: string,
    input: Omit<Lead, "id" | "companyId" | "createdAt" | "updatedAt" | "notes" | "status"> & {
      notes?: Lead["notes"]
    },
  ): Promise<Lead> {
    // TODO: Replace with Supabase insert triggered by public-site enquiry endpoint.
    const row: Lead = {
      ...input,
      notes: input.notes ?? [],
      status: "new",
      id: generateId("lead"),
      companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockLeads.unshift(row)
    pushActivity({
      companyId,
      userId: "system",
      userName: "Public site",
      actionType: "lead_created",
      entity: "lead",
      entityId: row.id,
      summary: `New enquiry from public site — ${row.customerName}`,
    })
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<Lead>,
  ): Promise<Lead | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockLeads.findIndex(
      (l) => l.id === id && l.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    mockLeads[idx] = { ...mockLeads[idx], ...patch, updatedAt: isoNow() }
    return simulateLatency(mockLeads[idx])
  },

  async changeStatus(
    ctx: ActorCtx,
    id: string,
    status: LeadStatus,
  ): Promise<Lead | undefined> {
    // TODO: Replace with Supabase update + status trigger
    const idx = mockLeads.findIndex(
      (l) => l.id === id && l.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    mockLeads[idx] = { ...mockLeads[idx], status, updatedAt: isoNow() }
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "lead_status_changed",
      entity: "lead",
      entityId: id,
      summary: `Moved ${mockLeads[idx].customerName} to ${status}`,
    })
    return simulateLatency(mockLeads[idx])
  },

  async delete(ctx: ActorCtx, id: string): Promise<boolean> {
    // TODO: Replace with Supabase delete
    const idx = mockLeads.findIndex(
      (l) => l.id === id && l.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(false)
    mockLeads.splice(idx, 1)
    return simulateLatency(true)
  },
}
