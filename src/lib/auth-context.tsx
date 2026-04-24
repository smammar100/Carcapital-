"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

import {
  onboardingService,
  type OnboardingFinishInput,
} from "./services/onboarding-service"
import {
  registrationService,
  type RegistrationInput,
} from "./services/registration-service"
import { companiesService, usersService } from "./services/users-service"
import type { Company, User } from "./types"

const STORAGE_KEY = "cc-uk-auth-user-id"

interface AuthState {
  currentUser: User | null
  currentCompany: Company | null
  isInitialised: boolean
  isLoading: boolean
  login: (email: string) => Promise<User | null>
  logout: () => void
  register: (input: RegistrationInput) => Promise<{ company: Company; user: User }>
  completeOnboarding: (patch?: OnboardingFinishInput) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [isInitialised, setIsInitialised] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      const storedId = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
      if (storedId) {
        const user = await usersService.getById(storedId)
        if (cancelled) return
        if (user) {
          const company = await companiesService.getById(user.companyId)
          if (cancelled) return
          setCurrentUser(user)
          setCurrentCompany(company ?? null)
        }
      }
      if (!cancelled) setIsInitialised(true)
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (email: string) => {
      setIsLoading(true)
      const user = await usersService.findByEmail(email)
      if (!user) {
        setIsLoading(false)
        return null
      }
      const company = await companiesService.getById(user.companyId)
      setCurrentUser(user)
      setCurrentCompany(company ?? null)
      window.localStorage.setItem(STORAGE_KEY, user.id)
      setIsLoading(false)
      return user
    },
    [],
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setCurrentCompany(null)
    window.localStorage.removeItem(STORAGE_KEY)
    router.push("/login")
  }, [router])

  const register = useCallback(
    async (input: RegistrationInput) => {
      setIsLoading(true)
      try {
        const { company, user } = await registrationService.create(input)
        setCurrentUser(user)
        setCurrentCompany(company)
        window.localStorage.setItem(STORAGE_KEY, user.id)
        return { company, user }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const completeOnboarding = useCallback(
    async (patch: OnboardingFinishInput = {}) => {
      if (!currentUser || !currentCompany) return
      setIsLoading(true)
      try {
        const { company, user } = await onboardingService.finish(
          currentCompany.id,
          currentUser.id,
          patch,
        )
        if (user) setCurrentUser(user)
        if (company) setCurrentCompany(company)
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser, currentCompany],
  )

  const refreshSession = useCallback(async () => {
    if (!currentUser) return
    const user = await usersService.getById(currentUser.id)
    if (user) {
      const company = await companiesService.getById(user.companyId)
      setCurrentUser(user)
      setCurrentCompany(company ?? null)
    }
  }, [currentUser])

  useEffect(() => {
    if (!isInitialised) return
    const onDashboard = pathname?.startsWith("/dashboard")
    const onOnboarding = pathname?.startsWith("/onboarding")
    const onRegister = pathname?.startsWith("/register")

    if (!currentUser && (onDashboard || onOnboarding)) {
      router.replace("/login")
      return
    }

    if (currentUser) {
      if (!currentUser.onboardingComplete && !onOnboarding) {
        router.replace("/onboarding/welcome")
        return
      }
      if (currentUser.onboardingComplete && (onOnboarding || onRegister)) {
        router.replace("/dashboard")
        return
      }
    }
  }, [isInitialised, currentUser, pathname, router])

  const value = useMemo<AuthState>(
    () => ({
      currentUser,
      currentCompany,
      isInitialised,
      isLoading,
      login,
      logout,
      register,
      completeOnboarding,
      refreshSession,
    }),
    [
      currentUser,
      currentCompany,
      isInitialised,
      isLoading,
      login,
      logout,
      register,
      completeOnboarding,
      refreshSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
