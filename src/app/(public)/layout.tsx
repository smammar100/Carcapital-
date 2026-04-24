"use client"

import { PublicFooter } from "@/components/marketing/public-footer"
import { PublicHeader } from "@/components/marketing/public-header"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // NOTE: The auth-context already owns the cross-route redirect logic:
  //   - authenticated + onboarded  + visiting /register → /dashboard
  //   - authenticated + !onboarded                       → /onboarding/welcome
  // So this layout stays purely presentational.
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
