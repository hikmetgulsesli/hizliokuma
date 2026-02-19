"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Dumbbell,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  Filter
} from "lucide-react"

export interface Exercise {
  id: number
  title: string
  description: string | null
  type: string
  difficulty_levels: string
  duration_minutes: number
  is_active: number
  created_at: string
  updated_at: string
}

type FilterType = "all" | "active" | "inactive"

export default function ExercisesPage() {
  const [exercises, setExercises] = React.useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = React.useState<Exercise[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<FilterType>("all")
  const [togglingId, setTogglingId] = React.useState<number | null>(null)

  const fetchExercises = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/exercises")
      
      if (!response.ok) {
        throw new Error("Egzersizler yüklenirken bir hata oluştu")
      }
      
      const result = await response.json()
      setExercises(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  React.useEffect(() => {
    let filtered = exercises
    
    if (filter === "active") {
      filtered = exercises.filter((e) => e.is_active === 1)
    } else if (filter === "inactive") {
      filtered = exercises.filter((e) => e.is_active === 0)
    }
    
    setFilteredExercises(filtered)
  }, [exercises, filter])

  const toggleExerciseStatus = async (id: number, currentStatus: number) => {
    try {
      setTogglingId(id)
      
      const newStatus = currentStatus === 1 ? 0 : 1
      
      const response = await fetch(`/api/exercises?id=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error("Durum güncellenirken bir hata oluştu")
      }
      
      const result = await response.json()
      
      // Update local state
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === id ? result.data : exercise
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi")
    } finally {
      setTogglingId(null)
    }
  }

  const getExerciseTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      reading: "Okuma",
      word_recognition: "Kelime Tanıma",
      comprehension: "Anlama",
      eye_training: "Göz Egzersizi",
      scanning: "Tarama",
      focus: "Odaklanma",
      peripheral: "Periferik Görüş",
      mind_mapping: "Zihinsel Haritalama",
      chunking: "Kelime Grupları",
      subvocalization: "Sessiz Okuma",
      regression: "Regresyon Önleme",
      preview: "Önizleme",
    }
    return typeLabels[type] || type
  }

  const getDifficultyLabel = (levels: string): string => {
    const levelMap: Record<string, string> = {
      beginner: "Başlangıç",
      intermediate: "Orta",
      advanced: "İleri",
    }
    return levels
      .split(",")
      .map((l) => levelMap[l.trim()] || l.trim())
      .join(", ")
  }

  const activeCount = exercises.filter((e) => e.is_active === 1).length
  const inactiveCount = exercises.filter((e) => e.is_active === 0).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Egzersizler
            </h1>
            <p className="text-muted-foreground">
              Tüm hızlı okuma egzersizlerini yönetin.
            </p>
          </div>
          
          <button
            onClick={fetchExercises}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            aria-label="Egzersizleri yenile"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold" data-testid="total-count">{exercises.length}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold" data-testid="active-count">{activeCount}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pasif</p>
                <p className="text-2xl font-bold" data-testid="inactive-count">{inactiveCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label="Egzersizleri filtrele"
          >
            <option value="all">Tümü ({exercises.length})</option>
            <option value="active">Aktif ({activeCount})</option>
            <option value="inactive">Pasif ({inactiveCount})</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16" data-testid="loading-state">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Egzersizler yükleniyor...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16" data-testid="error-state">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-destructive">{error}</p>
            <button
              onClick={fetchExercises}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredExercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" data-testid="empty-state">
            <Dumbbell className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {filter === "all" 
                ? "Henüz egzersiz bulunmuyor." 
                : filter === "active" 
                  ? "Aktif egzersiz bulunmuyor." 
                  : "Pasif egzersiz bulunmuyor."}
            </p>
          </div>
        )}

        {/* Exercise Grid */}
        {!loading && !error && filteredExercises.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="exercise-grid">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onToggle={() => toggleExerciseStatus(exercise.id, exercise.is_active)}
                isToggling={togglingId === exercise.id}
                getExerciseTypeLabel={getExerciseTypeLabel}
                getDifficultyLabel={getDifficultyLabel}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

interface ExerciseCardProps {
  exercise: Exercise
  onToggle: () => void
  isToggling: boolean
  getExerciseTypeLabel: (type: string) => string
  getDifficultyLabel: (levels: string) => string
}

function ExerciseCard({ 
  exercise, 
  onToggle, 
  isToggling,
  getExerciseTypeLabel,
  getDifficultyLabel,
}: ExerciseCardProps) {
  return (
    <div 
      className={`rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-md ${
        exercise.is_active === 0 ? "opacity-60" : ""
      }`}
      data-testid={`exercise-card-${exercise.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg font-semibold truncate" title={exercise.title}>
            {exercise.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {exercise.description || "Açıklama yok"}
          </p>
        </div>
        
        <button
          onClick={onToggle}
          disabled={isToggling}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed cursor-pointer ${
            exercise.is_active === 1 
              ? "bg-emerald-500" 
              : "bg-muted"
          }`}
          role="switch"
          aria-checked={exercise.is_active === 1}
          aria-label={exercise.is_active === 1 ? "Egzersizi pasifleştir" : "Egzersizi aktifleştir"}
          data-testid={`toggle-${exercise.id}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              exercise.is_active === 1 ? "translate-x-6" : "translate-x-1"
            }`}
          />
          {isToggling && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            </span>
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <Layers className="h-3 w-3" />
          {getExerciseTypeLabel(exercise.type)}
        </span>
        
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
          <Clock className="h-3 w-3" />
          {exercise.duration_minutes} dk
        </span>
        
        <span 
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            exercise.is_active === 1 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-muted text-muted-foreground"
          }`}
          data-testid={`status-badge-${exercise.id}`}
        >
          {exercise.is_active === 1 ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              Aktif
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              Pasif
            </>
          )}
        </span>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Seviyeler: {getDifficultyLabel(exercise.difficulty_levels)}
      </div>
    </div>
  )
}
