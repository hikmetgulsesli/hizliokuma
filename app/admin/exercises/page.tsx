"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

interface Exercise {
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

interface ExerciseFormData {
  title: string
  description: string
  type: string
  difficulty_levels: string
  duration_minutes: string
  is_active: boolean
}

const initialFormData: ExerciseFormData = {
  title: "",
  description: "",
  type: "",
  difficulty_levels: "",
  duration_minutes: "",
  is_active: true,
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<ExerciseFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/exercises")
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to fetch exercises")
      }
      
      setExercises(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      errors.title = "Başlık gereklidir"
    }
    
    if (!formData.type.trim()) {
      errors.type = "Tür gereklidir"
    }
    
    if (!formData.difficulty_levels.trim()) {
      errors.difficulty_levels = "Zorluk seviyeleri gereklidir"
    }
    
    if (formData.duration_minutes) {
      const duration = parseInt(formData.duration_minutes, 10)
      if (isNaN(duration) || duration < 0) {
        errors.duration_minutes = "Geçerli bir süre giriniz"
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    try {
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : 0,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        if (result.error?.details) {
          const fieldErrors: Record<string, string> = {}
          result.error.details.forEach((detail: { field: string; message: string }) => {
            fieldErrors[detail.field] = detail.message
          })
          setFormErrors(fieldErrors)
        }
        throw new Error(result.error?.message || "Failed to create exercise")
      }
      
      setSubmitSuccess("Egzersiz başarıyla oluşturuldu")
      setTimeout(() => {
        setIsCreateModalOpen(false)
        resetForm()
        fetchExercises()
      }, 1500)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !selectedExercise) return
    
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    try {
      const response = await fetch(`/api/exercises?id=${selectedExercise.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : 0,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        if (result.error?.details) {
          const fieldErrors: Record<string, string> = {}
          result.error.details.forEach((detail: { field: string; message: string }) => {
            fieldErrors[detail.field] = detail.message
          })
          setFormErrors(fieldErrors)
        }
        throw new Error(result.error?.message || "Failed to update exercise")
      }
      
      setSubmitSuccess("Egzersiz başarıyla güncellendi")
      setTimeout(() => {
        setIsEditModalOpen(false)
        resetForm()
        setSelectedExercise(null)
        fetchExercises()
      }, 1500)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedExercise) return
    
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const response = await fetch(`/api/exercises?id=${selectedExercise.id}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to delete exercise")
      }
      
      setIsDeleteModalOpen(false)
      setSelectedExercise(null)
      fetchExercises()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setFormData({
      title: exercise.title,
      description: exercise.description || "",
      type: exercise.type,
      difficulty_levels: exercise.difficulty_levels,
      duration_minutes: exercise.duration_minutes?.toString() || "",
      is_active: exercise.is_active === 1,
    })
    setFormErrors({})
    setSubmitError(null)
    setSubmitSuccess(null)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setSubmitError(null)
    setIsDeleteModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchExercises} className="mt-4" variant="outline">
            Tekrar Dene
          </Button>
        </div>
      </AdminLayout>
    )
  }

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
          <Button onClick={openCreateModal} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Egzersiz
          </Button>
        </div>

        {exercises.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Henüz egzersiz bulunmuyor.</p>
            <Button onClick={openCreateModal} className="mt-4 cursor-pointer" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              İlk Egzersizi Ekle
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-lg font-semibold">{exercise.title}</h3>
                      {exercise.is_active ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                          Pasif
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {exercise.description || "Açıklama yok"}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded-full bg-secondary px-2 py-1">
                        {exercise.difficulty_levels}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-1">
                        {exercise.type}
                      </span>
                      {exercise.duration_minutes > 0 && (
                        <span className="text-muted-foreground">
                          {exercise.duration_minutes} dk
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(exercise)}
                      className="cursor-pointer"
                      aria-label="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteModal(exercise)}
                      className="cursor-pointer text-destructive hover:text-destructive"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        {isCreateModalOpen && (
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Yeni Egzersiz Ekle</DialogTitle>
              <DialogDescription>
                Yeni bir hızlı okuma egzersizi oluşturun.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Egzersiz başlığı"
                  className={formErrors.title ? "border-destructive" : ""}
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive">{formErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Egzersiz açıklaması"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tür *</Label>
                  <Input
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Örn: reading"
                    className={formErrors.type ? "border-destructive" : ""}
                  />
                  {formErrors.type && (
                    <p className="text-sm text-destructive">{formErrors.type}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty_levels">Zorluk Seviyeleri *</Label>
                  <Input
                    id="difficulty_levels"
                    name="difficulty_levels"
                    value={formData.difficulty_levels}
                    onChange={handleInputChange}
                    placeholder="Örn: Seviye 1-8"
                    className={formErrors.difficulty_levels ? "border-destructive" : ""}
                  />
                  {formErrors.difficulty_levels && (
                    <p className="text-sm text-destructive">{formErrors.difficulty_levels}</p>
                  )}
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Süre (dakika)</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    min="0"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    placeholder="10"
                    className={formErrors.duration_minutes ? "border-destructive" : ""}
                  />
                  {formErrors.duration_minutes && (
                    <p className="text-sm text-destructive">{formErrors.duration_minutes}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
                </div>
              </div>
              
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-sm text-green-600">{submitSuccess}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Oluştur
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {isEditModalOpen && (
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Egzersizi Düzenle</DialogTitle>
              <DialogDescription>
                Egzersiz bilgilerini güncelleyin.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Başlık *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Egzersiz başlığı"
                  className={formErrors.title ? "border-destructive" : ""}
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive">{formErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Açıklama</Label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Egzersiz açıklaması"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Tür *</Label>
                  <Input
                    id="edit-type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Örn: reading"
                    className={formErrors.type ? "border-destructive" : ""}
                  />
                  {formErrors.type && (
                    <p className="text-sm text-destructive">{formErrors.type}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-difficulty_levels">Zorluk Seviyeleri *</Label>
                  <Input
                    id="edit-difficulty_levels"
                    name="difficulty_levels"
                    value={formData.difficulty_levels}
                    onChange={handleInputChange}
                    placeholder="Örn: Seviye 1-8"
                    className={formErrors.difficulty_levels ? "border-destructive" : ""}
                  />
                  {formErrors.difficulty_levels && (
                    <p className="text-sm text-destructive">{formErrors.difficulty_levels}</p>
                  )}
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration_minutes">Süre (dakika)</Label>
                  <Input
                    id="edit-duration_minutes"
                    name="duration_minutes"
                    type="number"
                    min="0"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    placeholder="10"
                    className={formErrors.duration_minutes ? "border-destructive" : ""}
                  />
                  {formErrors.duration_minutes && (
                    <p className="text-sm text-destructive">{formErrors.duration_minutes}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="edit-is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <Label htmlFor="edit-is_active" className="cursor-pointer">Aktif</Label>
                </div>
              </div>
              
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-sm text-green-600">{submitSuccess}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Güncelle
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        {isDeleteModalOpen && (
          <>
            <DialogHeader>
              <DialogTitle>Egzersizi Sil</DialogTitle>
              <DialogDescription>
                <span className="font-semibold">{selectedExercise?.title}</span> egzersizini silmek istediğinize emin misiniz?
                Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sil
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </AdminLayout>
  )
}
