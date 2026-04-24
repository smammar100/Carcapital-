"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RiDownloadLine, RiSearchLine, RiTableLine } from "@remixicon/react"

import { PageHeader } from "@/components/layout/page-header"
import { DaysInStockBadge } from "@/components/shared/days-in-stock-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { VehicleStatusBadge } from "@/components/inventory/vehicle-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { invoiceService } from "@/lib/services/invoice-service"
import { leadsService } from "@/lib/services/leads-service"
import { listingService } from "@/lib/services/listing-service"
import { stockService } from "@/lib/services/stock-service"
import { todoService } from "@/lib/services/todo-service"
import type {
  Invoice,
  Lead,
  Listing,
  TodoItem,
  Vehicle,
} from "@/lib/types"
import { downloadCsv, toCsv } from "@/lib/utils/csv"
import { formatDateShort, formatMoney } from "@/lib/utils/format"

type SortKey =
  | "stockId"
  | "registration"
  | "makeModel"
  | "daysInStock"
  | "listPrice"
  | "landedCost"
  | "leadCount"
  | "todoCount"

interface MasterRow {
  vehicle: Vehicle
  leadCount: number
  todoCount: number
  openTodoCount: number
  listingSummary: string
  invoiceStatus: string
}

export default function MasterSheetPage() {
  const { currentUser, currentCompany } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("daysInStock")
  const [sortAsc, setSortAsc] = useState(false)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const [vs, ls, ts, lis, is] = await Promise.all([
      stockService.list(ctx),
      leadsService.list(ctx),
      todoService.list(ctx),
      listingService.list(ctx),
      invoiceService.list(ctx),
    ])
    setVehicles(vs)
    setLeads(ls)
    setTodos(ts)
    setListings(lis)
    setInvoices(is)
    setLoading(false)
  }, [currentUser, currentCompany])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo<MasterRow[]>(() => {
    return vehicles.map((v) => {
      const leadCount = leads.filter((l) => l.vehicleId === v.id).length
      const vehicleTodos = todos.filter((t) => t.vehicleId === v.id)
      const todoCount = vehicleTodos.length
      const openTodoCount = vehicleTodos.filter((t) => t.status !== "done").length
      const vehicleListings = listings.filter((l) => l.vehicleId === v.id)
      let listingSummary = "None"
      if (vehicleListings.length > 0) {
        const active = vehicleListings.filter((l) => l.status === "active").length
        listingSummary = active > 0 ? `${active} active` : `${vehicleListings.length} (none active)`
      }
      const vehicleInvoices = invoices.filter((i) => i.vehicleId === v.id)
      const saleInvoice = vehicleInvoices.find((i) => i.type === "sale")
      const invoiceStatus = saleInvoice
        ? `Sale: ${saleInvoice.status}`
        : vehicleInvoices.length > 0
          ? `Purchase: ${vehicleInvoices[0].status}`
          : "—"
      return { vehicle: v, leadCount, todoCount, openTodoCount, listingSummary, invoiceStatus }
    })
  }, [vehicles, leads, todos, listings, invoices])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q
      ? rows.filter((r) => {
          const v = r.vehicle
          return (
            v.stockId.toLowerCase().includes(q) ||
            v.registration.toLowerCase().includes(q) ||
            v.make.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            (v.variant?.toLowerCase().includes(q) ?? false)
          )
        })
      : rows

    const sorted = [...list].sort((a, b) => {
      let av: number | string = 0
      let bv: number | string = 0
      switch (sortKey) {
        case "stockId":
          av = a.vehicle.stockId
          bv = b.vehicle.stockId
          break
        case "registration":
          av = a.vehicle.registration
          bv = b.vehicle.registration
          break
        case "makeModel":
          av = `${a.vehicle.make} ${a.vehicle.model}`
          bv = `${b.vehicle.make} ${b.vehicle.model}`
          break
        case "daysInStock":
          av = a.vehicle.daysInStock
          bv = b.vehicle.daysInStock
          break
        case "listPrice":
          av = a.vehicle.listPrice
          bv = b.vehicle.listPrice
          break
        case "landedCost":
          av = a.vehicle.landedCost
          bv = b.vehicle.landedCost
          break
        case "leadCount":
          av = a.leadCount
          bv = b.leadCount
          break
        case "todoCount":
          av = a.openTodoCount
          bv = b.openTodoCount
          break
      }
      if (av === bv) return 0
      const cmp = av > bv ? 1 : -1
      return sortAsc ? cmp : -cmp
    })

    return sorted
  }, [rows, search, sortKey, sortAsc])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((a) => !a)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  function exportCsv() {
    const csv = toCsv(filtered, [
      { header: "Stock ID", format: (r) => r.vehicle.stockId },
      { header: "Registration", format: (r) => r.vehicle.registration },
      { header: "Make", format: (r) => r.vehicle.make },
      { header: "Model", format: (r) => r.vehicle.model },
      { header: "Variant", format: (r) => r.vehicle.variant ?? "" },
      { header: "Year", format: (r) => r.vehicle.year },
      { header: "Mileage", format: (r) => r.vehicle.mileage },
      { header: "Status", format: (r) => r.vehicle.status },
      { header: "Days in stock", format: (r) => r.vehicle.daysInStock },
      { header: "List price", format: (r) => r.vehicle.listPrice },
      { header: "Landed cost", format: (r) => r.vehicle.landedCost },
      { header: "All-in cost", format: (r) => r.vehicle.allInCost },
      { header: "Location", format: (r) => r.vehicle.location ?? "" },
      { header: "V5 received", format: (r) => (r.vehicle.v5Received ? "yes" : "no") },
      { header: "MOT expiry", format: (r) => r.vehicle.motExpiry ?? "" },
      { header: "# leads", format: (r) => r.leadCount },
      { header: "# todos", format: (r) => r.todoCount },
      { header: "# open todos", format: (r) => r.openTodoCount },
      { header: "Listings", format: (r) => r.listingSummary },
      { header: "Invoice", format: (r) => r.invoiceStatus },
    ])
    downloadCsv(`master-sheet-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  function sortIndicator(key: SortKey): string {
    if (sortKey !== key) return ""
    return sortAsc ? " ↑" : " ↓"
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Master sheet"
        subtitle="One wide view across every vehicle with joined lead / todo / listing / invoice state."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <RiDownloadLine className="size-4" />
            Export CSV
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <RiSearchLine className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search stock ID / reg / make / model…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {loading ? "" : `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"}`}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={RiTableLine}
              title={vehicles.length === 0 ? "No vehicles to show" : "No vehicles match this search"}
              description={
                vehicles.length === 0
                  ? "Add stock on /inventory/new to populate the master sheet."
                  : "Clear the search to see all rows."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("stockId")}
                    >
                      Stock ID{sortIndicator("stockId")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("registration")}
                    >
                      Reg{sortIndicator("registration")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("makeModel")}
                    >
                      Make / Model{sortIndicator("makeModel")}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => toggleSort("daysInStock")}
                    >
                      Age{sortIndicator("daysInStock")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => toggleSort("listPrice")}
                    >
                      List{sortIndicator("listPrice")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => toggleSort("landedCost")}
                    >
                      Landed{sortIndicator("landedCost")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => toggleSort("leadCount")}
                    >
                      Leads{sortIndicator("leadCount")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => toggleSort("todoCount")}
                    >
                      Open todos{sortIndicator("todoCount")}
                    </TableHead>
                    <TableHead>Listings</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>V5</TableHead>
                    <TableHead>MOT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.vehicle.id}>
                      <TableCell className="font-mono text-xs">{r.vehicle.stockId}</TableCell>
                      <TableCell className="font-mono text-xs">{r.vehicle.registration}</TableCell>
                      <TableCell>
                        <div className="font-medium">{r.vehicle.make} {r.vehicle.model}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.vehicle.variant ?? ""} · {r.vehicle.year} · {r.vehicle.mileage.toLocaleString("en-GB")}mi
                        </div>
                      </TableCell>
                      <TableCell>
                        <VehicleStatusBadge status={r.vehicle.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DaysInStockBadge days={r.vehicle.daysInStock} />
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMoney(r.vehicle.listPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMoney(r.vehicle.landedCost)}
                      </TableCell>
                      <TableCell className="text-right font-mono">{r.leadCount}</TableCell>
                      <TableCell className="text-right font-mono">{r.openTodoCount}</TableCell>
                      <TableCell className="text-xs">{r.listingSummary}</TableCell>
                      <TableCell className="text-xs">{r.invoiceStatus}</TableCell>
                      <TableCell>
                        {r.vehicle.v5Received ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.vehicle.motExpiry ? formatDateShort(r.vehicle.motExpiry) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
