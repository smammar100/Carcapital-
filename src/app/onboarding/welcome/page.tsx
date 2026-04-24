"use client"

import Link from "next/link"
import {
  RiArrowRightLine,
  RiCarFill,
  RiClipboardLine,
  RiUserStarLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { useAuth } from "@/lib/auth-context"

const CHECKLIST = [
  {
    icon: RiCarFill,
    title: "Confirm your dealership details",
    body: "Address, opening hours, VAT — five quick fields.",
  },
  {
    icon: RiClipboardLine,
    title: "Set workspace preferences",
    body: "Stock-ID prefix, default finance provider, appointment length.",
  },
  {
    icon: RiUserStarLine,
    title: "Invite your team (optional)",
    body: "Bring in your sales, finance and mechanic teams. You can do this later too.",
  },
]

export default function OnboardingWelcomePage() {
  const { currentUser, currentCompany } = useAuth()

  return (
    <OnboardingShell
      title={`Welcome${currentUser ? `, ${currentUser.name.split(" ")[0]}` : ""}!`}
      description={
        currentCompany
          ? `Let's get ${currentCompany.name} set up in a few minutes.`
          : "Let's get your dealership set up in a few minutes."
      }
      footer={
        <>
          <span className="text-sm text-muted-foreground">Takes under 5 minutes.</span>
          <Button asChild>
            <Link href="/onboarding/company-details">
              Let&apos;s go
              <RiArrowRightLine className="size-4" />
            </Link>
          </Button>
        </>
      }
    >
      <ul className="flex flex-col gap-4">
        {CHECKLIST.map((item) => (
          <li
            key={item.title}
            className="flex items-start gap-3 rounded-md border border-border/60 bg-background p-4"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <item.icon className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-muted-foreground">{item.body}</div>
            </div>
          </li>
        ))}
      </ul>
    </OnboardingShell>
  )
}
