"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RiAddLine, RiMegaphoneLine, RiSearchLine } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { ListingDialog } from "@/components/listings/listing-dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { Badge } from "@/components/ui/badge"
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
import { LISTING_CHANNELS, LISTING_STATUSES } from "@/lib/constants"
import { listingService } from "@/lib/services/listing-service"
import { stockService } from "@/lib/services/stock-service"
import type { Listing, ListingStatus, Vehicle } from "@/lib/types"
import { formatDateShort, formatMoney } from "@/lib/utils/format"

export default function ListingsPage() {
  const { currentUser, currentCompany } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Listing | null>(null)
  const [deleting, setDeleting] = useState<Listing | null>(null)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const [ls, vs] = await Promise.all([listingService.list(ctx), stockService.list(ctx)])
    setListings(ls)
    setVehicles(vs)
    setLoading(false)
  }, [currentUser, currentCompany])

  useEffect(() => {
    load()
  }, [load])

  const vehicleById = useMemo(() => {
    const m = new Map<string, Vehicle>()
    vehicles.forEach((v) => m.set(v.id, v))
    return m
  }, [vehicles])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return listings.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false
      if (!q) return true
      const v = vehicleById.get(l.vehicleId)
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        v?.registration.toLowerCase().includes(q) ||
        v?.stockId.toLowerCase().includes(q) ||
        v?.make.toLowerCase().includes(q) ||
        v?.model.toLowerCase().includes(q)
      )
    })
  }, [listings, search, statusFilter, vehicleById])

  async function changeStatus(listing: Listing, status: ListingStatus) {
    if (!currentUser || !currentCompany) return
    await listingService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      listing.id,
      {
        status,
        publishedAt: status === "active" ? listing.publishedAt ?? new Date().toISOString() : listing.publishedAt,
      },
    )
    toast.success(`Listing → ${LISTING_STATUSES.find((s) => s.value === status)?.label ?? status}`)
    load()
  }

  async function handleDelete() {
    if (!deleting || !currentUser || !currentCompany) return
    await listingService.delete(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      deleting.id,
    )
    toast.success("Listing removed")
    setDeleting(null)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Listings"
        subtitle="Adverts across AutoTrader, CarGurus, Facebook, and your own site."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <RiAddLine className="size-4" />
            New listing
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
                placeholder="Search listings…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LISTING_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground">
              {loading ? "" : `${filtered.length} listing${filtered.length === 1 ? "" : "s"}`}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={RiMegaphoneLine}
              title={listings.length === 0 ? "No listings yet" : "No listings match these filters"}
              description={
                listings.length === 0
                  ? "Publish your first advert — pick a vehicle and a channel."
                  : "Clear the filters or create a new listing."
              }
              action={
                listings.length === 0 ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditing(null)
                      setDialogOpen(true)
                    }}
                  >
                    <RiAddLine className="size-4" />
                    New listing
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Asking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => {
                  const v = vehicleById.get(l.vehicleId)
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {v ? `${v.stockId} · ${v.make} ${v.model}` : "Unknown vehicle"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {LISTING_CHANNELS.find((c) => c.value === l.channel)?.label ?? l.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{l.title}</TableCell>
                      <TableCell className="text-right">{formatMoney(l.askingPrice)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {LISTING_STATUSES.find((s) => s.value === l.status)?.label ?? l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateShort(l.publishedAt)}
                      </TableCell>
                      <TableCell>
                        <RowActionsMenu>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(l)
                              setDialogOpen(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {LISTING_STATUSES.map((s) => (
                                <DropdownMenuItem
                                  key={s.value}
                                  disabled={l.status === s.value}
                                  onClick={() => changeStatus(l, s.value)}
                                >
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(l)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </RowActionsMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ListingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        listing={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this listing?"
        description="This removes the listing everywhere. Cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
