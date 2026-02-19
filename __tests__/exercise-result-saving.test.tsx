import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import GrupOkumaPage from "@/app/egzersiz/grup-okuma/page"
import GolgelemePage from "@/app/egzersiz/golgeleme/page"
import MetinAramaPage from "@/app/egzersiz/metin-arama/page"
import BlokOkumaPage from "@/app/egzersiz/blok-okuma/page"

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
})

// Mock next/link
jest.mock("next/link", () => {
  return function Link({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe("Exercise Result Saving", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe("Grup Okuma", () => {
    it("saves results with exerciseId=2 on completion", async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            exercise_title: "Kelime Tespiti",
            score: 75,
            wpm: 150,
            completed_at: "2024-01-15T10:00:00Z",
          },
        }),
      })

      render(<GrupOkumaPage />)

      // Start the exercise
      fireEvent.click(screen.getByText("Başla"))

      // Wait for exercise to start
      expect(screen.getByText("Bitirdim")).toBeInTheDocument()

      // Advance timer to simulate reading time
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Finish the exercise
      fireEvent.click(screen.getByText("Bitirdim"))

      // Wait for save to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/exercise-results",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: expect.stringContaining("\"exerciseId\":2"),
          })
        )
      })

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText("Sonuç başarıyla kaydedildi!")).toBeInTheDocument()
      })
    })

    it("shows error when save fails and allows retry", async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

      render(<GrupOkumaPage />)

      // Start and finish the exercise
      fireEvent.click(screen.getByText("Başla"))
      
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      fireEvent.click(screen.getByText("Bitirdim"))

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/kaydedilemedi|hata/i)).toBeInTheDocument()
      })

      // Verify retry button exists
      expect(screen.getByText("Tekrar Dene")).toBeInTheDocument()
    })

    it("shows error when user is not logged in", async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      render(<GrupOkumaPage />)

      // Start and finish the exercise
      fireEvent.click(screen.getByText("Başla"))
      
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      fireEvent.click(screen.getByText("Bitirdim"))

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/girişi yapılmamış/i)).toBeInTheDocument()
      })
    })
  })

  describe("Golgeleme", () => {
    it("saves results with appropriate exerciseId on completion", async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            exercise_title: "Sesli Okuma Hızı",
            score: 100,
            wpm: 180,
            completed_at: "2024-01-15T10:00:00Z",
          },
        }),
      })

      render(<GolgelemePage />)

      // Start the exercise
      fireEvent.click(screen.getByText("Başla"))

      // Wait for exercise to start
      expect(screen.getByText("Bitir")).toBeInTheDocument()

      // Click finish to complete
      fireEvent.click(screen.getByText("Bitir"))

      // Wait for save to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/exercise-results",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("\"exerciseId\":10"),
          })
        )
      })
    })

    it("shows loading state while saving", async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
      
      // Delay the fetch response
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ data: { id: 1 } }),
        }), 1000))
      )

      render(<GolgelemePage />)

      fireEvent.click(screen.getByText("Başla"))
      fireEvent.click(screen.getByText("Bitir"))

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText(/kaydediliyor/i)).toBeInTheDocument()
      })
    })
  })

  describe("Metin Arama", () => {
    it("saves results with appropriate exerciseId on completion", async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            exercise_title: "Hızlı Tarama",
            score: 80,
            wpm: 8,
            completed_at: "2024-01-15T10:00:00Z",
          },
        }),
      })

      render(<MetinAramaPage />)

      // Start the exercise
      fireEvent.click(screen.getByText("Başla"))

      // Advance timer to trigger auto-finish (180 seconds)
      act(() => {
        jest.advanceTimersByTime(180000)
      })

      // Wait for save to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/exercise-results",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("\"exerciseId\":5"),
          })
        )
      })
    })
  })

  describe("Blok Okuma", () => {
    it("saves results with appropriate exerciseId on completion", async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            exercise_title: "Paragraf Anlama",
            score: 85,
            wpm: 170,
            completed_at: "2024-01-15T10:00:00Z",
          },
        }),
      })

      render(<BlokOkumaPage />)

      // Start the exercise
      fireEvent.click(screen.getByText("Başla"))

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Finish the exercise
      fireEvent.click(screen.getByText("Bitirdim"))

      // Wait for save to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/exercise-results",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("\"exerciseId\":3"),
          })
        )
      })
    })
  })

  describe("Save Result Feedback Component", () => {
    it("renders nothing when status is idle", () => {
      const { SaveResultFeedback } = require("@/lib/hooks/useExerciseResultSaver")
      const { container } = render(<SaveResultFeedback status="idle" />)
      expect(container.firstChild).toBeNull()
    })

    it("shows loading spinner when status is loading", () => {
      const { SaveResultFeedback } = require("@/lib/hooks/useExerciseResultSaver")
      render(<SaveResultFeedback status="loading" />)
      expect(screen.getByText(/kaydediliyor/i)).toBeInTheDocument()
    })

    it("shows success message when status is success", () => {
      const { SaveResultFeedback } = require("@/lib/hooks/useExerciseResultSaver")
      render(<SaveResultFeedback status="success" />)
      expect(screen.getByText(/başarıyla kaydedildi/i)).toBeInTheDocument()
    })

    it("shows error message and retry button when status is error", () => {
      const { SaveResultFeedback } = require("@/lib/hooks/useExerciseResultSaver")
      const onRetry = jest.fn()
      render(<SaveResultFeedback status="error" error="Bir hata oluştu" onRetry={onRetry} />)
      expect(screen.getByText(/hata oluştu/i)).toBeInTheDocument()
      expect(screen.getByText("Tekrar Dene")).toBeInTheDocument()
      
      fireEvent.click(screen.getByText("Tekrar Dene"))
      expect(onRetry).toHaveBeenCalled()
    })
  })
})
