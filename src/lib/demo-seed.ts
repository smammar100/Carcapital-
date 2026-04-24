// Demo seed — populates a tenant with 15 Click Dealer vehicles and matching
// leads, vendors, warranties, invoices, todos, appointments, and activity.
//
// Call `loadDemoData(companyId)` to push all rows scoped to the given tenant.
// Call `resetTenant(companyId)` to splice out every row owned by that tenant.
//
// The seed is intentionally realistic: varied statuses, one problem BMW at 314
// days, representative cost breakdowns, ready-to-demo leads and warranties.

import {
  mockActivityLog,
  mockAppointments,
  mockInspectionChecks,
  mockInvoices,
  mockLeads,
  mockListings,
  mockNotifications,
  mockTodos,
  mockUsers,
  mockVehicles,
  mockVendors,
  mockWarranties,
  mockWarrantyClaims,
  mockWorkshopJobs,
} from "./mock-data"
import type {
  ActivityLogEntry,
  Appointment,
  Invoice,
  Lead,
  TodoItem,
  Vehicle,
  Vendor,
  Warranty,
  WarrantyClaim,
  WorkshopJob,
} from "./types"

const isoNow = () => new Date().toISOString()
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()

interface SeedSpec {
  shortId: string
  registration: string
  make: string
  model: string
  variant: string
  year: number
  mileage: number
  fuelType: Vehicle["fuelType"]
  transmission: Vehicle["transmission"]
  colour: string
  bodyType: Vehicle["bodyType"]
  doors: number
  serviceHistory: Vehicle["serviceHistory"]
  purchasePrice: number
  auctionFee: number
  transportCost: number
  adminFee: number
  valetCost: number
  inspectionCost: number
  preparationCost: number
  valueAddition: number
  listPrice: number
  reservePrice: number
  targetMargin: number
  daysInStock: number
  status: Vehicle["status"]
  sourceType: Vehicle["sourceType"]
  auctionHouse?: string
  v5Received: boolean
  motExpiry?: string
  previousOwners: number
  keysCount: number
}

