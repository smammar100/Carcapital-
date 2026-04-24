// Mock-data persistence layer.
//
// The mock store is in-memory — every mutable array in `mock-data.ts` resets
// to empty on a full page reload unless we persist it. This module serialises
// each store to `localStorage` and hydrates it back on init so a registered
// dealership, its demo data, and every subsequent mutation survive refreshes.
//
// This is a demo-mode bridge. When we swap in Supabase, persistence goes away
// and this module is deleted.

import {
  mockActivityLog,
  mockAppointments,
  mockCompanies,
  mockInspectionChecks,
  mockInvoices,
  mockLeads,
  mockListings,
  mockNotifications,
  mockPendingInvites,
  mockTodos,
  mockUsers,
  mockVehicles,
  mockVendors,
  mockWarranties,
  mockWarrantyClaims,
  mockWorkshopJobs,
} from "./mock-data"

const KEY_PREFIX = "cc-uk-mock::"

// Built lazily on first call so we don't read imports that might still be in
// their ESM temporal dead zone (mock-data may be mid-initialisation when this
// module first loads, depending on import graph ordering).
function getStores(): Array<readonly [string, unknown[]]> {
  return [
    ["companies", mockCompanies],
    ["users", mockUsers],
    ["pendingInvites", mockPendingInvites],
    ["vehicles", mockVehicles],
    ["inspectionChecks", mockInspectionChecks],
    ["todos", mockTodos],
    ["vendors", mockVendors],
    ["listings", mockListings],
    ["leads", mockLeads],
    ["appointments", mockAppointments],
    ["workshopJobs", mockWorkshopJobs],
    ["warranties", mockWarranties],
    ["warrantyClaims", mockWarrantyClaims],
    ["invoices", mockInvoices],
    ["notifications", mockNotifications],
    ["activityLog", mockActivityLog],
  ]
}

let hydrated = false
let persistTimer: ReturnType<typeof setTimeout> | null = null

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

/**
 * Read every store from localStorage and splice its contents into the in-memory
 * mutable array. Idempotent; safe to call multiple times.
 */
export function hydrate(): void {
  if (hydrated || !isBrowser()) return
  hydrated = true
  for (const [name, store] of getStores()) {
    try {
      const raw = window.localStorage.getItem(KEY_PREFIX + name)
      if (!raw) continue
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) continue
      // Splice in-place so every module holding a reference sees the data.
      store.splice(0, store.length, ...parsed)
    } catch (err) {
      console.warn(`[persistence] failed to hydrate ${name}`, err)
    }
  }
}

/** Synchronously write every store to localStorage. */
export function persistAllSync(): void {
  if (!isBrowser()) return
  for (const [name, store] of getStores()) {
    try {
      window.localStorage.setItem(KEY_PREFIX + name, JSON.stringify(store))
    } catch (err) {
      console.warn(`[persistence] failed to persist ${name}`, err)
    }
  }
}

/**
 * Schedule a debounced persist. Cheap to call on every service invocation —
 * collapses bursts of mutations into a single localStorage write.
 */
export function schedulePersist(): void {
  if (!isBrowser()) return
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    persistAllSync()
  }, 150)
}

/** Wipe every mock store from localStorage. Used by the global reset path. */
export function clearPersistedData(): void {
  if (!isBrowser()) return
  for (const [name] of getStores()) {
    window.localStorage.removeItem(KEY_PREFIX + name)
  }
}
