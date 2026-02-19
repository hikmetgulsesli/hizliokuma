"use client"

import { useState, useEffect } from "react"

export interface ExerciseContent {
  id: number
  type: string
  content: string
  difficulty: string
  word_count: number
  is_active: number
  created_at: string
  updated_at: string
}

interface UseExerciseContentResult {
  content: ExerciseContent[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useExerciseContent(type: string, limit: number = 1): UseExerciseContentResult {
  const [content, setContent] = useState<ExerciseContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/exercise-content?type=${type}&limit=${limit}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Egzersiz içeriği bulunamadı")
        }
        throw new Error("Egzersiz içeriği yüklenirken bir hata oluştu")
      }
      
      const result = await response.json()
      setContent(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [type, limit])

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
  }
}