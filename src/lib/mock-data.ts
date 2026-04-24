// Empty-first mock store.
//
// Every array starts empty. Tenants are created via `registrationService.create`,
// which pushes into `mockCompanies` + `mockUsers`. From there, all domain entities
// (vehicles, leads, todos, vendors, inspection checks, listings, appointments,
// workshop jobs, warranties, invoices) are populated exclusively through service
// calls made by the registered user.
//
// The `demo-seed.ts` module on top of this can bulk-load a realistic Click Dealer
// dataset into any company. `resetTenant()` in the same module splices out every
// row scoped to that `companyId`.

import type {
  ActivityLogEntry,
  Appointment,
  Company,
  InspectionCheck,
  Invoice,
  Lead,
  Listing,
  Notification,
  PendingInvite,
  TodoItem,
  User,
  Vehicle,
  Vendor,
  Warranty,
  WarrantyClaim,
  WorkshopJob,
} from "./types"

export const mockCompanies: Company[] = []
export const mockUsers: User[] = []
export const mockPendingInvites: PendingInvite[] = []

export const mockVehicles: Vehicle[] = []
export const mockInspectionChecks: InspectionCheck[] = []
export const mockTodos: TodoItem[] = []
export const mockVendors: Vendor[] = []
export const mockListings: Listing[] = []

export const mockLeads: Lead[] = []
export const mockAppointments: Appointment[] = []

export const mockWorkshopJobs: WorkshopJob[] = []

export const mockWarranties: Warranty[] = []
export const mockWarrantyClaims: WarrantyClaim[] = []

export const mockInvoices: Invoice[] = []

export const mockNotifications: Notification[] = []
export const mockActivityLog: ActivityLogEntry[] = []

// Hydrate every store from localStorage on module init so a registered tenant,
// its demo data, and every mutation survive page reloads. This import is a
// circular edge (persistence imports every array declared above) but is safe
// because persistence only captures array references inside a function body —
// no TDZ access until hydrate() is called below.
import { hydrate as hydrateMockStores } from "./persistence"
if (typeof window !== "undefined") {
  hydrateMockStores()
}
