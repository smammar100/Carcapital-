import type {
  AppointmentKind,
  AppointmentStatus,
  BodyType,
  FuelType,
  InspectionCheckStatus,
  InvoiceStatus,
  InvoiceType,
  LeadSource,
  LeadStatus,
  ListingChannel,
  ListingStatus,
  ServiceHistory,
  SourceType,
  TodoStatus,
  TransmissionType,
  VehicleStatus,
  VendorKind,
  WarrantyClaimStatus,
  WarrantyProvider,
  WarrantyStatus,
  WorkshopJobStatus,
  WorkshopJobType,
} from "./types"

export const APP_NAME = "Car Capital UK"

// -----------------------------------------------------------------------------
// Onboarding / profile
// -----------------------------------------------------------------------------

export const DEALERSHIP_TYPES: { value: "independent" | "franchise" | "auction"; label: string }[] = [
  { value: "independent", label: "Independent" },
  { value: "franchise", label: "Franchise" },
  { value: "auction", label: "Auction" },
]

export const MONTHLY_STOCK_VOLUMES: { value: "<10" | "10-25" | "25-50" | "50+"; label: string }[] = [
  { value: "<10", label: "Fewer than 10 cars / month" },
  { value: "10-25", label: "10–25 cars / month" },
  { value: "25-50", label: "25–50 cars / month" },
  { value: "50+", label: "50+ cars / month" },
]

export const PRIMARY_SOURCING: { value: "auction" | "private" | "trade_in" | "mix"; label: string }[] = [
  { value: "auction", label: "Auctions" },
  { value: "private", label: "Private sellers" },
  { value: "trade_in", label: "Trade-ins" },
  { value: "mix", label: "Mix of all three" },
]

// -----------------------------------------------------------------------------
// Vehicle enums
// -----------------------------------------------------------------------------

export const VEHICLE_STATUSES: { value: VehicleStatus; label: string; colour: string }[] = [
  { value: "received", label: "Received", colour: "bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200" },
  { value: "inspection_pending", label: "Inspection pending", colour: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200" },
  { value: "being_prepared", label: "Being prepared", colour: "bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200" },
  { value: "ready", label: "Ready", colour: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200" },
  { value: "listed", label: "Listed", colour: "bg-violet-100 text-violet-900 dark:bg-violet-900/60 dark:text-violet-200" },
  { value: "sold", label: "Sold", colour: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
]

export const DAYS_IN_STOCK_THRESHOLDS: { max: number; label: string; colour: string }[] = [
  { max: 30, label: "Fresh", colour: "text-emerald-600" },
  { max: 60, label: "Ageing", colour: "text-amber-600" },
  { max: 90, label: "Stale", colour: "text-orange-600" },
  { max: Infinity, label: "Problem", colour: "text-red-600" },
]

export const STOCK_AGE_BUCKETS = [
  { label: "0–30d", min: 0, max: 30 },
  { label: "31–60d", min: 31, max: 60 },
  { label: "61–90d", min: 61, max: 90 },
  { label: "90+", min: 91, max: Infinity },
]

export const BODY_TYPES: BodyType[] = [
  "Hatchback",
  "Saloon",
  "Estate",
  "SUV",
  "Coupe",
  "Convertible",
  "MPV",
  "Van",
]

export const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
  { value: "lpg", label: "LPG" },
]

export const TRANSMISSION_TYPES: { value: TransmissionType; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "semi-auto", label: "Semi-auto" },
]

export const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: "auction", label: "Auction" },
  { value: "trade_in", label: "Trade-in" },
  { value: "private", label: "Private sale" },
  { value: "broker", label: "Broker" },
]

export const SERVICE_HISTORY_OPTIONS: { value: ServiceHistory; label: string }[] = [
  { value: "full", label: "Full" },
  { value: "partial", label: "Partial" },
  { value: "none", label: "None" },
  { value: "unknown", label: "Unknown" },
]

export const AUCTION_HOUSES = [
  "BCA",
  "Manheim",
  "Aston Barclay",
  "Copart",
  "G3 Remarketing",
  "SMA",
  "Car Auction Group",
  "Other",
] as const

export const UK_MAKES = [
  "Audi",
  "BMW",
  "Ford",
  "Honda",
  "Hyundai",
  "Jaguar",
  "Kia",
  "Land Rover",
  "Mercedes-Benz",
  "MINI",
  "Nissan",
  "Peugeot",
  "Renault",
  "SEAT",
  "Škoda",
  "Toyota",
  "Vauxhall",
  "Volkswagen",
  "Volvo",
] as const

// -----------------------------------------------------------------------------
// Finance providers (stocking + customer finance)
// -----------------------------------------------------------------------------

export type FinanceProviderKey = "none" | "next_gear" | "close_brothers" | "bca" | "infinit"

