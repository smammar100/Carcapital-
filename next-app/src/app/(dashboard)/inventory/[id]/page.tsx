"use client"

import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  RiArrowLeftLine,
  RiCarLine,
  RiImageLine,
} from "@remixicon/react"
import { toast } from "sonner"

import { VehicleStatusBadge } from "@/components/inventory/vehicle-status-badge"
import { PageHeader } from "@/components/layout/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DaysInStockBadge } from "@/components/shared/days-in-stock-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import {
  INSPECTION_CHECK_STATUSES,
  INSPECTION_ITEMS,
  LISTING_CHANNELS,
  LISTING_STATUSES,
  TODO_STATUSES,
  VEHICLE_STATUSES,
} from "@/lib/constants"
import { activityService } from "@/lib/services/activity-service"
import { inspectionsService } from "@/lib/services/inspections-service"
import { invoiceService } from "@/lib/services/invoice-service"
import { listingService } from "@/lib/services/listing-service"
import { stockService } from "@/lib/services/stock-service"
import { todoService } from "@/lib/services/todo-service"
import { vendorService } from "@/lib/services/vendor-service"
import type {
  ActivityLogEntry,
  InspectionCheck,
  Invoice,
  Listing,
  TodoItem,
  TodoStatus,
  Vehicle,
  VehicleStatus,
  Vendor,
} from "@/lib/types"
import {
  formatDateShort,
  formatDateTime,
  formatMoney,
  formatNumber,
  formatRelative,
} from "@/lib/utils/format"

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { currentUser, currentCompany } = useAuth()

  const [vehicle, setVehicle] = useState<Vehicle | null | undefined>(undefined)
  const [checks, setChecks] = useState<InspectionCheck[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [activity, setActivity] = useState<ActivityLogEntry[]>([])
  const [todoDraft, setTodoDraft] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const found = await stockService.getById(ctx, params.id)
    setVehicle(found ?? null)
    if (!found) return
    const [c, t, v, l, inv, act] = await Promise.all([
      inspectionsService.listByVehicle(ctx, found.id),
      todoService.listByVehicle(ctx, found.id),
      vendorService.list(ctx),
      listingService.list(ctx),
      invoiceService.list(ctx),
      activityService.list(ctx.companyId, 200),
    ])
    setChecks(c)
    setTodos(t)
    setVendors(v)
    setListings(l.filter((x) => x.vehicleId === found.id))
    setInvoices(inv.filter((x) => x.vehicleId === found.id))
    setActivity(act.filter((x) => x.entityId === found.id || (x.entity === "todo" && t.some((tt) => tt.id === x.entityId))))
  }, [currentUser, currentCompany, params.id])

  useEffect(() => {
    load()
  }, [load])

  const checksByNum = useMemo(() => {
    const m = new Map<number, InspectionCheck>()
    checks.forEach((c) => m.set(c.checkNumber, c))
    return m
  }, [checks])

  if (vehicle === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }
  if (vehicle === null) {
    notFound()
  }

  async function changeStatus(status: VehicleStatus) {
    if (!currentUser || !currentCompany || !vehicle) return
    await stockService.changeStatus(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      vehicle.id,
      status,
    )
    toast.success(`Status → ${VEHICLE_STATUSES.find((s) => s.value === status)?.label ?? status}`)
    load()
  }

  async function addTodo() {
    if (!currentUser || !currentCompany || !vehicle) return
    const title = todoDraft.trim()
    if (!title) return
    await todoService.create(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      {
        vehicleId: vehicle.id,
        title,
        status: "open",
      },
    )
    setTodoDraft("")
    toast.success("Todo added")
    load()
  }

  async function updateTodoStatus(todo: TodoItem, status: TodoStatus) {
    if (!currentUser || !currentCompany) return
    await todoService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      todo.id,
      { status },
    )
    load()
  }

  async function assignTodoVendor(todo: TodoItem, vendorId: string | undefined) {
    if (!currentUser || !currentCompany) return
    await todoService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      todo.id,
      { assignedVendorId: vendorId },
    )
    load()
  }

  async function handleDelete() {
    if (!currentUser || !currentCompany || !vehicle) return
    await stockService.delete(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      vehicle.id,
    )
    toast.success("Vehicle removed")
    router.push("/inventory")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/inventory">
            <RiArrowLeftLine className="size-4" />
            Back to inventory
          </Link>
        </Button>
        <PageHeader
          title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          subtitle={`${vehicle.stockId} · ${vehicle.registration} · ${formatNumber(vehicle.mileage)} mi`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select value={vehicle.status} onValueChange={(v) => changeStatus(v as VehicleStatus)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </div>
          }
        />
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="inspection">Inspection</TabsTrigger>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Status" value={<VehicleStatusBadge status={vehicle.status} />} />
            <StatCard label="Days in stock" value={<DaysInStockBadge days={vehicle.daysInStock} />} />
            <StatCard label="All-in cost" value={formatMoney(vehicle.allInCost)} />
            <StatCard label="List price" value={formatMoney(vehicle.listPrice)} />
            <StatCard label="Target margin" value={formatMoney(vehicle.targetMargin)} />
            <StatCard label="Reserve" value={formatMoney(vehicle.reservePrice)} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <KV k="Registration" v={vehicle.registration} />
              <KV k="VIN" v={vehicle.vin} />
              <KV k="Variant" v={vehicle.variant ?? "—"} />
              <KV k="Body" v={vehicle.bodyType} />
              <KV k="Doors" v={vehicle.doors} />
              <KV k="Fuel" v={vehicle.fuelType} />
              <KV k="Transmission" v={vehicle.transmission} />
              <KV k="Colour" v={vehicle.colour} />
              <KV k="Mileage" v={formatNumber(vehicle.mileage)} />
              <KV k="V5 received" v={vehicle.v5Received ? "Yes" : "No"} />
              <KV k="MOT expiry" v={formatDateShort(vehicle.motExpiry)} />
              <KV k="Previous owners" v={vehicle.previousOwners ?? "—"} />
              <KV k="Keys" v={vehicle.keysCount ?? "—"} />
              <KV k="Service history" v={vehicle.serviceHistory} />
              <KV k="Location" v={vehicle.location ?? "—"} />
            </CardContent>
          </Card>
          {vehicle.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm">
                {vehicle.notes}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <CostRow label="Purchase price" value={vehicle.purchasePrice} />
                  <CostRow label="Auction fee" value={vehicle.auctionFee} />
                  <CostRow label="Transport" value={vehicle.transportCost} />
                  <CostRow label="Admin fee" value={vehicle.adminFee} />
                  <CostRow label="Base cost" value={vehicle.baseCost} bold />
                  <CostRow label="Valet" value={vehicle.valetCost} />
                  <CostRow label="Inspection" value={vehicle.inspectionCost} />
                  <CostRow label="VAT on purchase" value={vehicle.vatOnPurchase} />
                  <CostRow label="Landed cost" value={vehicle.landedCost} bold />
                  <CostRow label="Stocking (total)" value={vehicle.totalStockingCost} />
                  <CostRow label="Preparation (total)" value={vehicle.totalPreparationCost} />
                  <CostRow label="All-in cost" value={vehicle.allInCost} bold />
                  <CostRow label="List price" value={vehicle.listPrice} />
                  <CostRow label="Reserve" value={vehicle.reservePrice} />
                  <CostRow label="Target margin" value={vehicle.targetMargin} bold />
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspection">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">20-point inspection</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Jump to the full editor on the Inspections page to save changes.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/inspections?vehicleId=${vehicle.id}`}>Open editor</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Check</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INSPECTION_ITEMS.map((item) => {
                    const c = checksByNum.get(item.number)
                    return (
                      <TableRow key={item.number}>
                        <TableCell>{item.number}</TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>
                          {c ? (
                            <Badge variant="outline" className="capitalize">
                              {INSPECTION_CHECK_STATUSES.find((s) => s.value === c.status)?.label ?? c.status}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not checked</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c?.actionRequired ?? "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todos" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add a todo</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                value={todoDraft}
                onChange={(e) => setTodoDraft(e.target.value)}
                placeholder="e.g. Replace nearside front tyre"
              />
              <Button onClick={addTodo} disabled={!todoDraft.trim()}>
                Add
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open todos</CardTitle>
            </CardHeader>
            <CardContent>
              {todos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No todos yet — create one above or generate them from inspection failures.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todos.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell>
                          <Select
                            value={t.status}
                            onValueChange={(v) => updateTodoStatus(t, v as TodoStatus)}
                          >
                            <SelectTrigger className="h-8 w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TODO_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={t.assignedVendorId ?? "__none__"}
                            onValueChange={(v) => assignTodoVendor(t, v === "__none__" ? undefined : v)}
                          >
                            <SelectTrigger className="h-8 w-40 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Unassigned</SelectItem>
                              {vendors.map((v) => (
                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatMoney(t.actualCost ?? t.estimatedCost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Published listings</CardTitle>
              <Button variant="outline" asChild size="sm">
                <Link href="/listings">Manage listings</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No listings for this vehicle yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {LISTING_CHANNELS.find((c) => c.value === l.channel)?.label ?? l.channel}
                          </Badge>
                        </TableCell>
                        <TableCell className="truncate max-w-xs">{l.title}</TableCell>
                        <TableCell className="capitalize">
                          {LISTING_STATUSES.find((s) => s.value === l.status)?.label ?? l.status}
                        </TableCell>
                        <TableCell className="text-right">{formatMoney(l.askingPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardContent className="p-6">
              {vehicle.photos.length === 0 ? (
                <EmptyState
                  icon={RiImageLine}
                  title="No photos yet"
                  description="Photo uploads arrive with the Photo Processing studio in Phase H."
                  action={
                    <Button variant="outline" asChild size="sm">
                      <Link href="/listings/photos">Open photo studio</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {vehicle.photos.map((p) => (
                    <div
                      key={p.id}
                      className="aspect-video overflow-hidden rounded-md border bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.caption ?? ""}
                        className="size-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Vehicle invoices</CardTitle>
              <Button variant="outline" asChild size="sm">
                <Link href="/invoicing">Open invoicing</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices linked.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.number}</TableCell>
                        <TableCell className="capitalize">{inv.type}</TableCell>
                        <TableCell className="capitalize">{inv.status}</TableCell>
                        <TableCell className="text-right">{formatMoney(inv.total)}</TableCell>
                        <TableCell className="text-right">{formatMoney(inv.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {activity.map((a) => (
                    <li key={a.id} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{a.summary}</span>
                        <span
                          className="text-xs text-muted-foreground"
                          title={formatDateTime(a.createdAt)}
                        >
                          {formatRelative(a.createdAt)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {a.userName} · {a.actionType.replaceAll("_", " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${vehicle.make} ${vehicle.model}?`}
        description="This removes the vehicle and breaks any todos/listings/invoices that reference it."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold">{value}</span>
      </CardContent>
    </Card>
  )
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  )
}

function CostRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <TableRow>
      <TableCell className={bold ? "font-semibold" : ""}>{label}</TableCell>
      <TableCell className={`text-right ${bold ? "font-semibold" : ""}`}>
        {formatMoney(value)}
      </TableCell>
    </TableRow>
  )
}
