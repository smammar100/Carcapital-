import { mockInvoices } from "../mock-data"
import type { Invoice, InvoiceType } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

export const invoiceService = {
  async list(ctx: ActorCtx, type?: InvoiceType): Promise<Invoice[]> {
    // TODO: Replace with Supabase query (optionally filtered by type)
    const rows = filterByCompany(mockInvoices, ctx.companyId)
    return simulateLatency(type ? rows.filter((i) => i.type === type) : rows)
  },

  async getById(ctx: ActorCtx, id: string): Promise<Invoice | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(
      mockInvoices.find((i) => i.id === id && i.companyId === ctx.companyId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<Invoice, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<Invoice> {
    // TODO: Replace with Supabase insert
    const row: Invoice = {
      ...input,
      id: generateId("inv"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockInvoices.unshift(row)
    if (row.status !== "draft") {
      pushActivity({
        companyId: ctx.companyId,
        userId: ctx.userId,
        userName: ctx.userName,
        actionType: "invoice_issued",
        entity: "invoice",
        entityId: row.id,
        summary: `${row.type === "sale" ? "Sale" : "Purchase"} invoice ${row.number} issued`,
      })
    }
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<Invoice>,
  ): Promise<Invoice | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockInvoices.findIndex(
      (i) => i.id === id && i.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    const wasDraft = mockInvoices[idx].status === "draft"
    mockInvoices[idx] = { ...mockInvoices[idx], ...patch, updatedAt: isoNow() }
    const nowIssued = mockInvoices[idx].status !== "draft"
    if (wasDraft && nowIssued) {
      pushActivity({
        companyId: ctx.companyId,
        userId: ctx.userId,
        userName: ctx.userName,
        actionType: "invoice_issued",
        entity: "invoice",
        entityId: id,
        summary: `Invoice ${mockInvoices[idx].number} issued`,
      })
    }
    return simulateLatency(mockInvoices[idx])
  },

  async delete(ctx: ActorCtx, id: string): Promise<boolean> {
    // TODO: Replace with Supabase delete
    const idx = mockInvoices.findIndex(
      (i) => i.id === id && i.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(false)
    mockInvoices.splice(idx, 1)
    return simulateLatency(true)
  },
}
