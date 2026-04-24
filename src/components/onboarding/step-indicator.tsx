import { RiCheckLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

export interface OnboardingStep {
  key: string
  label: string
}

export function StepIndicator({
  steps,
  currentIndex,
}: {
  steps: OnboardingStep[]
  currentIndex: number
}) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((step, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                isDone && "border-primary bg-primary text-primary-foreground",
                isActive && "border-primary text-primary",
                !isDone && !isActive && "border-border text-muted-foreground",
              )}
              aria-current={isActive ? "step" : undefined}
            >
              {isDone ? <RiCheckLine className="size-4" /> : i + 1}
            </div>
            <div className="hidden min-w-0 flex-col sm:flex">
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  "ml-1 h-px flex-1",
                  isDone ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