// 15 vehicles — based on Click Dealer sample (spec Appendix A)
const SEED_VEHICLES: SeedSpec[] = [
  { shortId: "001", registration: "LX68 CZK", make: "Audi", model: "A3", variant: "Sport 35 TFSI", year: 2018, mileage: 42500, fuelType: "petrol", transmission: "automatic", colour: "Glacier White", bodyType: "Hatchback", doors: 5, serviceHistory: "full", purchasePrice: 11200, auctionFee: 245, transportCost: 165, adminFee: 95, valetCost: 75, inspectionCost: 60, preparationCost: 380, valueAddition: 520, listPrice: 14995, reservePrice: 13950, targetMargin: 2200, daysInStock: 12, status: "listed", sourceType: "auction", auctionHouse: "BCA", v5Received: true, motExpiry: new Date(Date.now() + 240 * 86400000).toISOString(), previousOwners: 2, keysCount: 2 },
  { shortId: "002", registration: "GK66 6NX", make: "Nissan", model: "Juke", variant: "Tekna DiG-T", year: 2016, mileage: 68200, fuelType: "petrol", transmission: "manual", colour: "Storm Grey", bodyType: "SUV", doors: 5, serviceHistory: "partial", purchasePrice: 6200, auctionFee: 180, transportCost: 140, adminFee: 95, valetCost: 75, inspectionCost: 60, preparationCost: 220, valueAddition: 180, listPrice: 8495, reservePrice: 7950, targetMargin: 1200, daysInStock: 45, status: "ready", sourceType: "auction", auctionHouse: "Manheim", v5Received: true, motExpiry: new Date(Date.now() + 180 * 86400000).toISOString(), previousOwners: 3, keysCount: 2 },
  { shortId: "003", registration: "LJ17 MKA", make: "BMW", model: "2 Series", variant: "220d M Sport", year: 2017, mileage: 89400, fuelType: "diesel", transmission: "automatic", colour: "Alpine White", bodyType: "Coupe", doors: 2, serviceHistory: "full", purchasePrice: 9400, auctionFee: 220, transportCost: 155, adminFee: 95, valetCost: 85, inspectionCost: 80, preparationCost: 1250, valueAddition: 400, listPrice: 13995, reservePrice: 12750, targetMargin: 1800, daysInStock: 314, status: "listed", sourceType: "trade_in", v5Received: true, motExpiry: new Date(Date.now() + 90 * 86400000).toISOString(), previousOwners: 2, keysCount: 2 },
  { shortId: "004", registration: "YD19 RFB", make: "Ford", model: "Focus", variant: "ST-Line 1.0 EcoBoost", year: 2019, mileage: 34100, fuelType: "petrol", transmission: "manual", colour: "Race Red", bodyType: "Hatchback", doors: 5, serviceHistory: "full", purchasePrice: 10200, auctionFee: 210, transportCost: 155, adminFee: 95, valetCost: 75, inspectionCost: 60, preparationCost: 280, valueAddition: 350, listPrice: 13495, reservePrice: 12450, targetMargin: 1800, daysInStock: 8, status: "ready", sourceType: "auction", auctionHouse: "Aston Barclay", v5Received: true, motExpiry: new Date(Date.now() + 300 * 86400000).toISOString(), previousOwners: 1, keysCount: 2 },
  { shortId: "005", registration: "KP65 UKT", make: "Vauxhall", model: "Corsa", variant: "SRi 1.4", year: 2015, mileage: 72500, fuelType: "petrol", transmission: "manual", colour: "Moonstone Grey", bodyType: "Hatchback", doors: 3, serviceHistory: "partial", purchasePrice: 3800, auctionFee: 140, transportCost: 120, adminFee: 95, valetCost: 65, inspectionCost: 50, preparationCost: 180, valueAddition: 120, listPrice: 5495, reservePrice: 4950, targetMargin: 800, daysInStock: 28, status: "listed", sourceType: "auction", auctionHouse: "G3 Remarketing", v5Received: true, motExpiry: new Date(Date.now() + 120 * 86400000).toISOString(), previousOwners: 4, keysCount: 1 },
  { shortId: "006", registration: "MX20 HBV", make: "Mercedes-Benz", model: "A-Class", variant: "A200 AMG Line", year: 2020, mileage: 22300, fuelType: "petrol", transmission: "automatic", colour: "Obsidian Black", bodyType: "Hatchback", doors: 5, serviceHistory: "full", purchasePrice: 16800, auctionFee: 285, transportCost: 175, adminFee: 95, valetCost: 95, inspectionCost: 75, preparationCost: 420, valueAddition: 650, listPrice: 21995, reservePrice: 20250, targetMargin: 2800, daysInStock: 5, status: "being_prepared", sourceType: "auction", auctionHouse: "BCA", v5Received: true, motExpiry: new Date(Date.now() + 340 * 86400000).toISOString(), previousOwners: 1, keysCount: 2 },
  { shortId: "007", registration: "FH18 EOU", make: "Volkswagen", model: "Golf", variant: "GTD 2.0 TDI", year: 2018, mileage: 58700, fuelType: "diesel", transmission: "manual", colour: "Tornado Red", bodyType: "Hatchback", doors: 5, serviceHistory: "full", purchasePrice: 12900, auctionFee: 250, transportCost: 165, adminFee: 95, valetCost: 80, inspectionCost: 65, preparationCost: 340, valueAddition: 380, listPrice: 16495, reservePrice: 15250, targetMargin: 1900, daysInStock: 62, status: "listed", sourceType: "auction", auctionHouse: "Manheim", v5Received: true, motExpiry: new Date(Date.now() + 200 * 86400000).toISOString(), previousOwners: 2, keysCount: 2 },
  { shortId: "008", registration: "RJ21 VWO", make: "Kia", model: "Sportage", variant: "GT-Line 1.6 T-GDi", year: 2021, mileage: 18200, fuelType: "petrol", transmission: "automatic", colour: "Mineral Blue", bodyType: "SUV", doors: 5, serviceHistory: "full", purchasePrice: 17500, auctionFee: 290, transportCost: 180, adminFee: 95, valetCost: 95, inspectionCost: 75, preparationCost: 260, valueAddition: 450, listPrice: 21995, reservePrice: 20450, targetMargin: 2600, daysInStock: 3, status: "inspection_pending", sourceType: "auction", auctionHouse: "BCA", v5Received: false, motExpiry: new Date(Date.now() + 400 * 86400000).toISOString(), previousOwners: 1, keysCount: 2 },
  { shortId: "009", registration: "BT67 CNA", make: "Honda", model: "Civic", variant: "SR 1.0 VTEC", year: 2017, mileage: 52600, fuelType: "petrol", transmission: "manual", colour: "Polished Metal", bodyType: "Hatchback", doors: 5, serviceHistory: "partial", purchasePrice: 8400, auctionFee: 195, transportCost: 150, adminFee: 95, valetCost: 75, inspectionCost: 60, preparationCost: 220, valueAddition: 260, listPrice: 10995, reservePrice: 10150, targetMargin: 1400, daysInStock: 21, status: "listed", sourceType: "private", v5Received: true, motExpiry: new Date(Date.now() + 150 * 86400000).toISOString(), previousOwners: 2, keysCount: 2 },
  { shortId: "010", registration: "WP22 OKL", make: "Toyota", model: "Yaris", variant: "Design Hybrid", year: 2022, mileage: 9800, fuelType: "hybrid", transmission: "automatic", colour: "Silver", bodyType: "Hatchback", doors: 5, serviceHistory: "full", purchasePrice: 14200, auctionFee: 260, transportCost: 165, adminFee: 95, valetCost: 85, inspectionCost: 70, preparationCost: 180, valueAddition: 220, listPrice: 17495, reservePrice: 16450, targetMargin: 1900, daysInStock: 4, status: "inspection_pending", sourceType: "auction", auctionHouse: "Aston Barclay", v5Received: false, motExpiry: new Date(Date.now() + 420 * 86400000).toISOString(), previousOwners: 1, keysCount: 2 },
  { shortId: "011", registration: "HG19 ABZ", make: "Peugeot", model: "3008", variant: "GT Line 1.5 BlueHDi", year: 2019, mileage: 38400, fuelType: "diesel", transmission: "automatic", colour: "Pearl White", bodyType: "SUV", doors: 5, serviceHistory: "full", purchasePrice: 13500, auctionFee: 255, transportCost: 170, adminFee: 95, valetCost: 85, inspectionCost: 65, preparationCost: 310, valueAddition: 340, listPrice: 17495, reservePrice: 16250, targetMargin: 2000, daysInStock: 38, status: "listed", sourceType: "trade_in", v5Received: true, motExpiry: new Date(Date.now() + 260 * 86400000).toISOString(), previousOwners: 2, keysCount: 2 },
  { shortId: "012", registration: "FE16 RVG", make: "Hyundai", model: "Tucson", variant: "SE Connect 1.6 CRDi", year: 2016, mileage: 78300, fuelType: "diesel", transmission: "manual", colour: "Phantom Black", bodyType: "SUV", doors: 5, serviceHistory: "partial", purchasePrice: 7800, auctionFee: 195, transportCost: 155, adminFee: 95, valetCost: 75, inspectionCost: 60, preparationCost: 420, valueAddition: 220, listPrice: 10495, reservePrice: 9650, targetMargin: 1400, daysInStock: 76, status: "listed", sourceType: "auction", auctionHouse: "SMA", v5Received: true, motExpiry: new Date(Date.now() + 130 * 86400000).toISOString(), previousOwners: 3, keysCount: 2 },
  { shortId: "013", registration: "KX23 PTF", make: "MINI", model: "Cooper", variant: "Classic 1.5", year: 2023, mileage: 5400, fuelType: "petrol", transmission: "manual", colour: "Chili Red", bodyType: "Hatchback", doors: 3, serviceHistory: "full", purchasePrice: 15600, auctionFee: 275, transportCost: 165, adminFee: 95, valetCost: 85, inspectionCost: 70, preparationCost: 180, valueAddition: 290, listPrice: 19495, reservePrice: 18250, targetMargin: 2200, daysInStock: 2, status: "received", sourceType: "auction", auctionHouse: "BCA", v5Received: false, motExpiry: new Date(Date.now() + 450 * 86400000).toISOString(), previousOwners: 1, keysCount: 2 },
  { shortId: "014", registration: "SN18 HMK", make: "Land Rover", model: "Discovery Sport", variant: "R-Dynamic SE D180", year: 2018, mileage: 64200, fuelType: "diesel", transmission: "automatic", colour: "Firenze Red", bodyType: "SUV", doors: 5, serviceHistory: "full", purchasePrice: 18200, auctionFee: 295, transportCost: 185, adminFee: 95, valetCost: 95, inspectionCost: 85, preparationCost: 520, valueAddition: 480, listPrice: 22995, reservePrice: 21250, targetMargin: 2800, daysInStock: 18, status: "being_prepared", sourceType: "auction", auctionHouse: "Manheim", v5Received: true, motExpiry: new Date(Date.now() + 210 * 86400000).toISOString(), previousOwners: 2, keysCount: 2 },
  { shortId: "015", registration: "OY20 RXC", make: "Škoda", model: "Octavia", variant: "SE L 1.5 TSI", year: 2020, mileage: 28900, fuelType: "petrol", transmission: "manual", colour: "Lava Blue", bodyType: "Estate", doors: 5, serviceHistory: "full", purchasePrice: 12100, auctionFee: 240, transportCost: 165, adminFee: 95, valetCost: 80, inspectionCost: 65, preparationCost: 260, valueAddition: 320, listPrice: 15495, reservePrice: 14450, targetMargin: 1700, daysInStock: 15, status: "listed", sourceType: "trade_in", v5Received: true, motExpiry: new Date(Date.now() + 280 * 86400000).toISOString(), previousOwners: 1, keysCount: 2 },
]

