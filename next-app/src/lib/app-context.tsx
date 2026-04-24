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

import { useAuth } from "./auth-context"
import { activityService } from "./services/activity-service"
import { notificationsService } from "./services/notifications-service"
import { activityStore } from "./services/shared"
import type { ActivityLogEntry, Notification } from "./types"

interface AppState {
  notifications: Notification[]
  unreadCount: number
  activityLog: ActivityLogEntry[]
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  refreshActivity: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser, currentCompany } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])

  const refreshNotifications = useCallback(async () => {
    if (!currentUser || !currentCompany) {
      setNotifications([])
      return
    }
    const rows = await notificationsService.listForUser(currentCompany.id, currentUser.id)
    setNotifications(rows)
  }, [currentUser, currentCompany])

  const refreshActivity = useCallback(async () => {
    if (!currentCompany) {
      setActivityLog([])
      return
    }
    const rows = await activityService.list(currentCompany.id, 50)
    setActivityLog(rows)
  }, [currentCompany])

  useEffect(() => {
    refreshNotifications()
    refreshActivity()
  }, [refreshNotifications, refreshActivity])

  useEffect(() => {
    if (!currentCompany) return
    const interval = setInterval(() => {
      const rows = activityStore
        .filter((r) => r.companyId === currentCompany.id)
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 50)
      setActivityLog(rows)
    }, 1500)
    return () => clearInterval(interval)
  }, [currentCompany])

  const markNotificationRead = useCallback(
    async (id: string) => {
      await notificationsService.markRead(id)
      await refreshNotifications()
    },
    [refreshNotifications],
  )

  const markAllNotificationsRead = useCallback(async () => {
    if (!currentUser || !currentCompany) return
    await notificationsService.markAllRead(currentCompany.id, currentUser.id)
    await refreshNotifications()
  }, [currentUser, currentCompany, refreshNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value = useMemo<AppState>(
    () => ({
      notifications,
      unreadCount,
      activityLog,
      markNotificationRead,
      markAllNotificationsRead,
      refreshActivity,
    }),
    [notifications, unreadCount, activityLog, markNotificationRead, markAllNotificationsRead, refreshActivity],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
