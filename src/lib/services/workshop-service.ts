import { mockWorkshopJobs } from "../mock-data"
import type { WorkshopJob, WorkshopJobType } from "../types"
import {
  type ActorCtx,
  filterByCompany,
  generateId,
  isoNow,
  pushActivity,
  simulateLatency,
} from "./shared"

export const workshopService = {
  async list(ctx: ActorCtx, jobType?: WorkshopJobType): Promise<WorkshopJob[]> {
    // TODO: Replace with Supabase query (optionally filtered by job_type)
    const rows = filterByCompany(mockWorkshopJobs, ctx.companyId)
    return simulateLatency(jobType ? rows.filter((j) => j.jobType === jobType) : rows)
  },

  async getById(ctx: ActorCtx, id: string): Promise<WorkshopJob | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(
      mockWorkshopJobs.find((j) => j.id === id && j.companyId === ctx.companyId),
    )
  },

  async create(
    ctx: ActorCtx,
    input: Omit<WorkshopJob, "id" | "companyId" | "createdAt" | "updatedAt">,
  ): Promise<WorkshopJob> {
    // TODO: Replace with Supabase insert
    const row: WorkshopJob = {
      ...input,
      id: generateId("ws"),
      companyId: ctx.companyId,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    }
    mockWorkshopJobs.unshift(row)
    pushActivity({
      companyId: ctx.companyId,
      userId: ctx.userId,
      userName: ctx.userName,
      actionType: "workshop_job_created",
      entity: "workshop_job",
      entityId: row.id,
      summary: `${row.jobType === "internal" ? "Internal" : "External"} job booked — ${row.description}`,
    })
    return simulateLatency(row)
  },

  async update(
    ctx: ActorCtx,
    id: string,
    patch: Partial<WorkshopJob>,
  ): Promise<WorkshopJob | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockWorkshopJobs.findIndex(
      (j) => j.id === id && j.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(undefined)
    const wasCompleted = mockWorkshopJobs[idx].status === "completed"
    mockWorkshopJobs[idx] = {
      ...mockWorkshopJobs[idx],
      ...patch,
      updatedAt: isoNow(),
    }
    const nowCompleted = mockWorkshopJobs[idx].status === "completed"
    if (!wasCompleted && nowCompleted) {
      mockWorkshopJobs[idx].completedAt =
        mockWorkshopJobs[idx].completedAt ?? isoNow()
      pushActivity({
        companyId: ctx.companyId,
        userId: ctx.userId,
        userName: ctx.userName,
        actionType: "workshop_job_completed",
        entity: "workshop_job",
        entityId: id,
        summary: `Workshop job completed — ${mockWorkshopJobs[idx].description}`,
      })
    }
    return simulateLatency(mockWorkshopJobs[idx])
  },

  async delete(ctx: ActorCtx, id: string): Promise<boolean> {
    // TODO: Replace with Supabase delete
    const idx = mockWorkshopJobs.findIndex(
      (j) => j.id === id && j.companyId === ctx.companyId,
    )
    if (idx === -1) return simulateLatency(false)
    mockWorkshopJobs.splice(idx, 1)
    return simulateLatency(true)
  },
}
