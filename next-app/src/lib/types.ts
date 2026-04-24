// Car Capital UK — domain types
//
// Single-tenant-per-login v1. No roles/permissions; every registered user owns their tenant.
// Mock-backed today; every service layer that reads/writes these types is ready to swap in Supabase.

// -----------------------------------------------------------------------------
// Company + user
// -----------------------------------------------------------------------------

export type DealershipType = "independent" | "franchise" | "auction"
export type MonthlyStockVolume = "<10" | "10-25" | "25-50" | "50+"
export type PrimarySourcing = "auction" | "private" | "trade_in" | "mix"
export type InviteStatus = "pending" | "accepted" | "expired"

export interface Company {
  id: string
  name: string
  address: string
  phone: string
  email: string
  logoUrl?: string
  city?: string
  postcode?: string
  companyRegistrationNumber?: string
  website?: string
  vatNumber?: string
  vatRate?: number
  openingHours?: string
  stockIdPrefix?: string
  defaultFinanceProvider?: string
  defaultAppointmentDurationMins?: number
  dealershipType?: DealershipType
  monthlyStockVolume?: MonthlyStockVolume
  primarySourcing?: PrimarySourcing
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  companyId: string
  name: string
  email: string
  phone: string | null
  avatarUrl?: string
  onboardingComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface PendingInvite {
  id: string
  companyId: string
  email: string
  name: string
  status: InviteStatus
  invitedBy: string
  sentAt: string
}

// -----------------------------------------------------------------------------
// Vehicle
// -----------------------------------------------------------------------------

export type VehicleStatus =
  | "received"
  | "inspection_pending"
  | "being_prepared"
  | "ready"
  | "listed"
  | "sold"

export type FuelType = "petrol" | "diesel" | "hybrid" | "electric" | "lpg"
export type TransmissionType = "manual" | "automatic" | "semi-auto"
export type BodyType =
  | "Hatchback"
  | "Saloon"
  | "Estate"
  | "SUV"
  | "Coupe"
  | "Convertible"
  | "MPV"
  | "Van"

export type SourceType = "auction" | "trade_in" | "private" | "broker"

export type ServiceHistory = "full" | "partial" | "none" | "unknown"

export interface VehiclePhoto {
  id: string
  url: string
  caption?: string
  isHero?: boolean
  backgroundProcessed?: boolean
}

export interface Vehicle {
  // Identity
  id: string
  companyId: string
  stockId: string
  vin: string
  registration: string

  // Model
  make: string
  model: string
  variant?: string
  variantCode?: string
  year: number
  bodyType: BodyType
  doors: number
  fuelType: FuelType
  transmission: TransmissionType
  colour: string
  mileage: number
  serviceHistory: ServiceHistory

  // Documentation
  v5Received: boolean
  motExpiry?: string
  previousOwners?: number
  keysCount?: number

  // Source
  sourceType: SourceType
  auctionHouse?: string
  sourceRef?: string
  sourceDate?: string

  // Cost breakdown (7 rows)
  purchasePrice: number
  auctionFee: number
  transportCost: number
  vatOnPurchase: number
  adminFee: number
  inspectionCost: number
  valetCost: number

  // Stocking plan
  financeProvider?: string
  stockingLoadingFee: number
  stockingDailyCharge: number
  stockingUnloadingFee: number
  expectedStockingDays: number

  // Preparation
  preparationCost: number
  valueAddition: number

  // Derived cost totals
  baseCost: number
  landedCost: number
  totalPreparationCost: number
  totalStockingCost: number
  allInCost: number

  // Pricing
  listPrice: number
  reservePrice: number
  targetMargin: number

  // KPIs
  status: VehicleStatus
  daysInStock: number
  location?: string
  photos: VehiclePhoto[]
  notes?: string

