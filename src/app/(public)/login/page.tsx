"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { RiCarFill, RiLoginCircleLine, RiUserAddLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { APP_NAME } from "@/lib/constants"
import { useAuth } from "@/lib/auth-context"
import { mockCompanies, mockUsers } from "@/lib/mock-data"

export default function LoginPage() {
  const router = useRouter()
  const { currentUser, isInitialised, login, isLoading } = useAuth()
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (!isInitialised || !currentUser) return
    router.replace(currentUser.onboardingComplete ? "/dashboard" : "/onboarding/welcome")
  }, [currentUser, isInitialised, router])

  const usersByCompany = useMemo(() => {
    return mockCompanies
      .map((c) => ({
        company: c,
        users: mockUsers.filter((u) => u.companyId === c.id),
      }))
      .filter((group) => group.users.length > 0)
  }, [])

  const hasRegisteredUsers = usersByCompany.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      toast.error("Enter your email to continue")
      return
    }
    const user = await login(email)
    if (user) {
      toast.success(`Welcome, ${user.name}`)
      router.replace(user.onboardingComplete ? "/dashboard" : "/onboarding/welcome")
    } else {
      toast.error("No dealership found with that email. Register to get started.")
    }
  }

  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      <div className="relative hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <RiCarFill className="size-6" />
          {APP_NAME}
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight">
            One platform for your entire dealership.
          </h1>
          <p className="text-primary-foreground/80">
            Stock, inspections, leads, sales, finance and aftersales — replacing the
            spreadsheets, WhatsApp groups and paper pads you use today.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-primary-foreground/80">
            <li>• 20-point digital inspection</li>
            <li>• Pipeline & lead tracking</li>
            <li>• Finance applications & payouts</li>
            <li>• Service jobs & scheduling</li>
          </ul>
        </div>
        <div className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Car Capital UK
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              {hasRegisteredUsers
                ? "Sign in to your dealership. Demo mode — no password required."
                : "No dealerships registered yet on this device. Register to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasRegisteredUsers ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="user-select">Quick sign-in</Label>
                  <Select value={email} onValueChange={setEmail}>
                    <SelectTrigger id="user-select">
                      <SelectValue placeholder="Choose a dealership…" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersByCompany.map(({ company, users }) => (
                        <SelectGroup key={company.id}>
                          <SelectLabel>{company.name}</SelectLabel>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.email}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="mt-2">
                  {isLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <RiLoginCircleLine className="size-4" />
                  )}
                  Continue
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  New dealership?{" "}
                  <Link href="/register" className="font-medium text-primary hover:underline">
                    Register here
                  </Link>
                </p>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-md border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    You haven&apos;t registered a dealership yet. Spin one up — it takes
                    a minute, no card required.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/register">
                    <RiUserAddLine className="size-4" />
                    Register your dealership
                  </Link>
                </Button>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t pt-4">
                  <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Already registered? Sign in by email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" variant="outline" disabled={isLoading}>
                    {isLoading ? (
                      <Spinner className="size-4" />
                    ) : (
                      <RiLoginCircleLine className="size-4" />
                    )}
                    Continue
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
