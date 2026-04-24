"use client"

import { useEffect, useMemo, useState } from "react"
import { RiAddLine, RiDeleteBin6Line, RiPrinterLine } from "@remixicon/react"
import { toast } from "sonner"

import { EntityCombobox } from "@/components/shared/entity-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { INVOICE_STATUSES, INVOICE_TYPES } from "@/lib/constants"
import { invoiceService } from "@/lib/services/invoice-service"
import type {
  Invoice,
  InvoiceCustomField,
  InvoiceLineItem,
  InvoiceStatus,
  InvoiceType,
  Vehicle,
} from "@/lib/types"
import { formatDateInput, formatMoney } from "@/lib/utils/format"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice | null
  defaultType?: InvoiceType
  vehicles: Vehicle[]
  onSaved: () => void
}

interface FormState {
  type: InvoiceType
  number: string
  vehicleId: string | undefined
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerAddress: string
  issueDate: string
  dueDate: string
  lineItems: InvoiceLineItem[]
  customFields: InvoiceCustomField[]
  deposit: string
  amountPaid: string
  specialNotes: string
  status: InvoiceStatus
}

function newLineId(): string {
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function newFieldId(): string {
  return `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function emptyLine(): InvoiceLineItem {
  return { id: newLineId(), description: "", quantity: 1, unitPrice: 0, vatRate: 20, total: 0 }
}

function calcLine(line: InvoiceLineItem): InvoiceLineItem {
  return { ...line, total: line.quantity * line.unitPrice }
}

function emptyInvoice(type: InvoiceType, vatRate: number): FormState {
  const issueDate = formatDateInput(new Date().toISOString())
  return {
    type,
    number: `${type === "sale" ? "INV" : "PO"}-${Date.now().toString().slice(-6)}`,
    vehicleId: undefined,
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerAddress: "",
    issueDate,
    dueDate: "",
    lineItems: [{ id: newLineId(), description: "", quantity: 1, unitPrice: 0, vatRate, total: 0 }],
    customFields: [],
    deposit: "",
    amountPaid: "",
    specialNotes: "",
    status: "draft",
  }
}

export function InvoiceEditor({
  open,
  onOpenChange,
  invoice,
  defaultType = "sale",
  vehicles,
  onSaved,
}: Props) {
  const { currentUser, currentCompany } = useAuth()
  const [form, setForm] = useState<FormState | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    if (invoice) {
      setForm({
        type: invoice.type,
        number: invoice.number,
        vehicleId: invoice.vehicleId,
        buyerName: invoice.buyerName,
        buyerEmail: invoice.buyerEmail ?? "",
        buyerPhone: invoice.buyerPhone ?? "",
        buyerAddress: invoice.buyerAddress ?? "",
        issueDate: formatDateInput(invoice.issueDate),
        dueDate: invoice.dueDate ? formatDateInput(invoice.dueDate) : "",
        lineItems: invoice.lineItems.length > 0 ? invoice.lineItems : [emptyLine()],
        customFields: invoice.customFields,
        deposit: invoice.deposit !== undefined ? String(invoice.deposit) : "",
        amountPaid: String(invoice.amountPaid ?? 0),
        specialNotes: invoice.specialNotes ?? "",
        status: invoice.status,
      })
    } else {
      setForm(emptyInvoice(defaultType, currentCompany?.vatRate ?? 20))
    }
  }, [open, invoice, defaultType, currentCompany])

  const totals = useMemo(() => {
    if (!form) return { subtotal: 0, vatTotal: 0, total: 0 }
    let subtotal = 0
    let vatTotal = 0
    form.lineItems.forEach((li) => {
      const lineTotal = li.quantity * li.unitPrice
      subtotal += lineTotal
      vatTotal += lineTotal * (li.vatRate / 100)
    })
    return { subtotal, vatTotal, total: subtotal + vatTotal }
  }, [form])

  function updateLine(id: string, patch: Partial<InvoiceLineItem>) {
    if (!form) return
    setForm({
      ...form,
      lineItems: form.lineItems.map((li) => (li.id === id ? calcLine({ ...li, ...patch }) : li)),
    })
  }

  function addLine() {
    if (!form) return
    const vatRate = currentCompany?.vatRate ?? 20
    setForm({
      ...form,
      lineItems: [
        ...form.lineItems,
        { id: newLineId(), description: "", quantity: 1, unitPrice: 0, vatRate, total: 0 },
      ],
    })
  }

  function removeLine(id: string) {
    if (!form) return
    if (form.lineItems.length === 1) {
      toast.error("Invoices need at least one line item")
      return
    }
    setForm({ ...form, lineItems: form.lineItems.filter((li) => li.id !== id) })
  }

  function addCustomField() {
    if (!form) return
    setForm({
      ...form,
      customFields: [...form.customFields, { id: newFieldId(), label: "", value: "" }],
    })
  }

  function updateField(id: string, patch: Partial<InvoiceCustomField>) {
    if (!form) return
    setForm({
      ...form,
      customFields: form.customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    })
  }

  function removeField(id: string) {
    if (!form) return
    setForm({ ...form, customFields: form.customFields.filter((f) => f.id !== id) })
  }

  async function handleSave() {
    if (!form || !currentUser || !currentCompany) return
    if (!form.buyerName.trim()) {
      toast.error("Buyer name is required")
      return
    }
    if (!form.number.trim()) {
      toast.error("Invoice number is required")
      return
    }
    setBusy(true)
    try {
      const ctx = {
        companyId: currentCompany.id,
        userId: currentUser.id,
        userName: currentUser.name,
      }
      const amountPaid = Number(form.amountPaid) || 0
      const deposit = form.deposit ? Number(form.deposit) : undefined
      const payload: Omit<Invoice, "id" | "companyId" | "createdAt" | "updatedAt"> = {
        type: form.type,
        number: form.number.trim(),
        vehicleId: form.vehicleId,
        buyerName: form.buyerName.trim(),
        buyerEmail: form.buyerEmail.trim() || undefined,
        buyerPhone: form.buyerPhone.trim() || undefined,
        buyerAddress: form.buyerAddress.trim() || undefined,
        issueDate: new Date(form.issueDate).toISOString(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        lineItems: form.lineItems.map(calcLine),
        customFields: form.customFields.filter((f) => f.label.trim() || f.value.trim()),
        subtotal: totals.subtotal,
        vatTotal: totals.vatTotal,
        total: totals.total,
        deposit,
        amountPaid,
        balance: totals.total - amountPaid,
        specialNotes: form.specialNotes.trim() || undefined,
        status: form.status,
      }
      if (invoice) {
        await invoiceService.update(ctx, invoice.id, payload)
        toast.success("Invoice updated")
      } else {
        await invoiceService.create(ctx, payload)
        toast.success("Invoice created")
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save invoice")
    } finally {
      setBusy(false)
    }
  }

  if (!form) return null

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
    description: `${v.stockId} · ${v.registration}`,
  }))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b">
          <SheetTitle>{invoice ? `Edit invoice ${invoice.number}` : "New invoice"}</SheetTitle>
          <SheetDescription>
            Line items auto-total as you type. VAT is applied per line.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-6">
            {/* Header block */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as InvoiceType })}
                  disabled={!!invoice}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INVOICE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-no">Number</Label>
                <Input
                  id="inv-no"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as InvoiceStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INVOICE_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="inv-issue">Issue date</Label>
                <Input
                  id="inv-issue"
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-due">Due date (optional)</Label>
                <Input
                  id="inv-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Linked vehicle</Label>
              <EntityCombobox
                value={form.vehicleId}
                onChange={(v) => setForm({ ...form, vehicleId: v })}
                options={vehicleOptions}
                placeholder="No vehicle linked"
              />
            </div>

            {/* Buyer block */}
            <div className="rounded-md border p-3">
              <div className="mb-3 text-sm font-medium">
                {form.type === "sale" ? "Customer (buyer)" : "Supplier (seller)"}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="buyer-name">Name</Label>
                  <Input
                    id="buyer-name"
                    value={form.buyerName}
                    onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="buyer-email">Email</Label>
                  <Input
                    id="buyer-email"
                    type="email"
                    value={form.buyerEmail}
                    onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="buyer-phone">Phone</Label>
                  <Input
                    id="buyer-phone"
                    value={form.buyerPhone}
                    onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="buyer-addr">Address</Label>
                  <Input
                    id="buyer-addr"
                    value={form.buyerAddress}
                    onChange={(e) => setForm({ ...form, buyerAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Line items</div>
                <Button variant="outline" size="sm" onClick={addLine}>
                  <RiAddLine className="size-4" />
                  Add line
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-16 text-right">Qty</TableHead>
                    <TableHead className="w-28 text-right">Unit £</TableHead>
                    <TableHead className="w-20 text-right">VAT %</TableHead>
                    <TableHead className="w-28 text-right">Total</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.lineItems.map((li) => (
                    <TableRow key={li.id}>
                      <TableCell>
                        <Input
                          value={li.description}
                          onChange={(e) => updateLine(li.id, { description: e.target.value })}
                          placeholder="Item description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={li.quantity}
                          onChange={(e) => updateLine(li.id, { quantity: Number(e.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={li.unitPrice}
                          onChange={(e) => updateLine(li.id, { unitPrice: Number(e.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={li.vatRate}
                          onChange={(e) => updateLine(li.id, { vatRate: Number(e.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatMoney(li.quantity * li.unitPrice)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => removeLine(li.id)}
                          aria-label="Remove line"
                        >
                          <RiDeleteBin6Line className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Custom fields */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Custom fields</div>
                <Button variant="outline" size="sm" onClick={addCustomField}>
                  <RiAddLine className="size-4" />
                  Add field
                </Button>
              </div>
              {form.customFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">No custom fields.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {form.customFields.map((f) => (
                    <div key={f.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Label"
                        value={f.label}
                        onChange={(e) => updateField(f.id, { label: e.target.value })}
                      />
                      <Input
                        placeholder="Value"
                        value={f.value}
                        onChange={(e) => updateField(f.id, { value: e.target.value })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => removeField(f.id)}
                        aria-label="Remove field"
                      >
                        <RiDeleteBin6Line className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals + payment */}
            <div className="rounded-md border p-3">
              <div className="mb-3 text-sm font-medium">Totals &amp; payment</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="inv-deposit">Deposit (£)</Label>
                  <Input
                    id="inv-deposit"
                    type="number"
                    value={form.deposit}
                    onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inv-paid">Amount paid (£)</Label>
                  <Input
                    id="inv-paid"
                    type="number"
                    value={form.amountPaid}
                    onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatMoney(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT</span>
                  <span className="font-mono">{formatMoney(totals.vatTotal)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-medium">
                  <span>Total</span>
                  <span className="font-mono">{formatMoney(totals.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-mono">
                    {formatMoney(totals.total - (Number(form.amountPaid) || 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inv-notes">Special notes</Label>
              <Textarea
                id="inv-notes"
                rows={3}
                value={form.specialNotes}
                onChange={(e) => setForm({ ...form, specialNotes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row items-center justify-between border-t sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            disabled={!invoice}
            className="gap-2"
          >
            <RiPrinterLine className="size-4" />
            Print
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={busy}>
              {busy ? "Saving…" : invoice ? "Save changes" : "Create invoice"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
