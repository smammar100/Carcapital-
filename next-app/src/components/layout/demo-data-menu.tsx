"use client"

import { useState } from "react"
import { RiDatabase2Line, RiRefreshLine, RiSparklingLine } from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { loadDemoData, resetTenant } from "@/lib/demo-seed"
import { persistAllSync } from "@/lib/persistence"

export function DemoDataMenu() {
  const { currentCompany } = useAuth()
  const [busy, setBusy] = useState<"load" | "reset" | null>(null)

  const enabled = process.env.NEXT_PUBLIC_DEMO_CONTROLS !== "false"
  if (!enabled || !currentCompany) return null

  async function handleLoad() {
    if (!currentCompany) return
    setBusy("load")
    try {
      loadDemoData(currentCompany.id)
      // Flush synchronously so the seeded rows survive the page reload below.
      persistAllSync()
      toast.success("Demo data loaded — reloading…")
      // Mutable mock arrays don't trigger re-renders; hard reload so every
      // client-component effect re-runs and picks up the seeded rows.
      setTimeout(() => window.location.reload(), 400)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load demo data")
      setBusy(null)
    }
  }

  async function handleReset() {
    if (!currentCompany) return
    const ok = window.confirm(
      "Wipe every vehicle, lead, warranty and invoice for this tenant? This cannot be undone.",
    )
    if (!ok) return
    setBusy("reset")
    try {
      resetTenant(currentCompany.id)
      persistAllSync()
      toast.success("Tenant reset — reloading…")
      setTimeout(() => window.location.reload(), 400)
    } catch (err) {
      console.error(err)
      toast.error("Failed to reset tenant")
      setBusy(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <RiSparklingLine className="size-4" />
          <span className="hidden sm:inline">Demo data</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Demo controls</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLoad} disabled={busy !== null}>
          <RiDatabase2Line className="size-4" />
          {busy === "load" ? "Loading…" : "Load demo data"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleReset}
          disabled={busy !== null}
          variant="destructive"
        >
          <RiRefreshLine className="size-4" />
          {busy === "reset" ? "Resetting…" : "Reset tenant"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
