import { formatDistanceToNow, parseISO } from "date-fns"

export function formatMoney(value: number | undefined | null, opts?: { maximumFractionDigits?: number }): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
  }).format(value)
}

export function formatNumber(value: number | undefined | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("en-GB").format(value)
}

export function formatRegPlate(reg: string | undefined | null): string {
  if (!reg) return ""
  return reg.toUpperCase().replace(/\s+/g, " ").trim()
}

export function formatDateShort(iso: string | undefined | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

export function formatRelative(iso: string | undefined | null): string {
  if (!iso) return "—"
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true })
  } catch {
    return "—"
  }
}

export function formatDateInput(iso: string | undefined | null): string {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  } catch {
    return ""
  }
}

export function formatDateTimeInput(iso: string | undefined | null): string {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const hh = String(d.getHours()).padStart(2, "0")
    const mi = String(d.getMinutes()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  } catch {
    return ""
  }
}
