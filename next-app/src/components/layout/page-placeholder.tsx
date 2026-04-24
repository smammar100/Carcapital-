import type { ComponentType, ReactNode } from "react"
import { RiBuilding2Line } from "@remixicon/react"

import { Card, CardContent } from "@/components/ui/card"

interface PagePlaceholderProps {
  title: string
  subtitle: string
  icon?: ComponentType<{ className?: string }>
  children?: ReactNode
}

export function PagePlaceholder({
  title,
  subtitle,
  icon: Icon = RiBuilding2Line,
  children,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </div>
          <div className="text-sm font-medium">Coming soon</div>
          <p className="max-w-md text-sm text-muted-foreground">
            {children ??
              "This area is wired into the sidebar but the experience hasn't been built yet. Pick this page as the next build-out target."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