export const FINANCE_PROVIDERS: {
  value: FinanceProviderKey
  label: string
  loadingFee: number
  dailyCharge: number
  unloadingFee: number
}[] = [
  { value: "none", label: "None (self-funded)", loadingFee: 0, dailyCharge: 0, unloadingFee: 0 },
  { value: "next_gear", label: "NextGear Capital", loadingFee: 49, dailyCharge: 2.5, unloadingFee: 49 },
  { value: "close_brothers", label: "Close Brothers Motor Finance", loadingFee: 45, dailyCharge: 2.1, unloadingFee: 45 },
  { value: "bca", label: "BCA Partner Finance", loadingFee: 55, dailyCharge: 2.7, unloadingFee: 55 },
  { value: "infinit", label: "Infinit Stock Finance", loadingFee: 50, dailyCharge: 2.3, unloadingFee: 50 },
]

// -----------------------------------------------------------------------------
// 20-point inspection checklist — fixed numbered items with per-item status options
// -----------------------------------------------------------------------------

export interface InspectionItemDef {
  number: number
  label: string
  description: string
  statusOptions: InspectionCheckStatus[]
}

export const INSPECTION_CHECK_STATUSES: { value: InspectionCheckStatus; label: string }[] = [
  { value: "ok", label: "OK" },
  { value: "attention", label: "Needs attention" },
  { value: "fail", label: "Fail" },
  { value: "na", label: "N/A" },
]

const STANDARD_OPTIONS: InspectionCheckStatus[] = ["ok", "attention", "fail", "na"]

export const INSPECTION_ITEMS: InspectionItemDef[] = [
  { number: 1, label: "Bodywork & paint", description: "Panel alignment, paint finish, chips, dents", statusOptions: STANDARD_OPTIONS },
  { number: 2, label: "Glass & mirrors", description: "Windscreen, windows, wing mirrors", statusOptions: STANDARD_OPTIONS },
  { number: 3, label: "Tyres & wheels", description: "Tread depth, sidewall, alloys", statusOptions: STANDARD_OPTIONS },
  { number: 4, label: "Lights & indicators", description: "Head, tail, brake, fog, indicators", statusOptions: STANDARD_OPTIONS },
  { number: 5, label: "Engine start & idle", description: "Cold start, smooth idle, no warning lights", statusOptions: STANDARD_OPTIONS },
  { number: 6, label: "Fluids & leaks", description: "Oil, coolant, brake fluid, steering, no leaks", statusOptions: STANDARD_OPTIONS },
  { number: 7, label: "Belts & hoses", description: "Condition, tension, no cracks", statusOptions: STANDARD_OPTIONS },
  { number: 8, label: "Battery", description: "Voltage, terminals, age", statusOptions: STANDARD_OPTIONS },
  { number: 9, label: "Brakes", description: "Pads, discs, handbrake, pedal feel", statusOptions: STANDARD_OPTIONS },
  { number: 10, label: "Suspension & steering", description: "Bushes, joints, alignment, play", statusOptions: STANDARD_OPTIONS },
  { number: 11, label: "Exhaust system", description: "Mounts, corrosion, emissions", statusOptions: STANDARD_OPTIONS },
  { number: 12, label: "Clutch & gearbox", description: "Engagement, smooth shift, no noise", statusOptions: STANDARD_OPTIONS },
  { number: 13, label: "Seats & upholstery", description: "Wear, tears, stains, adjusters", statusOptions: STANDARD_OPTIONS },
  { number: 14, label: "Dashboard & trim", description: "Condition, warning lights cleared", statusOptions: STANDARD_OPTIONS },
  { number: 15, label: "Climate control", description: "Heating, A/C, blower", statusOptions: STANDARD_OPTIONS },
  { number: 16, label: "Infotainment", description: "Screen, audio, Bluetooth, cameras", statusOptions: STANDARD_OPTIONS },
  { number: 17, label: "Central locking & windows", description: "All doors, boot, fuel cap, windows", statusOptions: STANDARD_OPTIONS },
  { number: 18, label: "Wipers & washers", description: "Front and rear operation, jets", statusOptions: STANDARD_OPTIONS },
  { number: 19, label: "Seatbelts & airbags", description: "Retraction, SRS warning clear", statusOptions: STANDARD_OPTIONS },
  { number: 20, label: "Road test", description: "Acceleration, braking, noise, pull", statusOptions: STANDARD_OPTIONS },
]

// -----------------------------------------------------------------------------
// Todos / Vendors
// -----------------------------------------------------------------------------

export const TODO_STATUSES: { value: TodoStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
]