interface SeedVendorSpec {
  name: string
  kind: Vendor["kind"]
  contactName: string
  phone: string
  email: string
}

const SEED_VENDORS: SeedVendorSpec[] = [
  { name: "South London Motors", kind: "mechanic", contactName: "Dave Ellis", phone: "020 7946 1100", email: "dave@southlondonmotors.co.uk" },
  { name: "Pro Bodyshop Ltd", kind: "bodyshop", contactName: "Kelly Amin", phone: "020 7946 2244", email: "kelly@probodyshop.co.uk" },
  { name: "Fleet Valet Services", kind: "valeter", contactName: "James O'Brien", phone: "020 7946 3355", email: "james@fleetvalet.uk" },
  { name: "Autotyre Express", kind: "tyres", contactName: "Raj Patel", phone: "020 7946 4466", email: "raj@autotyre.uk" },
  { name: "Spark Auto Electrics", kind: "electrical", contactName: "Nikki Tang", phone: "020 7946 5577", email: "nikki@sparkauto.uk" },
  { name: "Carriageway Transport", kind: "transport", contactName: "Tom Beck", phone: "020 7946 6688", email: "tom@carriageway.uk" },
]

function computeCosts(spec: SeedSpec) {
  const baseCost =
    spec.purchasePrice + spec.auctionFee + spec.transportCost + spec.adminFee
  const landedCost = baseCost + spec.valetCost + spec.inspectionCost
  const stockingLoadingFee = 0
  const stockingDailyCharge = 0
  const stockingUnloadingFee = 0
  const expectedStockingDays = spec.daysInStock
  const totalStockingCost =
    stockingLoadingFee +
    stockingDailyCharge * expectedStockingDays +
    stockingUnloadingFee
  const totalPreparationCost = spec.preparationCost + spec.valueAddition
  const allInCost = landedCost + totalStockingCost + totalPreparationCost
  return {
    baseCost,
    landedCost,
    totalStockingCost,
    totalPreparationCost,
    allInCost,
    stockingLoadingFee,
    stockingDailyCharge,
    stockingUnloadingFee,
    expectedStockingDays,
  }
}

