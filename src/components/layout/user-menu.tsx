"use client"

import { useTheme } from "next-themes"
import { RiLogoutBoxRLine, RiMoonLine, RiSunLine, RiUser3Line } from "@remixicon/react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

export function UserMenu() {
  const { currentUser, currentCompany, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  if (!currentUser) return null
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start text-left sm:flex">
            <span className="text-sm font-medium leading-none">
              {currentUser.name}
            </span>
            {currentUser.email && (
              <span className="text-xs text-muted-foreground">
                {currentUser.email}
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{currentUser.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {currentCompany?.name}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <RiUser3Line className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? (
            <RiSunLine className="size-4" />
          ) : (
            <RiMoonLine className="size-4" />
          )}
          Toggle theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} variant="destructive">
          <RiLogoutBoxRLine className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
