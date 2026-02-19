"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, Users, Flame } from "lucide-react"

// User type from API
interface User {
  id: number
  name: string
  email: string
  level: number
  points: number
  streak_days: number
  created_at: string
  updated_at: string
}

// API response types
interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ApiError {
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/users")

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error?.message || "Failed to fetch users")
      }

      const result: ApiResponse<User[]> = await response.json()
      setUsers(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch users on mount
  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Kullanıcılar
            </h1>
            <p className="text-muted-foreground">
              Tüm kullanıcıları görüntüleyin ve yönetin.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="cursor-pointer"
            aria-label="Refresh users list"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-6">
            {error ? (
              <ErrorState message={error} onRetry={fetchUsers} />
            ) : loading ? (
              <LoadingSkeleton />
            ) : users.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Kullanıcı
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        E-posta
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Seviye
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Puan
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Seri Gün
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Kayıt Tarihi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

interface UserRowProps {
  user: User
}

function UserRow({ user }: UserRowProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const formattedDate = new Date(user.created_at).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </td>
      <td className="py-4">
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
          Seviye {user.level}
        </span>
      </td>
      <td className="py-4">
        <span className="font-mono text-sm tabular-nums">
          {user.points.toLocaleString("tr-TR")}
        </span>
      </td>
      <td className="py-4">
        <span className="inline-flex items-center gap-1 text-sm">
          <Flame className="h-4 w-4 text-amber-500" />
          {user.streak_days} gün
        </span>
      </td>
      <td className="py-4 text-sm text-muted-foreground">{formattedDate}</td>
    </tr>
  )
}

function LoadingSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
              Kullanıcı
            </th>
            <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
              E-posta
            </th>
            <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
              Seviye
            </th>
            <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
              Puan
            </th>
            <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
              Seri Gün
            </th>
            <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
              Kayıt Tarihi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </td>
              <td className="py-4">
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </td>
              <td className="py-4">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </td>
              <td className="py-4">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </td>
              <td className="py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Bir hata oluştu</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button
        onClick={onRetry}
        className="cursor-pointer"
        aria-label="Retry loading users"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Tekrar Dene
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Kullanıcı bulunamadı</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Henüz hiç kullanıcı kaydedilmemiş.
      </p>
    </div>
  )
}
