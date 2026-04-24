import { mockCompanies, mockUsers } from "../mock-data"
import { persistAllSync } from "../persistence"
import type {
  Company,
  DealershipType,
  MonthlyStockVolume,
  PrimarySourcing,
  User,
} from "../types"
import { generateId, isoNow, pushActivity, simulateLatency } from "./shared"

export interface RegistrationInput {
  account: {
    name: string
    email: string
    phone?: string
    // NOTE: password is collected on the signup form for realism but never persisted.
    // TODO: When Supabase lands, swap this for `supabase.auth.signUp({ email, password })`.
  }
  company: {
    name: string
    address: string
    city: string
    postcode: string
    companyRegistrationNumber?: string
    website?: string
  }
  profile: {
    dealershipType: DealershipType
    monthlyStockVolume: MonthlyStockVolume
    primarySourcing: PrimarySourcing
  }
}

function deriveStockIdPrefix(companyName: string): string {
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
  const base = initials.slice(0, 3) || companyName.slice(0, 2).toUpperCase()
  return `${base}-`
}

export const registrationService = {
  async create(
    input: RegistrationInput,
  ): Promise<{ company: Company; user: User }> {
    // TODO: Replace with Supabase transactional insert into `companies` + `users` tables,
    //       plus supabase.auth.signUp for the credential half.
    const companyId = generateId("cmp")
    const userId = generateId("usr")
    const timestamp = isoNow()

    const company: Company = {
      id: companyId,
      name: input.company.name.trim(),
      address: input.company.address.trim(),
      phone: "",
      email: input.account.email.trim().toLowerCase(),
      city: input.company.city.trim(),
      postcode: input.company.postcode.trim().toUpperCase(),
      companyRegistrationNumber: input.company.companyRegistrationNumber?.trim() || undefined,
      website: input.company.website?.trim() || undefined,
      stockIdPrefix: deriveStockIdPrefix(input.company.name),
      vatRate: 20,
      defaultAppointmentDurationMins: 30,
      dealershipType: input.profile.dealershipType,
      monthlyStockVolume: input.profile.monthlyStockVolume,
      primarySourcing: input.profile.primarySourcing,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const user: User = {
      id: userId,
      companyId,
      name: input.account.name.trim(),
      email: input.account.email.trim().toLowerCase(),
      phone: input.account.phone?.trim() || null,
      onboardingComplete: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    mockCompanies.push(company)
    mockUsers.push(user)
    // Flush synchronously — registration is a critical path; we don't want a
    // refresh in the 150ms debounce window to lose the brand-new tenant.
    persistAllSync()

    pushActivity({
      companyId,
      userId,
      userName: user.name,
      actionType: "auth_login",
      entity: "user",
      entityId: userId,
      summary: `Registered dealership ${company.name}`,
    })

    return simulateLatency({ company, user })
  },
}
