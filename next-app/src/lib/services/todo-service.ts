import { mockTodos } from "../mock-data"
import type { TodoItem } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

export const todoService = {
  async list(ctx: ActorCtx): Promise<TodoItem[]> {
    // TODO: Replace with Supabase query
    return simulateLatency(filterByCompany(mockTodos, ctx.companyId))
  },

  async listByVehicle(ctx: ActorCtx, vehicleId: string): Promise<TodoItem[]> {
    // TODO: Replace with Supabase query filtered by vehicle_id
    return simulateLatency(
      mockTodos.filter((t) => t.companyId === ctx.companyId && t.vehicleId === vehicleId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<
      TodoItem,
      "id" | "companyId" | "createdAt" | "updatedAt" | "createdBy" | "createdByName"
    >,
  ): Promise<TodoItem> {
    // TODO: Replace with Supabase insert
    const row: TodoItem = {
      ...input,
      id: generateId("todo"),
      companyId: ctx.companyId,
      createdBy: ctx.userId,
      createdByName: ctx.userName,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockTodos.unshift(row)
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "todo_created",
      entity: "todo",
      entityId: row.id,
      summary: `Todo created — ${row.title}`,
    })
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<TodoItem>,
  ): Promise<TodoItem | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockTodos.findIndex((t) => t.id === id && t.companyId === ctx.companyId)
    if (idx === -1) return simulateLatency(undefined)
    const wasDone = mockTodos[idx].status === "done"
    mockTodos[idx] = { ...mockTodos[idx], ...patch, updatedAt: isoNow() }
    const nowDone = mockTodos[idx].status === "done"
    if (!wasDone && nowDone) {
      mockTodos[idx].completedAt = mockTodos[idx].completedAt ?? isoNow()
      pushActivity({
        companyId: ctx.companyId,
        userId: ctx.userId,
        userName: ctx.userName,
        actionType: "todo_completed",
        entity: "todo",
        entityId: id,
        summary: `Todo completed — ${mockTodos[idx].title}`,
      })
    }
    return simulateLatency(mockTodos[idx])
  },

  async delete(ctx: ActorCtx, id: string): Promise<boolean> {
    // TODO: Replace with Supabase delete
    const idx = mockTodos.findIndex((t) => t.id === id && t.companyId === ctx.companyId)
    if (idx === -1) return simulateLatency(false)
    mockTodos.splice(idx, 1)
    return simulateLatency(true)
  },
}
