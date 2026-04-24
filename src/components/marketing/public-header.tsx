"use client"

import Link from "next/link"
import { RiCarFill } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/constants"

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <RiCarFill className="size-6 text-primary" />
          <span>{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
