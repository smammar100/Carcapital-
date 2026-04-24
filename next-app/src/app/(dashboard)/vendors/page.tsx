"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RiAddLine, RiSearchLine, RiStore2Line } from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
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
import { VendorDialog } from "@/components/vendors/vendor-dialog"
import { useAuth } from "@/lib/auth-context"
import { VENDOR_KINDS } from "@/lib/constants"
import { vendorService } from "@/lib/services/vendor-service"
import type { Vendor } from "@/lib/types"

export default function VendorsPage() {
  const { currentUser, currentCompany } = useAuth()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [deleting, setDeleting] = useState<Vendor | null>(null)

  const load = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    setLoading(true)
    const rows = await vendorService.list({
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    })
    setVendors(rows)
    setLoading(false)
  }, [currentUser, currentCompany])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return vendors
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.contactName?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.phone?.toLowerCase().includes(q),
    )
  }, [vendors, search])

  async function handleDelete() {
    if (!deleting || !currentUser || !currentCompany) return
    const ctx = {
      companyId: currentCompany.id,
      userId: currentUser.id,
      userName: currentUser.name,
    }
    await vendorService.delete(ctx, deleting.id)
    toast.success(`Removed ${deleting.name}`)
    setDeleting(null)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendors"
        subtitle="Mechanics, bodyshops, valeters — your supplier directory."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <RiAddLine className="size-4" />
            New vendor
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <RiSearchLine className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {loading ? "" : `${filtered.length} vendor${filtered.length === 1 ? "" : "s"}`}
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
              icon={RiStore2Line}
              title={vendors.length === 0 ? "No vendors yet" : "No vendors match your search"}
              description={
                vendors.length === 0
                  ? "Add the suppliers you work with to assign them to todos and workshop jobs."
                  : "Try a different search term."
              }
              action={
                vendors.length === 0 ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditing(null)
                      setDialogOpen(true)
                    }}
                  >
                    <RiAddLine className="size-4" />
                    Add first vendor
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {VENDOR_KINDS.find((k) => k.value === v.kind)?.label ?? v.kind}
                      </Badge>
                    </TableCell>
                    <TableCell>{v.contactName ?? "—"}</TableCell>
                    <TableCell>{v.phone ?? "—"}</TableCell>
                    <TableCell className="truncate max-w-[12rem]">{v.email ?? "—"}</TableCell>
                    <TableCell>
                      <RowActionsMenu>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(v)
                            setDialogOpen(true)
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
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
          )}
        </CardContent>
      </Card>

      <VendorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendor={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "vendor"}?`}
        description="This vendor will be removed from your directory. Any todos assigned to them will show as unassigned."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