export const VENDOR_KINDS: { value: VendorKind; label: string }[] = [
  { value: "mechanic", label: "Mechanic" },
  { value: "bodyshop", label: "Body shop" },
  { value: "valeter", label: "Valeter" },
  { value: "tyres", label: "Tyres" },
  { value: "electrical", label: "Electrical" },
  { value: "parts", label: "Parts" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
]

// -----------------------------------------------------------------------------
// Leads / Appointments
// -----------------------------------------------------------------------------

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "appointment_booked", label: "Appointment booked" },
  { value: "lost", label: "Lost" },
]

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: "walk_in", label: "Walk-in" },
  { value: "phone", label: "Phone" },
  { value: "website", label: "Website" },
  { value: "autotrader", label: "AutoTrader" },
  { value: "facebook", label: "Facebook" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
]

export const APPOINTMENT_DURATIONS: { value: number; label: string }[] = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
]

export const APPOINTMENT_KINDS: { value: AppointmentKind; label: string }[] = [
  { value: "test_drive", label: "Test drive" },
  { value: "viewing", label: "Viewing" },
  { value: "collection", label: "Collection" },
  { value: "other", label: "Other" },
]

export const APPOINTMENT_STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
]

// -----------------------------------------------------------------------------
// Workshop
// -----------------------------------------------------------------------------

export const WORKSHOP_JOB_STATUSES: { value: WorkshopJobStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "awaiting_parts", label: "Awaiting parts" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export const WORKSHOP_JOB_TYPES: { value: WorkshopJobType; label: string }[] = [
  { value: "internal", label: "Internal (prep)" },
  { value: "external", label: "External (walk-in)" },
]

// -----------------------------------------------------------------------------
// Warranties
// -----------------------------------------------------------------------------

export const WARRANTY_PROVIDERS: { value: WarrantyProvider; label: string }[] = [
  { value: "in_house", label: "In-house" },
  { value: "third_party", label: "Third-party" },
]

export const WARRANTY_STATUSES: { value: WarrantyStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
]

export const WARRANTY_CLAIM_STATUSES: { value: WarrantyClaimStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "resolved", label: "Resolved" },
]

// -----------------------------------------------------------------------------
// Invoicing
// -----------------------------------------------------------------------------

export const INVOICE_TYPES: { value: InvoiceType; label: string }[] = [
  { value: "purchase", label: "Purchase" },
  { value: "sale", label: "Sale" },
]

export const INVOICE_STATUSES: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "part_paid", label: "Part paid" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
]

// -----------------------------------------------------------------------------
// Listings
// -----------------------------------------------------------------------------

export const LISTING_CHANNELS: { value: ListingChannel; label: string }[] = [
  { value: "autotrader", label: "AutoTrader" },
  { value: "carguru", label: "CarGurus" },
  { value: "facebook", label: "Facebook" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
]

export const LISTING_STATUSES: { value: ListingStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "sold", label: "Sold" },
]

// -----------------------------------------------------------------------------
// Photo background gallery (for background-removal editor in Phase B)
// -----------------------------------------------------------------------------

export const BACKGROUND_GALLERY: { id: string; label: string; imageUrl: string }[] = [
  { id: "bg-studio-grey", label: "Studio grey", imageUrl: "/backgrounds/studio-grey.jpg" },
  { id: "bg-studio-white", label: "Studio white", imageUrl: "/backgrounds/studio-white.jpg" },
  { id: "bg-showroom", label: "Showroom", imageUrl: "/backgrounds/showroom.jpg" },
  { id: "bg-forecourt", label: "Forecourt", imageUrl: "/backgrounds/forecourt.jpg" },
  { id: "bg-city-night", label: "City night", imageUrl: "/backgrounds/city-night.jpg" },
  { id: "bg-country-road", label: "Country road", imageUrl: "/backgrounds/country-road.jpg" },
  { id: "bg-mountain", label: "Mountain pass", imageUrl: "/backgrounds/mountain.jpg" },
  { id: "bg-beach", label: "Coastal", imageUrl: "/backgrounds/beach.jpg" },
  { id: "bg-warehouse", label: "Warehouse", imageUrl: "/backgrounds/warehouse.jpg" },
  { id: "bg-garage", label: "Garage", imageUrl: "/backgrounds/garage.jpg" },
  { id: "bg-sunset", label: "Sunset", imageUrl: "/backgrounds/sunset.jpg" },
  { id: "bg-gradient-blue", label: "Blue gradient", imageUrl: "/backgrounds/gradient-blue.jpg" },
  { id: "bg-gradient-orange", label: "Orange gradient", imageUrl: "/backgrounds/gradient-orange.jpg" },
  { id: "bg-solid-black", label: "Solid black", imageUrl: "/backgrounds/solid-black.jpg" },
  { id: "bg-solid-white", label: "Solid white", imageUrl: "/backgrounds/solid-white.jpg" },
]
