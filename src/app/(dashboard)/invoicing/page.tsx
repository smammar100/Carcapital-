"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RiAddLine, RiBillLine, RiSearchLine } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { InvoiceEditor } from "@/components/invoicing/invoice-editor"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { INVOICE_STATUSES, INVOICE_TYPES } from "@/lib/constants"
import { invoiceService } from "@/lib/services/invoice-service"
import { stockService } from "@/lib/services/stock-service"
import type {
  Invoice,
  InvoiceStatus,
  InvoiceType,
  Vehicle,
} from "@/lib/types"
import { formatDateShort, formatMoney } from "@/lib/utils/format"

const STATUS_COLOURS: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200",
  issued: "bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200",
  part_paid: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200",
  paid: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200",
  void: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
}

export default function InvoicingPage() {
  const { currentUser, currentCompany } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [typeTab, setTypeTab] = useState<"all" | InvoiceType>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [editorDefaultType, setEditorDefaultType] = useState<InvoiceType>("sale")
  const [deleting, setDeleting] = useState<Invoice | null>(null)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const [is, vs] = await Promise.all([invoiceService.list(ctx), stockService.list(ctx)])
    setInvoices(is)
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
    return invoices.filter((inv) => {
      if (typeTab !== "all" && inv.type !== typeTab) return false
      if (statusFilter !== "all" && inv.status !== statusFilter) return false
      if (!q) return true
      return (
        inv.number.toLowerCase().includes(q) ||
        inv.buyerName.toLowerCase().includes(q) ||
        (inv.buyerEmail?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [invoices, typeTab, statusFilter, search])

  async function markStatus(inv: Invoice, status: InvoiceStatus) {
    if (!currentUser || !currentCompany) return
    const patch: Partial<Invoice> = { status }
    if (status === "paid") {
      patch.amountPaid = inv.total
      patch.balance = 0
    }
    await invoiceService.update(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      inv.id,
      patch,
    )
    toast.success(`Invoice → ${INVOICE_STATUSES.find((s) => s.value === status)?.label}`)
    load()
  }

  async function duplicate(inv: Invoice) {
    if (!currentUser || !currentCompany) return
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    const { id: _id, companyId: _cId, createdAt: _ca, updatedAt: _ua, ...rest } = inv
    await invoiceService.create(ctx, {
      ...rest,
      number: `${inv.number}-COPY`,
      status: "draft",
      amountPaid: 0,
      balance: inv.total,
    })
    toast.success("Invoice duplicated")
    load()
  }

  async function handleDelete() {
    if (!deleting || !currentUser || !currentCompany) return
    await invoiceService.delete(
      { companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name },
      deleting.id,
    )
    toast.success("Invoice deleted")
    setDeleting(null)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoicing"
        subtitle="Editable purchase and sale invoices with line items and VAT."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null)
                setEditorDefaultType("purchase")
                setEditorOpen(true)
              }}
            >
              New purchase
            </Button>
            <Button
              onClick={() => {
                setEditing(null)
                setEditorDefaultType("sale")
                setEditorOpen(true)
              }}
            >
              <RiAddLine className="size-4" />
              New sale
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <Tabs value={typeTab} onValueChange={(v) => setTypeTab(v as typeof typeTab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {INVOICE_TYPES.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <RiSearchLine className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search number / buyer…"
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
                {INVOICE_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground">
              {loading ? "" : `${filtered.length} invoice${filtered.length === 1 ? "" : "s"}`}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={RiBillLine}
              title={invoices.length === 0 ? "No invoices yet" : "No invoices match these filters"}
              description={
                invoices.length === 0
                  ? "Draft your first invoice — purchase from a supplier or sale to a customer."
                  : "Clear the filters or create a new invoice."
              }
              action={
                invoices.length === 0 ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditing(null)
                      setEditorDefaultType("sale")
                      setEditorOpen(true)
                    }}
                  >
                    <RiAddLine className="size-4" />
                    New sale invoice
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => {
                  const v = inv.vehicleId ? vehicleById.get(inv.vehicleId) : undefined
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {INVOICE_TYPES.find((t) => t.value === inv.type)?.label ?? inv.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLOURS[inv.status]}>
                          {INVOICE_STATUSES.find((s) => s.value === inv.status)?.label ?? inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{inv.buyerName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {v ? `${v.stockId} · ${v.make} ${v.model}` : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatMoney(inv.total)}</TableCell>
                      <TableCell className="text-right font-mono">{formatMoney(inv.balance)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateShort(inv.issueDate)}
                      </TableCell>
                      <TableCell>
                        <RowActionsMenu>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(inv)
                              setEditorOpen(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={inv.status === "paid" || inv.status === "void"}
                            onClick={() => markStatus(inv, "paid")}
                          >
                            Mark paid
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {INVOICE_STATUSES.map((s) => (
                                <DropdownMenuItem
                                  key={s.value}
                                  disabled={inv.status === s.value}
                                  onClick={() => markStatus(inv, s.value)}
                                >
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem onClick={() => duplicate(inv)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(inv)}
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

      <InvoiceEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        invoice={editing}
        defaultType={editorDefaultType}
        vehicles={vehicles}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this invoice?"
        description="The invoice is removed permanently. Cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
