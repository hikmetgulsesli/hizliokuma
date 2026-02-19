"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, Trophy, Plus, Pencil, Trash2, Target, Medal, Flame, X } from "lucide-react"

// Reward type from API
interface Reward {
  id: number
  title: string
  description: string | null
  type: string
  threshold: number
  icon: string | null
  created_at: string
  updated_at: string
}

// API response types
interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
  }
}

interface ApiError {
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
}

// Type for reward form
interface RewardFormData {
  title: string
  description: string
  type: string
  threshold: number
  icon: string
}

// Map reward types to icons
const typeIcons: Record<string, React.ReactNode> = {
  points: <Target className="h-5 w-5" />,
  medal: <Medal className="h-5 w-5" />,
  streak: <Flame className="h-5 w-5" />,
}

// Map reward types to colors
const typeColors: Record<string, string> = {
  points: "bg-blue-500/10 text-blue-600",
  medal: "bg-amber-500/10 text-amber-600",
  streak: "bg-orange-500/10 text-orange-600",
}

export default function RewardsPage() {
  const [rewards, setRewards] = React.useState<Reward[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingReward, setEditingReward] = React.useState<Reward | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<number | null>(null)

  const fetchRewards = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/rewards")

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error?.message || "Failed to fetch rewards")
      }

      const result: ApiResponse<Reward[]> = await response.json()
      setRewards(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch rewards on mount
  React.useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  const handleAddReward = () => {
    setEditingReward(null)
    setIsModalOpen(true)
  }

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setIsModalOpen(true)
  }

  const handleDeleteReward = async (id: number) => {
    try {
      const response = await fetch(`/api/rewards/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error?.message || "Failed to delete reward")
      }

      setRewards((prev) => prev.filter((r) => r.id !== id))
      setDeleteConfirmId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete reward")
    }
  }

  const handleSubmit = async (formData: RewardFormData) => {
    setIsSubmitting(true)

    try {
      if (editingReward) {
        // Update existing reward
        const response = await fetch(`/api/rewards/${editingReward.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData: ApiError = await response.json()
          throw new Error(errorData.error?.message || "Failed to update reward")
        }

        const result: ApiResponse<Reward> = await response.json()
        setRewards((prev) =>
          prev.map((r) => (r.id === editingReward.id ? result.data : r))
        )
      } else {
        // Create new reward
        const response = await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData: ApiError = await response.json()
          throw new Error(errorData.error?.message || "Failed to create reward")
        }

        const result: ApiResponse<Reward> = await response.json()
        setRewards((prev) => [...prev, result.data])
      }

      setIsModalOpen(false)
      setEditingReward(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Ödüller
            </h1>
            <p className="text-muted-foreground">
              Ödül sistemini ve kazanımları yönetin.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRewards}
              disabled={loading}
              className="cursor-pointer"
              aria-label="Refresh rewards list"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </Button>
            <Button
              size="sm"
              onClick={handleAddReward}
              className="cursor-pointer"
              aria-label="Add new reward"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ödül Ekle
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : rewards.length === 0 ? (
          <EmptyState onAdd={handleAddReward} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onEdit={() => handleEditReward(reward)}
                onDelete={() => setDeleteConfirmId(reward.id)}
                isDeleting={deleteConfirmId === reward.id}
                onConfirmDelete={() => handleDeleteReward(reward.id)}
                onCancelDelete={() => setDeleteConfirmId(null)}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <RewardModal
          reward={editingReward}
          onClose={() => {
            setIsModalOpen(false)
            setEditingReward(null)
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </AdminLayout>
  )
}

interface RewardCardProps {
  reward: Reward
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

function RewardCard({
  reward,
  onEdit,
  onDelete,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
}: RewardCardProps) {
  const typeIcon = typeIcons[reward.type] || <Trophy className="h-5 w-5" />
  const typeColor = typeColors[reward.type] || "bg-primary/10 text-primary"

  return (
    <div className="rounded-xl border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2 ${typeColor}`}>
          {typeIcon}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Edit ${reward.title}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Delete ${reward.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="mt-4 font-heading text-lg font-semibold">{reward.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {reward.description || "Açıklama yok"}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
          {reward.type}
        </span>
        <span className="text-sm text-muted-foreground">
          Eşik: <span className="font-mono tabular-nums font-medium">{reward.threshold}</span>
        </span>
      </div>

      {isDeleting && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">Bu ödülü silmek istediğinize emin misiniz?</p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={onConfirmDelete}
              className="cursor-pointer"
            >
              Evet, Sil
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelDelete}
              className="cursor-pointer"
            >
              İptal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface RewardModalProps {
  reward: Reward | null
  onClose: () => void
  onSubmit: (data: RewardFormData) => void
  isSubmitting: boolean
}

function RewardModal({ reward, onClose, onSubmit, isSubmitting }: RewardModalProps) {
  const [formData, setFormData] = React.useState<RewardFormData>({
    title: reward?.title || "",
    description: reward?.description || "",
    type: reward?.type || "points",
    threshold: reward?.threshold || 0,
    icon: reward?.icon || "",
  })
  const [errors, setErrors] = React.useState<Partial<Record<keyof RewardFormData, string>>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<Record<keyof RewardFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Başlık gereklidir"
    }

    if (!formData.type.trim()) {
      newErrors.type = "Tür gereklidir"
    }

    if (formData.threshold < 0) {
      newErrors.threshold = "Eşik değeri negatif olamaz"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 id="reward-modal-title" className="font-heading text-xl font-semibold">
            {reward ? "Ödül Düzenle" : "Yeni Ödül Ekle"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Başlık <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-sm text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Açıklama
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium">
              Tür <span className="text-destructive">*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              aria-invalid={!!errors.type}
              aria-describedby={errors.type ? "type-error" : undefined}
            >
              <option value="points">Puan</option>
              <option value="medal">Madalya</option>
              <option value="streak">Seri</option>
            </select>
            {errors.type && (
              <p id="type-error" className="mt-1 text-sm text-destructive">
                {errors.type}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="threshold" className="block text-sm font-medium">
              Eşik Değeri <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              id="threshold"
              min={0}
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value, 10) || 0 })}
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={!!errors.threshold}
              aria-describedby={errors.threshold ? "threshold-error" : undefined}
            />
            {errors.threshold && (
              <p id="threshold-error" className="mt-1 text-sm text-destructive">
                {errors.threshold}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? "Kaydediliyor..." : reward ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
            <div className="flex gap-1">
              <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
          <div className="mt-4 h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-4 flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  onAdd: () => void
}

function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Trophy className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Henüz ödül yok</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Ödül sistemi oluşturmak için ilk ödülünüzü ekleyin.
      </p>
      <Button onClick={onAdd} className="cursor-pointer">
        <Plus className="mr-2 h-4 w-4" />
        İlk Ödülü Ekle
      </Button>
    </div>
  )
}
