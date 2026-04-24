"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiCarFill, RiLogoutBoxRLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { StepIndicator, type OnboardingStep } from "@/components/onboarding/step-indicator"
import { APP_NAME } from "@/lib/constants"
import { useAuth } from "@/lib/auth-context"

// NOTE: Wizard order. /welcome → /company-details → /preferences → /complete.
const STEPS: OnboardingStep[] = [
  { key: "welcome", label: "Welcome" },
  { key: "company-details", label: "Company" },
  { key: "preferences", label: "Preferences" },
  { key: "complete", label: "Done" },
]

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { currentUser, currentCompany, isInitialised, logout } = useAuth()

  // auth-context handles the redirect to /login or /dashboard; this is just a loading state
  if (!isInitialised || !currentUser) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  const currentSegment = pathname?.split("/").filter(Boolean)[1] ?? "welcome"
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === currentSegment),
  )

  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <RiCarFill className="size-6 text-primary" />
            <span>{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {currentCompany?.name ? (
              <span className="hidden sm:inline">{currentCompany.name}</span>
            ) : null}
            <Button variant="ghost" size="sm" onClick={logout}>
              <RiLogoutBoxRLine className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
          <StepIndicator steps={STEPS} currentIndex={currentIndex} />
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</div>
      </main>
    </div>
  )
}
