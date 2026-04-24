"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RiAddLine, RiShieldCheckLine } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { ClaimDialog } from "@/components/warranties/claim-dialog"
import { WarrantyDialog } from "@/components/warranties/warranty-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  WARRANTY_CLAIM_STATUSES,
  WARRANTY_PROVIDERS,
  WARRANTY_STATUSES,
} from "@/lib/constants"
import { stockService } from "@/lib/services/stock-service"
import {
  warrantyClaimService,
  warrantyService,
} from "@/lib/services/warranty-service"
import type {
  Vehicle,
  Warranty,
  WarrantyClaim,
  WarrantyClaimStatus,
} from "@/lib/types"
import { formatDateShort, formatMoney } from "@/lib/utils/format"

export default function WarrantiesPage() {
  const { currentUser, currentCompany } = useAuth()
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [claims, setClaims] = useState<WarrantyClaim[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [warrantyDialog, setWarrantyDialog] = useState(false)
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null)
  const [claimDialog, setClaimDialog] = useState(false)
  const [editingClaim, setEditingClaim] = useState<WarrantyClaim | null>(null)
  const [cancellingWarranty, setCancellingWarranty] = useState<Warranty | null>(null)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const [ws, cs, vs] = await Promise.all([
      warrantyService.list(ctx),
      warrantyClaimService.list(ctx),
      stockService.list(ctx),
    ])
    setWarranties(ws)
    setClaims(cs)
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

  const warrantyById = useMemo(() => {
    const m = new Map<string, Warranty>()
    warranties.forEach((w) => m.set(w.id, w))
    return m
  }, [warranties])

  async function cancelWarranty() {
    if (!cancellingWarranty || !currentUser || !currentCompany) return
    await warrantyService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      cancellingWarranty.id,
      { status: "cancelled" },
    )
    toast.success("Warranty cancelled")
    setCancellingWarranty(null)
    load()
  }

  async function changeClaimStatus(claim: WarrantyClaim, status: WarrantyClaimStatus) {
    if (!currentUser || !currentCompany) return
    const resolved = status === "resolved" || status === "rejected"
    await warrantyClaimService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      claim.id,
      {
        status,
        resolvedAt: resolved ? claim.resolvedAt ?? new Date().toISOString() : undefined,
      },
    )
    toast.success(`Claim → ${WARRANTY_CLAIM_STATUSES.find((s) => s.value === status)?.label}`)
    load()
  }

  async function toggleComplaint(claim: WarrantyClaim) {
    if (!currentUser || !currentCompany) return
    await warrantyClaimService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      claim.id,
      { isComplaint: !claim.isComplaint },
    )
    toast.success(claim.isComplaint ? "Complaint flag cleared" : "Marked as complaint")
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Warranties"
        subtitle="In-house and third-party cover plus claims and complaints."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingClaim(null)
                setClaimDialog(true)
              }}
              disabled={warranties.length === 0}
            >
              File claim
            </Button>
            <Button
              onClick={() => {
                setEditingWarranty(null)
                setWarrantyDialog(true)
              }}
            >
              <RiAddLine className="size-4" />
              New warranty
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Warranties</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : warranties.length === 0 ? (
            <EmptyState
              icon={RiShieldCheckLine}
              title="No warranties yet"
              description="Issue a warranty when you sell a vehicle — in-house or third-party."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingWarranty(null)
                    setWarrantyDialog(true)
                  }}
                >
                  <RiAddLine className="size-4" />
                  New warranty
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {warranties.map((w) => {
                  const v = vehicleById.get(w.vehicleId)
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {v ? `${v.stockId} · ${v.make} ${v.model}` : "Unknown vehicle"}
                      </TableCell>
                      <TableCell>{w.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {WARRANTY_PROVIDERS.find((p) => p.value === w.provider)?.label ?? w.provider}
                        </Badge>
                        {w.providerName && (
                          <span className="ml-2 text-xs text-muted-foreground">{w.providerName}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateShort(w.startAt)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateShort(w.endAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {WARRANTY_STATUSES.find((s) => s.value === w.status)?.label ?? w.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <RowActionsMenu>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingWarranty(w)
                              setWarrantyDialog(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={w.status === "cancelled"}
                            onClick={() => setCancellingWarranty(w)}
                          >
                            Cancel warranty
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Claims &amp; complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No claims filed yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reported</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((c) => {
                  const w = warrantyById.get(c.warrantyId)
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateShort(c.reportedAt)}
                      </TableCell>
                      <TableCell>{w?.customerName ?? c.customerName}</TableCell>
                      <TableCell className="max-w-sm truncate">{c.description}</TableCell>
                      <TableCell>
                        {c.isComplaint ? (
                          <Badge variant="outline" className="bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200">
                            Complaint
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.cost !== undefined ? formatMoney(c.cost) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {WARRANTY_CLAIM_STATUSES.find((s) => s.value === c.status)?.label ?? c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <RowActionsMenu>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingClaim(c)
                              setClaimDialog(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {WARRANTY_CLAIM_STATUSES.map((s) => (
                                <DropdownMenuItem
                                  key={s.value}
                                  disabled={c.status === s.value}
                                  onClick={() => changeClaimStatus(c, s.value)}
                                >
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem onClick={() => toggleComplaint(c)}>
                            {c.isComplaint ? "Clear complaint flag" : "Flag as complaint"}
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

      <WarrantyDialog
        open={warrantyDialog}
        onOpenChange={setWarrantyDialog}
        warranty={editingWarranty}
        onSaved={load}
      />

      <ClaimDialog
        open={claimDialog}
        onOpenChange={setClaimDialog}
        warranties={warranties}
        claim={editingClaim}
        onSaved={load}
      />

      <ConfirmDialog
        open={cancellingWarranty !== null}
        onOpenChange={(open) => !open && setCancellingWarranty(null)}
        title="Cancel this warranty?"
        description="The warranty stays on record with status = cancelled."
        confirmLabel="Cancel warranty"
        destructive
        onConfirm={cancelWarranty}
      />
    </div>
  )
}
