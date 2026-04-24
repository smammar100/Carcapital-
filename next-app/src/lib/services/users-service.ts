import { mockCompanies, mockUsers } from "../mock-data"
import type { Company, User } from "../types"
import { filterByCompany, simulateLatency } from "./shared"

// NOTE: The arrays imported from mock-data are mutable. Registration-service pushes
// new rows into them so findByEmail/getById see freshly-registered tenants without a reload.
// TODO: When Supabase lands, replace each read with an `.from('users' | 'companies').select(...)` call.

export const usersService = {
  async listAll(): Promise<User[]> {
    // TODO: Replace with Supabase query (admins only should call this)
    return simulateLatency([...mockUsers])
  },

  async list(companyId: string): Promise<User[]> {
    // TODO: Replace with Supabase query filtered by company_id
    return simulateLatency(filterByCompany(mockUsers, companyId))
  },

  async findByEmail(email: string): Promise<User | undefined> {
    // TODO: Replace with Supabase auth lookup
    return simulateLatency(
      mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    )
  },

  async getById(id: string): Promise<User | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(mockUsers.find((u) => u.id === id))
  },

  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockUsers.findIndex((u) => u.id === id)
    if (idx === -1) return simulateLatency(undefined)
    mockUsers[idx] = { ...mockUsers[idx], ...patch, updatedAt: new Date().toISOString() }
    return simulateLatency(mockUsers[idx])
  },
}

export const companiesService = {
  async list(): Promise<Company[]> {
    // TODO: Replace with Supabase query
    return simulateLatency([...mockCompanies])
  },

  async getById(id: string): Promise<Company | undefined> {
    // TODO: Replace with Supabase single-row fetch
    return simulateLatency(mockCompanies.find((c) => c.id === id))
  },

  async update(id: string, patch: Partial<Company>): Promise<Company | undefined> {
    // TODO: Replace with Supabase update
    const idx = mockCompanies.findIndex((c) => c.id === id)
    if (idx === -1) return simulateLatency(undefined)
    mockCompanies[idx] = {
      ...mockCompanies[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    return simulateLatency(mockCompanies[idx])
  },
}
