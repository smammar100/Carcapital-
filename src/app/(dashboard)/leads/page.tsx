"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RiAddLine, RiSearchLine, RiUserStarLine } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { LeadStatusBadge } from "@/components/leads/lead-status-badge"
import { LeadDialog } from "@/components/leads/lead-dialog"
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
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants"
import { leadsService } from "@/lib/services/leads-service"
import { stockService } from "@/lib/services/stock-service"
import type { Lead, LeadStatus, Vehicle } from "@/lib/types"
import { formatDateShort, formatMoney } from "@/lib/utils/format"

export default function LeadsPage() {
  const { currentUser, currentCompany } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState<Lead | null>(null)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const [rows, vs] = await Promise.all([leadsService.list(ctx), stockService.list(ctx)])
    setLeads(rows)
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
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false
      if (!q) return true
      return (
        l.customerName.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q)
      )
    })
  }, [leads, search, statusFilter])

  async function changeStatus(lead: Lead, status: LeadStatus) {
    if (!currentUser || !currentCompany) return
    await leadsService.changeStatus(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      lead.id,
      status,
    )
    toast.success(`Lead moved to ${LEAD_STATUSES.find((s) => s.value === status)?.label ?? status}`)
    load()
  }

  async function handleDelete() {
    if (!deleting || !currentUser || !currentCompany) return
    await leadsService.delete(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      deleting.id,
    )
    toast.success("Lead deleted")
    setDeleting(null)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leads"
        subtitle="Every customer enquiry — from walk-in to qualified."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <RiAddLine className="size-4" />
            New lead
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
                placeholder="Search leads…"
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
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground">
              {loading ? "" : `${filtered.length} lead${filtered.length === 1 ? "" : "s"}`}
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
              icon={RiUserStarLine}
              title={leads.length === 0 ? "No leads yet" : "No leads match your filters"}
              description={
                leads.length === 0
                  ? "Log a walk-in, call, or web enquiry to start tracking conversion."
                  : "Try clearing the filters or searching for a different name."
              }
              action={
                leads.length === 0 ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditing(null)
                      setDialogOpen(true)
                    }}
                  >
                    <RiAddLine className="size-4" />
                    Log first lead
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => {
                  const v = l.vehicleId ? vehicleById.get(l.vehicleId) : undefined
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">
                        <Link href={`/leads/${l.id}`} className="hover:underline">
                          {l.customerName}
                        </Link>
                      </TableCell>
                      <TableCell>{l.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {LEAD_SOURCES.find((s) => s.value === l.source)?.label ?? l.source}
                        </Badge>
                      </TableCell>
                      <TableCell><LeadStatusBadge status={l.status} /></TableCell>
                      <TableCell className="truncate max-w-[14rem] text-xs text-muted-foreground">
                        {v ? `${v.year} ${v.make} ${v.model}` : "—"}
                      </TableCell>
                      <TableCell>{formatMoney(l.budget)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateShort(l.createdAt)}</TableCell>
                      <TableCell>
                        <RowActionsMenu>
                          <DropdownMenuItem asChild>
                            <Link href={`/leads/${l.id}`}>View</Link>
                          </DropdownMenuItem>
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
                              {LEAD_STATUSES.map((s) => (
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
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(l)}>
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

      <LeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.customerName ?? "lead"}?`}
        description="The lead and its note history will be removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
