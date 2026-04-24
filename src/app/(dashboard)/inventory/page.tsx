"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RiAddLine, RiCarLine, RiSearchLine } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { VehicleStatusBadge } from "@/components/inventory/vehicle-status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DaysInStockBadge } from "@/components/shared/days-in-stock-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { VEHICLE_STATUSES } from "@/lib/constants"
import { stockService } from "@/lib/services/stock-service"
import type { Vehicle, VehicleStatus } from "@/lib/types"
import { formatMoney, formatNumber, formatRegPlate } from "@/lib/utils/format"

export default function InventoryPage() {
  const { currentUser, currentCompany } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ageFilter, setAgeFilter] = useState<string>("all")
  const [deleting, setDeleting] = useState<Vehicle | null>(null)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const rows = await stockService.list({
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    })
    setVehicles(rows)
    setLoading(false)
  }, [currentUser, currentCompany])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return vehicles.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false
      if (ageFilter !== "all") {
        if (ageFilter === "0-30" && v.daysInStock > 30) return false
        if (ageFilter === "31-60" && (v.daysInStock < 31 || v.daysInStock > 60)) return false
        if (ageFilter === "61-90" && (v.daysInStock < 61 || v.daysInStock > 90)) return false
        if (ageFilter === "90+" && v.daysInStock < 91) return false
      }
      if (!q) return true
      return (
        v.stockId.toLowerCase().includes(q) ||
        v.registration.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.variant ?? "").toLowerCase().includes(q)
      )
    })
  }, [vehicles, search, statusFilter, ageFilter])

  async function changeStatus(vehicle: Vehicle, status: VehicleStatus) {
    if (!currentUser || !currentCompany) return
    await stockService.changeStatus(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      vehicle.id,
      status,
    )
    toast.success(`${vehicle.make} ${vehicle.model} → ${VEHICLE_STATUSES.find((s) => s.value === status)?.label ?? status}`)
    load()
  }

  async function handleDelete() {
    if (!deleting || !currentUser || !currentCompany) return
    await stockService.delete(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      deleting.id,
    )
    toast.success(`${deleting.make} ${deleting.model} removed`)
    setDeleting(null)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory"
        subtitle="Every vehicle in stock — from received to sold."
        actions={
          <Button asChild>
            <Link href="/inventory/new">
              <RiAddLine className="size-4" />
              Add vehicle
            </Link>
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
                placeholder="Search stockId, reg, make, model…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {VEHICLE_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any age</SelectItem>
                <SelectItem value="0-30">0–30 days</SelectItem>
                <SelectItem value="31-60">31–60 days</SelectItem>
                <SelectItem value="61-90">61–90 days</SelectItem>
                <SelectItem value="90+">90+ days</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground">
              {loading ? "" : `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"}`}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={RiCarLine}
              title={vehicles.length === 0 ? "No vehicles yet" : "No vehicles match these filters"}
              description={
                vehicles.length === 0
                  ? "Log your first arrival to start tracking prep, pricing, and listings."
                  : "Clear the filters or add a new vehicle."
              }
              action={
                vehicles.length === 0 ? (
                  <Button size="sm" asChild>
                    <Link href="/inventory/new">
                      <RiAddLine className="size-4" />
                      Add first vehicle
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock ID</TableHead>
                    <TableHead>Reg</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-right">Year</TableHead>
                    <TableHead className="text-right">Mileage</TableHead>
                    <TableHead>Trans.</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Colour</TableHead>
                    <TableHead className="text-right">List</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Photos</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/inventory/${v.id}`}
                          className="hover:underline"
                        >
                          {v.stockId}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatRegPlate(v.registration)}
                      </TableCell>
                      <TableCell>{v.make}</TableCell>
                      <TableCell>{v.model}</TableCell>
                      <TableCell className="max-w-[12rem] truncate text-xs text-muted-foreground">
                        {v.variant ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">{v.year}</TableCell>
                      <TableCell className="text-right">{formatNumber(v.mileage)}</TableCell>
                      <TableCell className="capitalize">{v.transmission}</TableCell>
                      <TableCell className="capitalize">{v.fuelType}</TableCell>
                      <TableCell>{v.colour}</TableCell>
                      <TableCell className="text-right">{formatMoney(v.listPrice)}</TableCell>
                      <TableCell>
                        <DaysInStockBadge days={v.daysInStock} />
                      </TableCell>
                      <TableCell>
                        <VehicleStatusBadge status={v.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {v.location ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">{v.photos.length}</TableCell>
                      <TableCell>
                        <RowActionsMenu>
                          <DropdownMenuItem asChild>
                            <Link href={`/inventory/${v.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/inspections?vehicleId=${v.id}`}>
                              Inspection
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {VEHICLE_STATUSES.map((s) => (
                                <DropdownMenuItem
                                  key={s.value}
                                  disabled={v.status === s.value}
                                  onClick={() => changeStatus(v, s.value)}
                                >
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(v)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </RowActionsMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.make ?? ""} ${deleting?.model ?? "vehicle"}?`}
        description="This will remove the vehicle and its related cost/inspection data. Cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
