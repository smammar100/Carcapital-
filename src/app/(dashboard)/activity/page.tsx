"use client"

import { useEffect, useMemo, useState } from "react"
import { RiDownloadLine, RiHistoryLine } from "@remixicon/react"

import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { activityService } from "@/lib/services/activity-service"
import type {
  ActivityActionType,
  ActivityEntity,
  ActivityLogEntry,
} from "@/lib/types"
import { downloadCsv, toCsv } from "@/lib/utils/csv"
import { formatDateTime, formatRelative } from "@/lib/utils/format"

const ACTION_TYPES: { value: ActivityActionType | "all"; label: string }[] = [
  { value: "all", label: "All actions" },
  { value: "vehicle_created", label: "Vehicle created" },
  { value: "vehicle_updated", label: "Vehicle updated" },
  { value: "vehicle_status_changed", label: "Vehicle status changed" },
  { value: "inspection_check_saved", label: "Inspection saved" },
  { value: "todo_created", label: "Todo created" },
  { value: "todo_completed", label: "Todo completed" },
  { value: "listing_published", label: "Listing published" },
  { value: "lead_created", label: "Lead created" },
  { value: "lead_status_changed", label: "Lead status changed" },
  { value: "appointment_booked", label: "Appointment booked" },
  { value: "workshop_job_created", label: "Workshop job created" },
  { value: "workshop_job_completed", label: "Workshop job completed" },
  { value: "invoice_issued", label: "Invoice issued" },
  { value: "warranty_created", label: "Warranty created" },
  { value: "warranty_claim_filed", label: "Warranty claim" },
  { value: "auth_login", label: "Auth login" },
]

const ENTITY_TYPES: { value: ActivityEntity | "all"; label: string }[] = [
  { value: "all", label: "All entities" },
  { value: "vehicle", label: "Vehicle" },
  { value: "inspection", label: "Inspection" },
  { value: "todo", label: "Todo" },
  { value: "listing", label: "Listing" },
  { value: "lead", label: "Lead" },
  { value: "appointment", label: "Appointment" },
  { value: "workshop_job", label: "Workshop job" },
  { value: "invoice", label: "Invoice" },
  { value: "warranty", label: "Warranty" },
  { value: "warranty_claim", label: "Warranty claim" },
  { value: "user", label: "User" },
  { value: "auth", label: "Auth" },
]

export default function ActivityLogPage() {
  const { currentCompany } = useAuth()
  const [entries, setEntries] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actor, setActor] = useState<string>("all")
  const [actionType, setActionType] = useState<string>("all")
  const [entity, setEntity] = useState<string>("all")
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!currentCompany) return
      setLoading(true)
      const rows = await activityService.list(currentCompany.id, 500)
      if (!cancelled) {
        setEntries(rows)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentCompany])

  const actors = useMemo(() => {
    const seen = new Map<string, string>()
    for (const e of entries) seen.set(e.userId, e.userName)
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [entries])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (actor !== "all" && e.userId !== actor) return false
      if (actionType !== "all" && e.actionType !== actionType) return false
      if (entity !== "all" && e.entity !== entity) return false
      if (fromDate && new Date(e.createdAt) < new Date(fromDate)) return false
      if (toDate) {
        const end = new Date(toDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(e.createdAt) > end) return false
      }
      return true
    })
  }, [entries, actor, actionType, entity, fromDate, toDate])

  function exportCsv() {
    const csv = toCsv(filtered, [
      { header: "When", format: (r) => formatDateTime(r.createdAt) },
      { header: "Actor", format: (r) => r.userName },
      { header: "Action", format: (r) => r.actionType },
      { header: "Entity", format: (r) => r.entity },
      { header: "Entity ID", format: (r) => r.entityId },
      { header: "Summary", format: (r) => r.summary },
    ])
    downloadCsv(`activity-log-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Activity log"
        subtitle="Everything that happens across your tenant — vehicle changes, leads, invoices, and more."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <RiDownloadLine className="size-4" />
            Export CSV
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="grid gap-1.5">
              <Label className="text-xs">Actor</Label>
              <Select value={actor} onValueChange={setActor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actors</SelectItem>
                  {actors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Action</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Entity</Label>
              <Select value={entity} onValueChange={setEntity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="al-from" className="text-xs">From</Label>
              <Input id="al-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="al-to" className="text-xs">To</Label>
              <Input id="al-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
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
              icon={RiHistoryLine}
              title={entries.length === 0 ? "No activity yet" : "No activity matches these filters"}
              description={
                entries.length === 0
                  ? "As you and your team make changes, every action will show up here."
                  : "Try loosening the filters or choose a wider date range."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell title={formatDateTime(e.createdAt)} className="text-xs text-muted-foreground">
                      {formatRelative(e.createdAt)}
                    </TableCell>
                    <TableCell>{e.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {e.actionType.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.entity}</TableCell>
                    <TableCell className="whitespace-normal">{e.summary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
