"use client"

import { RiSearchLine } from "@remixicon/react"

import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { DemoDataMenu } from "./demo-data-menu"
import { NotificationBell } from "./notification-bell"
import { UserMenu } from "./user-menu"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <div className="relative hidden flex-1 max-w-md md:block">
        <RiSearchLine className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search stock, leads, sales…" className="h-8 pl-8" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <DemoDataMenu />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