// -----------------------------------------------------------------------------
// Load / Reset
// -----------------------------------------------------------------------------

export function loadDemoData(companyId: string): void {
  // Skip if already seeded for this company.
  if (mockVehicles.some((v) => v.companyId === companyId)) return

  const ts = isoNow()

  // Vehicles
  const vehicles: Vehicle[] = SEED_VEHICLES.map((spec) => {
    const costs = computeCosts(spec)
    return {
      id: `veh-${companyId.slice(-6)}-${spec.shortId}`,
      companyId,
      stockId: `CC-${spec.shortId}`,
      vin: `DEMO${spec.registration.replace(/\s+/g, "")}${spec.shortId}`,
      registration: spec.registration,
      make: spec.make,
      model: spec.model,
      variant: spec.variant,
      year: spec.year,
      bodyType: spec.bodyType,
      doors: spec.doors,
      fuelType: spec.fuelType,
      transmission: spec.transmission,
      colour: spec.colour,
      mileage: spec.mileage,
      serviceHistory: spec.serviceHistory,
      v5Received: spec.v5Received,
      motExpiry: spec.motExpiry,
      previousOwners: spec.previousOwners,
      keysCount: spec.keysCount,
      sourceType: spec.sourceType,
      auctionHouse: spec.auctionHouse,
      sourceDate: daysAgo(spec.daysInStock + 1),
      purchasePrice: spec.purchasePrice,
      auctionFee: spec.auctionFee,
      transportCost: spec.transportCost,
      vatOnPurchase: 0,
      adminFee: spec.adminFee,
      inspectionCost: spec.inspectionCost,
      valetCost: spec.valetCost,
      financeProvider: undefined,
      ...costs,
      preparationCost: spec.preparationCost,
      valueAddition: spec.valueAddition,
      listPrice: spec.listPrice,
      reservePrice: spec.reservePrice,
      targetMargin: spec.targetMargin,
      status: spec.status,
      daysInStock: spec.daysInStock,
      location: "Main forecourt",
      photos: [],
      createdAt: daysAgo(spec.daysInStock),
      updatedAt: ts,
    }
  })
  mockVehicles.push(...vehicles)

  // Vendors
  const vendors: Vendor[] = SEED_VENDORS.map((v, i) => ({
    id: `vnd-${companyId.slice(-6)}-${String(i + 1).padStart(3, "0")}`,
    companyId,
    name: v.name,
    kind: v.kind,
    contactName: v.contactName,
    phone: v.phone,
    email: v.email,
    createdAt: daysAgo(30 - i),
    updatedAt: ts,
  }))
  mockVendors.push(...vendors)

  // Leads (6 demo leads)
  const leadsData: Array<Partial<Lead> & { customerName: string; phone: string; status: Lead["status"] }> = [
    { customerName: "Oliver Brown", phone: "07700 900301", email: "oliver.brown@example.com", status: "new", source: "website", budget: 12000 },
    { customerName: "Harper Wilson", phone: "07700 900302", email: "harper@example.com", status: "contacted", source: "autotrader", budget: 15000, vehicleId: vehicles[3].id },
    { customerName: "Ethan Clarke", phone: "07700 900303", email: "ethan.c@example.com", status: "qualified", source: "phone", budget: 20000, vehicleId: vehicles[5].id },
    { customerName: "Ava Thompson", phone: "07700 900304", email: "ava.t@example.com", status: "appointment_booked", source: "walk_in", budget: 18000, vehicleId: vehicles[0].id },
    { customerName: "Leo Bennett", phone: "07700 900305", status: "contacted", source: "facebook", budget: 9000, vehicleId: vehicles[1].id },
    { customerName: "Mia Coleman", phone: "07700 900306", email: "mia@example.com", status: "lost", source: "autotrader", budget: 10000, lostReason: "Chose a competitor" },
  ]
  const leads: Lead[] = leadsData.map((l, i) => ({
    id: `lead-${companyId.slice(-6)}-${String(i + 1).padStart(3, "0")}`,
    companyId,
    customerName: l.customerName,
    email: l.email,
    phone: l.phone,
    source: l.source ?? "website",
    status: l.status,
    assignedTo: undefined,
    vehicleId: l.vehicleId,
    budget: l.budget,
    notes: [],
    lostReason: l.lostReason,
    createdAt: daysAgo((i + 1) * 2),
    updatedAt: ts,
  }))
  mockLeads.push(...leads)

  // One appointment (from "Ava Thompson" lead)
  const avaLead = leads.find((l) => l.customerName === "Ava Thompson")
  if (avaLead) {
    const appt: Appointment = {
      id: `apt-${companyId.slice(-6)}-001`,
      companyId,
      leadId: avaLead.id,
      vehicleId: avaLead.vehicleId,
      customerName: avaLead.customerName,
      customerPhone: avaLead.phone,
      kind: "test_drive",
      status: "scheduled",
      scheduledFor: new Date(Date.now() + 2 * 86400000).toISOString(),
      durationMins: 30,
      remindersSent: ["whatsapp"],
      createdAt: daysAgo(1),
      updatedAt: ts,
    }
    mockAppointments.push(appt)
  }

  // Todos for the problem BMW (vehicles[2])
  const bmw = vehicles[2]
  const bmwTodos: TodoItem[] = [
    {
      id: `todo-${companyId.slice(-6)}-001`,
      companyId,
      vehicleId: bmw.id,
      title: "Clutch replacement",
      description: "Clutch biting point too high — replace assembly.",
      status: "in_progress",
      assignedVendorId: vendors[0].id,
      estimatedCost: 950,
      actualCost: undefined,
      createdBy: "system",
      createdByName: "Demo",
      createdAt: daysAgo(20),
      updatedAt: ts,
    },
    {
      id: `todo-${companyId.slice(-6)}-002`,
      companyId,
      vehicleId: bmw.id,
      title: "Rear tyre pair",
      description: "Tread below 3mm on both rears.",
      status: "done",
      assignedVendorId: vendors[3].id,
      estimatedCost: 320,
      actualCost: 305,
      completedAt: daysAgo(10),
      createdBy: "system",
      createdByName: "Demo",
      createdAt: daysAgo(25),
      updatedAt: ts,
    },
  ]
  mockTodos.push(...bmwTodos)

  // Workshop job — internal clutch work for BMW
  const bmwJob: WorkshopJob = {
    id: `ws-${companyId.slice(-6)}-001`,
    companyId,
    jobType: "internal",
    vehicleId: bmw.id,
    description: "Clutch replacement per arrival inspection",
    scheduledFor: daysAgo(5),
    cost: 950,
    status: "in_progress",
    createdAt: daysAgo(12),
    updatedAt: ts,
  }
  mockWorkshopJobs.push(bmwJob)

  // One external walk-in workshop job
  const walkin: WorkshopJob = {
    id: `ws-${companyId.slice(-6)}-002`,
    companyId,
    jobType: "external",
    customerName: "Noah Walker",
    customerPhone: "07700 900777",
    registration: "LP15 JKL",
    description: "Full service + MOT prep",
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    cost: 320,
    status: "scheduled",
    createdAt: daysAgo(2),
    updatedAt: ts,
  }
  mockWorkshopJobs.push(walkin)

  // Warranty + open claim for the sold (none yet) and one recently-listed
  const warrantyCustomer = leads.find((l) => l.customerName === "Ava Thompson")
  if (warrantyCustomer) {
    const warranty: Warranty = {
      id: `war-${companyId.slice(-6)}-001`,
      companyId,
      vehicleId: vehicles[0].id,
      customerName: warrantyCustomer.customerName,
      provider: "in_house",
      startAt: daysAgo(30),
      endAt: new Date(Date.now() + 335 * 86400000).toISOString(),
      coverageSummary: "12 months drivetrain cover",
      status: "active",
      createdAt: daysAgo(30),
      updatedAt: ts,
    }
    mockWarranties.push(warranty)

    const claim: WarrantyClaim = {
      id: `wcl-${companyId.slice(-6)}-001`,
      companyId,
      warrantyId: warranty.id,
      vehicleId: vehicles[0].id,
      customerName: warranty.customerName,
      reportedAt: daysAgo(3),
      description: "Intermittent infotainment freeze after cold start",
      isComplaint: false,
      status: "open",
      createdAt: daysAgo(3),
      updatedAt: ts,
    }
    mockWarrantyClaims.push(claim)
  }

  // One purchase invoice (for BMW) + one sale invoice draft
  const bmwCosts = computeCosts(SEED_VEHICLES[2])
  const purchaseInvoice: Invoice = {
    id: `inv-${companyId.slice(-6)}-001`,
    companyId,
    type: "purchase",
    number: "P-00001",
    vehicleId: bmw.id,
    buyerName: "Trade vendor",
    issueDate: daysAgo(bmw.daysInStock),
    lineItems: [
      { id: "li-1", description: "Vehicle purchase", quantity: 1, unitPrice: SEED_VEHICLES[2].purchasePrice, vatRate: 0, total: SEED_VEHICLES[2].purchasePrice },
      { id: "li-2", description: "Auction fee", quantity: 1, unitPrice: SEED_VEHICLES[2].auctionFee, vatRate: 20, total: SEED_VEHICLES[2].auctionFee * 1.2 },
      { id: "li-3", description: "Transport", quantity: 1, unitPrice: SEED_VEHICLES[2].transportCost, vatRate: 20, total: SEED_VEHICLES[2].transportCost * 1.2 },
    ],
    customFields: [],
    subtotal: bmwCosts.baseCost,
    vatTotal: Math.round((SEED_VEHICLES[2].auctionFee + SEED_VEHICLES[2].transportCost) * 0.2),
    total: bmwCosts.baseCost + Math.round((SEED_VEHICLES[2].auctionFee + SEED_VEHICLES[2].transportCost) * 0.2),
    amountPaid: bmwCosts.baseCost,
    balance: 0,
    status: "paid",
    createdAt: daysAgo(bmw.daysInStock),
    updatedAt: ts,
  }
  mockInvoices.push(purchaseInvoice)

  // Inspection checks for the problem BMW — all 20 items scored
  for (let i = 1; i <= 20; i++) {
    mockInspectionChecks.push({
      id: `ic-${companyId.slice(-6)}-${String(i).padStart(3, "0")}`,
      companyId,
      vehicleId: bmw.id,
      checkNumber: i,
      status: i === 12 ? "fail" : i === 3 ? "attention" : "ok",
      actionRequired: i === 12 ? "Replace clutch assembly" : i === 3 ? "Replace rear tyres" : undefined,
      inspectorId: "system",
      inspectorName: "Demo",
      createdAt: daysAgo(bmw.daysInStock - 1),
      updatedAt: ts,
    })
  }

  // Listings — one active per listed vehicle (demo uses only first 3 listed)
  const listedVehicles = vehicles.filter((v) => v.status === "listed").slice(0, 3)
  for (let i = 0; i < listedVehicles.length; i++) {
    const v = listedVehicles[i]
    mockListings.push({
      id: `lst-${companyId.slice(-6)}-${String(i + 1).padStart(3, "0")}`,
      companyId,
      vehicleId: v.id,
      channel: i === 0 ? "autotrader" : i === 1 ? "website" : "facebook",
      status: "active",
      title: `${v.year} ${v.make} ${v.model} ${v.variant ?? ""}`.trim(),
      description: `${v.mileage.toLocaleString()} miles · ${v.fuelType} · ${v.transmission}`,
      askingPrice: v.listPrice,
      publishedAt: daysAgo(v.daysInStock),
      createdAt: daysAgo(v.daysInStock + 1),
      updatedAt: ts,
    })
  }

  // Activity feed — a representative spread
  const activity: Array<Omit<ActivityLogEntry, "id" | "createdAt">> = [
    { companyId, userId: "system", userName: "Demo", actionType: "vehicle_created", entity: "vehicle", entityId: vehicles[0].id, summary: `Added ${vehicles[0].make} ${vehicles[0].model} to stock` },
    { companyId, userId: "system", userName: "Demo", actionType: "vehicle_created", entity: "vehicle", entityId: vehicles[1].id, summary: `Added ${vehicles[1].make} ${vehicles[1].model} to stock` },
    { companyId, userId: "system", userName: "Demo", actionType: "inspection_check_saved", entity: "inspection", entityId: bmw.id, summary: `Completed 20-point inspection on ${bmw.make} ${bmw.model}` },
    { companyId, userId: "system", userName: "Demo", actionType: "todo_created", entity: "todo", entityId: bmwTodos[0].id, summary: "Todo created — Clutch replacement" },
    { companyId, userId: "system", userName: "Demo", actionType: "workshop_job_created", entity: "workshop_job", entityId: bmwJob.id, summary: "Internal job booked — clutch replacement" },
    { companyId, userId: "system", userName: "Demo", actionType: "lead_created", entity: "lead", entityId: leads[0].id, summary: `New lead from website — ${leads[0].customerName}` },
    { companyId, userId: "system", userName: "Demo", actionType: "lead_status_changed", entity: "lead", entityId: leads[2].id, summary: `Lead moved to Qualified — ${leads[2].customerName}` },
    { companyId, userId: "system", userName: "Demo", actionType: "appointment_booked", entity: "appointment", entityId: `apt-${companyId.slice(-6)}-001`, summary: "Test drive booked — Ava Thompson" },
    { companyId, userId: "system", userName: "Demo", actionType: "listing_published", entity: "listing", entityId: `lst-${companyId.slice(-6)}-001`, summary: `Listed ${listedVehicles[0]?.make ?? ""} ${listedVehicles[0]?.model ?? ""} on AutoTrader` },
    { companyId, userId: "system", userName: "Demo", actionType: "warranty_claim_filed", entity: "warranty_claim", entityId: `wcl-${companyId.slice(-6)}-001`, summary: "Warranty claim opened — Ava Thompson" },
  ]
  const now = Date.now()
  activity.forEach((a, i) => {
    mockActivityLog.unshift({
      ...a,
      id: `act-${companyId.slice(-6)}-${String(i + 1).padStart(3, "0")}`,
      createdAt: new Date(now - i * 3600000).toISOString(),
    })
  })

  // Notifications — addressed to the first user of this tenant, if any.
  const primaryUser = mockUsers.find((u) => u.companyId === companyId)
  if (primaryUser) {
    const notifications = [
      {
        type: "lead_assigned" as const,
        title: `New lead — ${leads[0].customerName}`,
        body: `${leads[0].customerName} enquired about the ${vehicles[1].make} ${vehicles[1].model}`,
        link: `/leads/${leads[0].id}`,
        minutesAgo: 12,
      },
      {
        type: "stock_aged" as const,
        title: "Stock ageing — 314 days",
        body: `${bmw.make} ${bmw.model} has been in stock for ${bmw.daysInStock} days`,
        link: `/inventory/${bmw.id}`,
        minutesAgo: 120,
      },
      {
        type: "warranty_claim" as const,
        title: "Warranty claim opened",
        body: "A claim has been filed — review required",
        link: "/warranties",
        minutesAgo: 360,
      },
    ]
    notifications.forEach((n, i) => {
      mockNotifications.unshift({
        id: `ntf-${companyId.slice(-6)}-${String(i + 1).padStart(3, "0")}`,
        companyId,
        userId: primaryUser.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        read: false,
        createdAt: new Date(now - n.minutesAgo * 60000).toISOString(),
      })
    })
  }
}

export function resetTenant(companyId: string): void {
  const stores: { arr: { companyId: string }[] }[] = [
    { arr: mockVehicles },
    { arr: mockInspectionChecks },
    { arr: mockTodos },
    { arr: mockVendors },
    { arr: mockListings },
    { arr: mockLeads },
    { arr: mockAppointments },
    { arr: mockWorkshopJobs },
    { arr: mockWarranties },
    { arr: mockWarrantyClaims },
    { arr: mockInvoices },
    { arr: mockNotifications },
    { arr: mockActivityLog },
  ]
  for (const { arr } of stores) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].companyId === companyId) arr.splice(i, 1)
    }
  }
}
