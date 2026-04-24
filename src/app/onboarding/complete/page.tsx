"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { RiCarFill, RiCheckboxCircleLine, RiRocketLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"

export default function OnboardingCompletePage() {
  const router = useRouter()
  const { currentCompany, completeOnboarding } = useAuth()
  const [finishing, setFinishing] = useState(false)

  async function finish() {
    setFinishing(true)
    try {
      await completeOnboarding()
      toast.success("You're all set up!")
      router.replace("/dashboard")
    } catch {
      toast.error("Something went wrong finishing setup.")
      setFinishing(false)
    }
  }

  return (
    <OnboardingShell
      title="You're all set up!"
      description={
        currentCompany
          ? `${currentCompany.name} is ready to roll.`
          : "Your dealership is ready to roll."
      }
      footer={
        <>
          <span className="text-sm text-muted-foreground">
            You can change any of this later from Settings.
          </span>
          <Button onClick={finish} disabled={finishing}>
            {finishing ? <Spinner className="size-4" /> : <RiRocketLine className="size-4" />}
            Go to dashboard
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RiCheckboxCircleLine className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Workspace ready</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Your next step: add your first vehicle. Most dealers start by importing
            three or four of their highest-value cars to see how the system feels.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border/60 bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <RiCarFill className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-medium">Add your first vehicle</div>
            <div className="text-sm text-muted-foreground">
              Registration, mileage, purchase price — takes under a minute.
            </div>
          </div>
        </div>
      </div>
    </OnboardingShell>
  )
}
