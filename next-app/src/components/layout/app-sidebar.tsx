"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ComponentType } from "react"
import {
  RiArrowDownSLine,
  RiBarChartBoxLine,
  RiBuilding2Line,
  RiCarFill,
  RiCarLine,
  RiCustomerService2Line,
  RiDashboardLine,
  RiHistoryLine,
  RiLightbulbLine,
  RiMegaphoneLine,
  RiShoppingBag3Line,
  RiStore2Line,
  RiToolsLine,
} from "@remixicon/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { APP_NAME } from "@/lib/constants"
import { useAuth } from "@/lib/auth-context"

interface NavChild {
  title: string
  href: string
}

interface NavEntry {
  title: string
  href?: string
  icon: ComponentType<{ className?: string }>
  children?: NavChild[]
}

const NAV: NavEntry[] = [
  { title: "Dashboard", href: "/dashboard", icon: RiDashboardLine },
  {
    title: "Administrative",
    icon: RiBuilding2Line,
    children: [
      { title: "Master Sheet", href: "/admin/master-sheet" },
      { title: "Settings", href: "/admin/settings" },
    ],
  },
  {
    title: "Inventory",
    icon: RiCarLine,
    children: [
      { title: "All Vehicles", href: "/inventory" },
      { title: "Add Vehicle", href: "/inventory/new" },
      { title: "Inspections", href: "/inspections" },
    ],
  },
  { title: "Maintenance", href: "/maintenance", icon: RiToolsLine },
  {
    title: "Advert",
    icon: RiMegaphoneLine,
    children: [
      { title: "Listings", href: "/listings" },
      { title: "Photo Processing", href: "/listings/photos" },
    ],
  },
  { title: "Service", href: "/workshop", icon: RiCustomerService2Line },
  {
    title: "Sales",
    icon: RiShoppingBag3Line,
    children: [
      { title: "Leads", href: "/leads" },
      { title: "Appointments", href: "/appointments" },
      { title: "Pipeline", href: "/sales" },
      { title: "Invoicing", href: "/invoicing" },
      { title: "Warranties", href: "/warranties" },
    ],
  },
  { title: "Insights", href: "/insights", icon: RiLightbulbLine },
  { title: "Activity Log", href: "/activity", icon: RiHistoryLine },
  { title: "Vendors", href: "/vendors", icon: RiStore2Line },
]

function isHrefActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { currentUser, currentCompany } = useAuth()

  // Initially expand any group whose child matches the current route.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {}
    for (const entry of NAV) {
      if (entry.children && entry.children.some((c) => isHrefActive(pathname, c.href))) {
        next[entry.title] = true
      }
    }
    return next
  })

  const toggle = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <RiCarFill className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{APP_NAME}</span>
            <span className="truncate text-xs text-muted-foreground">
              {currentCompany?.name ?? "—"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((entry) => {
                const Icon = entry.icon
                if (entry.children) {
                  const isOpen = !!expanded[entry.title]
                  const anyChildActive = entry.children.some((c) =>
                    isHrefActive(pathname, c.href),
                  )
                  return (
                    <SidebarMenuItem key={entry.title}>
                      <SidebarMenuButton
                        isActive={anyChildActive && !isOpen}
                        onClick={() => toggle(entry.title)}
                        aria-expanded={isOpen}
                      >
                        <Icon className="size-4" />
                        <span>{entry.title}</span>
                        <RiArrowDownSLine
                          className={`ml-auto size-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                      {isOpen && (
                        <SidebarMenuSub>
                          {entry.children.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isHrefActive(pathname, child.href)}
                              >
                                <Link href={child.href}>
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                }
                const href = entry.href ?? "#"
                return (
                  <SidebarMenuItem key={entry.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isHrefActive(pathname, href)}
                    >
                      <Link href={href}>
                        <Icon className="size-4" />
                        <span>{entry.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground">
          <div className="flex size-7 items-center justify-center rounded-full bg-muted font-medium text-foreground">
            {currentUser?.name.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "–"}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {currentUser?.name ?? "Not signed in"}
            </span>
            {currentUser?.email && (
              <span className="truncate">{currentUser.email}</span>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
