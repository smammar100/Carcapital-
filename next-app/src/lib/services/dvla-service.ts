import type { FuelType, TransmissionType } from "../types"

export interface DvlaLookupResult {
  registration: string
  make: string
  model: string
  variant?: string
  year: number
  fuelType: FuelType
  transmission: TransmissionType
  colour: string
}

// Small dictionary of known plates + a generic fallback so the DVLA mock
// behaves predictably against the demo seed (Phase B will consume this).
const KNOWN: Record<string, Omit<DvlaLookupResult, "registration">> = {
  "LX68 CZK": { make: "Audi", model: "A3", variant: "Sport 35 TFSI", year: 2018, fuelType: "petrol", transmission: "automatic", colour: "Glacier White" },
  "GK66 6NX": { make: "Nissan", model: "Juke", variant: "Tekna DiG-T", year: 2016, fuelType: "petrol", transmission: "manual", colour: "Storm Grey" },
  "LJ17 MKA": { make: "BMW", model: "2 Series", variant: "220d M Sport", year: 2017, fuelType: "diesel", transmission: "automatic", colour: "Alpine White" },
}

export const dvlaService = {
  // TODO: Replace with real DVLA API. 1s latency simulates live network call.
  async lookup(rawReg: string): Promise<DvlaLookupResult | null> {
    const reg = rawReg.trim().toUpperCase()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (!reg) return null
    const hit = KNOWN[reg]
    if (hit) return { registration: reg, ...hit }
    // Fallback: deterministic placeholder derived from the plate.
    return {
      registration: reg,
      make: "Ford",
      model: "Focus",
      year: 2019,
      fuelType: "petrol",
      transmission: "manual",
      colour: "Silver",
    }
  },
}
