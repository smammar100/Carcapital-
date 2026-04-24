"use client"

import type { ReactNode } from "react"
import { RiMore2Fill } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function RowActionsMenu({
  children,
  align = "end",
}: {
  children: ReactNode
  align?: "start" | "center" | "end"
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 data-[state=open]:bg-muted"
          aria-label="Row actions"
        >
          <RiMore2Fill className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
