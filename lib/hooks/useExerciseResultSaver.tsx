"use client"

import { useState, useCallback } from "react"
import { Loader2, CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface ExerciseResult {
  exerciseId: number
  score: number
  wpm: number
}

interface SaveResultState {
  status: "idle" | "loading" | "success" | "error"
  error?: string
}

export function useExerciseResultSaver() {
  const [state, setState] = useState<SaveResultState>({ status: "idle" })

  const saveResult = useCallback(async (result: ExerciseResult): Promise<boolean> => {
    setState({ status: "loading" })

    try {
      // Get user from localStorage
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        setState({ status: "error", error: "Kullanıcı girişi yapılmamış" })
        return false
      }

      const user = JSON.parse(userStr)
      if (!user.id) {
        setState({ status: "error", error: "Kullanıcı bilgisi eksik" })
        return false
      }

      const response = await fetch("/api/exercise-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          exerciseId: result.exerciseId,
          score: result.score,
          wpm: result.wpm,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Sonuç kaydedilemedi")
      }

      setState({ status: "success" })
      return true
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu",
      })
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setState({ status: "idle" })
  }, [])

  return {
    status: state.status,
    error: state.error,
    saveResult,
    reset,
  }
}

interface SaveResultFeedbackProps {
  status: "idle" | "loading" | "success" | "error"
  error?: string
  onRetry?: () => void
  onContinue?: () => void
}

export function SaveResultFeedback({
  status,
  error,
  onRetry,
  onContinue,
}: SaveResultFeedbackProps) {
  if (status === "idle") return null

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Sonuç kaydediliyor...</span>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span>Sonuç başarıyla kaydedildi!</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 py-2 text-red-600">
          <XCircle className="w-5 h-5" />
          <span>{error || "Sonuç kaydedilemedi"}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full py-2 border border-red-200 rounded-lg font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Tekrar Dene
          </button>
        )}
        {onContinue && (
          <button
            onClick={onContinue}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Devam Et (kaydetmeden)
          </button>
        )}
      </div>
    )
  }

  return null
}
