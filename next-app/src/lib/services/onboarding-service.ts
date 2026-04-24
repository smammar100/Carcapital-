import { mockPendingInvites } from "../mock-data"
import type { Company, PendingInvite, User } from "../types"
import { generateId, isoNow, pushActivity, simulateLatency } from "./shared"
import { companiesService, usersService } from "./users-service"

export interface OnboardingFinishInput {
  company?: Partial<Company>
}

export interface InviteInput {
  email: string
  name: string
}

export const onboardingService = {
  async finish(
    companyId: string,
    userId: string,
    patch: OnboardingFinishInput,
  ): Promise<{ company: Company | undefined; user: User | undefined }> {
    // TODO: Replace with Supabase update on companies + users rows.
    const company = patch.company
      ? await companiesService.update(companyId, patch.company)
      : await companiesService.getById(companyId)

    const user = await usersService.update(userId, { onboardingComplete: true })

    if (user) {
      pushActivity({
        companyId,
        userId,
        userName: user.name,
        actionType: "auth_login",
        entity: "user",
        entityId: userId,
        summary: "Completed onboarding",
      })
    }

    return simulateLatency({ company, user })
  },

  async invite(
    companyId: string,
    actor: { userId: string; userName: string },
    input: InviteInput,
  ): Promise<PendingInvite> {
    // TODO: Replace with Supabase insert into invites table + email dispatch.
    const invite: PendingInvite = {
      id: generateId("inv"),
      companyId,
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      status: "pending",
      invitedBy: actor.userId,
      sentAt: isoNow(),
    }

    mockPendingInvites.push(invite)

    pushActivity({
      companyId,
      userId: actor.userId,
      userName: actor.userName,
      actionType: "auth_login",
      entity: "user",
      entityId: invite.id,
      summary: `Invited ${invite.name} (${invite.email})`,
    })

    return simulateLatency(invite)
  },

  async listInvites(companyId: string): Promise<PendingInvite[]> {
    // TODO: Replace with Supabase query filtered by company_id.
    return simulateLatency(
      mockPendingInvites.filter((i) => i.companyId === companyId),
    )
  },
}
