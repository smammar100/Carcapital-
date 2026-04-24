"use client"

import { useEffect, useState } from "react"
import {
  RiCameraLine,
  RiImageEditLine,
  RiImageLine,
  RiSparkling2Line,
  RiUploadCloud2Line,
} from "@remixicon/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { EntityCombobox } from "@/components/shared/entity-combobox"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { BACKGROUND_GALLERY } from "@/lib/constants"
import { stockService } from "@/lib/services/stock-service"
import { cn } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"

export default function PhotoProcessingPage() {
  const { currentUser, currentCompany } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleId, setVehicleId] = useState<string | undefined>()
  const [uploaded, setUploaded] = useState<string[]>([])
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_GALLERY[0].id)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!currentUser || !currentCompany) return
    stockService
      .list({ companyId: currentCompany.id, userId: currentUser.id, userName: currentUser.name })
      .then(setVehicles)
  }, [currentUser, currentCompany])

  function handleFiles(files: FileList | null) {
    if (!files) return
    const names = Array.from(files).map((f) => f.name)
    setUploaded((prev) => [...prev, ...names])
    toast.success(`${names.length} file${names.length === 1 ? "" : "s"} queued (demo-only — no upload)`)
  }

  function handleProcess() {
    if (!vehicleId) {
      toast.error("Pick a vehicle first")
      return
    }
    if (uploaded.length === 0) {
      toast.error("Upload at least one photo")
      return
    }
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      toast.success("Would call remove.bg API + composite onto selected background — mocked")
    }, 800)
  }

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
    description: `${v.stockId} · ${v.registration}`,
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Photo studio"
        subtitle="Background removal + studio backdrop composite. Demo-only stub for the remove.bg integration."
        actions={
          <Badge variant="outline" className="gap-1.5">
            <RiSparkling2Line className="size-3.5" />
            Mock
          </Badge>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Pick a vehicle</CardTitle>
          <CardDescription>Photos attach to the vehicle's photo set on upload.</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <EmptyState
              icon={RiCameraLine}
              title="No vehicles in stock"
              description="Add one on /inventory/new before running the photo studio."
            />
          ) : (
            <div className="max-w-md">
              <EntityCombobox
                value={vehicleId}
                onChange={setVehicleId}
                options={vehicleOptions}
                placeholder="Pick a vehicle"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Upload source photos</CardTitle>
          <CardDescription>Drag-drop or pick files. Stub — no real upload.</CardDescription>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="photos-upload"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center hover:bg-muted/40"
          >
            <RiUploadCloud2Line className="size-8 text-muted-foreground" />
            <div className="text-sm font-medium">Drop images here, or click to browse</div>
            <div className="text-xs text-muted-foreground">PNG or JPG — max 10MB each</div>
            <input
              id="photos-upload"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          {uploaded.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {uploaded.map((name, i) => (
                <li key={`${name}-${i}`} className="rounded-md border bg-muted/40 px-2 py-1 text-xs">
                  {name}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">3. Pick a backdrop</CardTitle>
          <CardDescription>15 studio backdrops. Click to preview.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {BACKGROUND_GALLERY.map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => setSelectedBg(bg.id)}
                className={cn(
                  "group flex flex-col gap-1 rounded-md border p-2 text-xs transition-colors hover:bg-muted/60",
                  selectedBg === bg.id
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border",
                )}
              >
                <div className="flex aspect-video items-center justify-center rounded-sm bg-gradient-to-br from-muted to-muted-foreground/30 text-muted-foreground">
                  <RiImageLine className="size-5" />
                </div>
                <span className="truncate">{bg.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">4. Process</CardTitle>
          <CardDescription>
            In production this runs remove.bg + composites your car on the selected backdrop.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {uploaded.length} photo{uploaded.length === 1 ? "" : "s"} ·{" "}
            {BACKGROUND_GALLERY.find((b) => b.id === selectedBg)?.label}
          </div>
          <Button onClick={handleProcess} disabled={processing}>
            <RiImageEditLine className="size-4" />
            {processing ? "Processing…" : "Process photos"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