  // Meta
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Inspection (per-check records keyed by vehicleId + checkNumber)
// -----------------------------------------------------------------------------

export type InspectionCheckStatus = "ok" | "attention" | "fail" | "na"

export interface InspectionCheck {
  id: string
  companyId: string
  vehicleId: string
  checkNumber: number // 1..20
  status: InspectionCheckStatus
  actionRequired?: string
  notes?: string
  inspectorId: string
  inspectorName: string
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Todo
// -----------------------------------------------------------------------------

export type TodoStatus = "open" | "in_progress" | "blocked" | "done"

export interface TodoItem {
  id: string
  companyId: string
  vehicleId: string
  title: string
  description?: string
  status: TodoStatus
  assignedVendorId?: string
  estimatedCost?: number
  actualCost?: number
  dueBy?: string
  completedAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Vendor
// -----------------------------------------------------------------------------

export type VendorKind =
  | "mechanic"
  | "bodyshop"
  | "valeter"
  | "tyres"
  | "electrical"
  | "parts"
  | "transport"
  | "other"

export interface Vendor {
  id: string
  companyId: string
  name: string
  kind: VendorKind
  contactName?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Listing (Advert)
// -----------------------------------------------------------------------------

export type ListingChannel =
  | "autotrader"
  | "carguru"
  | "facebook"
  | "website"
  | "other"

export type ListingStatus = "draft" | "active" | "paused" | "sold"

export interface Listing {
  id: string
  companyId: string
  vehicleId: string
  channel: ListingChannel
  status: ListingStatus
  title: string
  description: string
  askingPrice: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Lead
// -----------------------------------------------------------------------------

export type LeadSource =
  | "walk_in"
  | "phone"
  | "website"
  | "autotrader"
  | "facebook"
  | "referral"
  | "other"

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "appointment_booked"
  | "lost"

export interface LeadNote {
  id: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export interface Lead {
  id: string
  companyId: string
  customerName: string
  email?: string
  phone: string
  source: LeadSource
  status: LeadStatus
  assignedTo?: string
  vehicleId?: string
  budget?: number
  notes: LeadNote[]
  lostReason?: string
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Appointment
// -----------------------------------------------------------------------------

export type AppointmentKind = "test_drive" | "viewing" | "collection" | "other"
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show"

export interface Appointment {
  id: string
  companyId: string
  leadId?: string
  vehicleId?: string
  customerName: string
  customerPhone?: string
  kind: AppointmentKind
  status: AppointmentStatus
  scheduledFor: string
  durationMins: number
  assignedTo?: string
  notes?: string
  remindersSent: string[] // channels e.g. ["whatsapp", "email"]
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Workshop job (replaces ServiceJob; jobType = internal (maintenance) or external (walk-in))
// -----------------------------------------------------------------------------

export type WorkshopJobType = "internal" | "external"
export type WorkshopJobStatus =
  | "scheduled"
  | "in_progress"
  | "awaiting_parts"
  | "completed"
  | "cancelled"

export interface WorkshopJob {
  id: string
  companyId: string
  jobType: WorkshopJobType
  vehicleId?: string // optional for external walk-ins if vehicle not yet registered to stock
  customerName?: string // required when external
  customerPhone?: string
  registration?: string
  mechanicId?: string
  description: string
  scheduledFor: string
  completedAt?: string
  cost: number
  status: WorkshopJobStatus
  invoiceId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Warranty
// -----------------------------------------------------------------------------

export type WarrantyProvider = "in_house" | "third_party"
export type WarrantyStatus = "active" | "expired" | "cancelled"

export interface Warranty {
  id: string
  companyId: string
  vehicleId: string
  customerId?: string // lead/invoice id if relevant
  customerName: string
  provider: WarrantyProvider
  providerName?: string
  startAt: string
  endAt: string
  coverageSummary?: string
  status: WarrantyStatus
  createdAt: string
  updatedAt: string
}

export type WarrantyClaimStatus = "open" | "approved" | "rejected" | "resolved"

export interface WarrantyClaim {
  id: string
  companyId: string
  warrantyId: string
  vehicleId: string
  customerName: string
  reportedAt: string
  description: string
  isComplaint: boolean
  status: WarrantyClaimStatus
  resolutionNotes?: string
  cost?: number
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Invoice (replaces Sale + FinanceApplication)
// -----------------------------------------------------------------------------

export type InvoiceType = "purchase" | "sale"
export type InvoiceStatus =
  | "draft"
  | "issued"
  | "part_paid"
  | "paid"
  | "void"

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: number // percentage e.g. 20
  total: number
}

export interface InvoiceCustomField {
  id: string
  label: string
  value: string
}

export interface Invoice {
  id: string
  companyId: string
  type: InvoiceType
  number: string
  vehicleId?: string
  leadId?: string
  workshopJobId?: string
  buyerName: string
  buyerEmail?: string
  buyerPhone?: string
  buyerAddress?: string
  issueDate: string
  dueDate?: string
  lineItems: InvoiceLineItem[]
  customFields: InvoiceCustomField[]
  subtotal: number
  vatTotal: number
  total: number
  deposit?: number
  amountPaid: number
  balance: number
  specialNotes?: string
  status: InvoiceStatus
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------------------------------
// Notifications + Activity log
// -----------------------------------------------------------------------------

export type NotificationType =
  | "lead_assigned"
  | "appointment_booked"
  | "invoice_issued"
  | "warranty_claim"
  | "inspection_complete"
  | "job_completed"
  | "stock_aged"

export interface Notification {
  id: string
  companyId: string
  userId: string
  type: NotificationType
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: string
}

export type ActivityActionType =
  | "vehicle_created"
  | "vehicle_updated"
  | "vehicle_status_changed"
  | "inspection_check_saved"
  | "todo_created"
  | "todo_completed"
  | "listing_published"
  | "lead_created"
  | "lead_status_changed"
  | "appointment_booked"
  | "workshop_job_created"
  | "workshop_job_completed"
  | "invoice_issued"
  | "warranty_created"
  | "warranty_claim_filed"
  | "auth_login"

export type ActivityEntity =
  | "vehicle"
  | "inspection"
  | "todo"
  | "listing"
  | "lead"
  | "appointment"
  | "workshop_job"
  | "invoice"
  | "warranty"
  | "warranty_claim"
  | "user"
  | "auth"

export interface ActivityLogEntry {
  id: string
  companyId: string
  userId: string
  userName: string
  actionType: ActivityActionType
  entity: ActivityEntity
  entityId: string
  summary: string
  metadata?: Record<string, string | number | boolean | null>
  createdAt: string
}
