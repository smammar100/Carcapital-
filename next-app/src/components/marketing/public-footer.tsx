import Link from "next/link"

import { APP_NAME } from "@/lib/constants"

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          © {new Date().getFullYear()} {APP_NAME}. Demo product — not an FCA-regulated service.
        </div>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-foreground">
            Register
          </Link>
          <span className="hover:text-foreground">Terms</span>
          <span className="hover:text-foreground">Privacy</span>
        </nav>
      </div>
    </footer>
  )
}
