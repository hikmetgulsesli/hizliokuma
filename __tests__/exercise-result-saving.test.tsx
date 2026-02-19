import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useExerciseResultSaver, SaveResultFeedback } from "@/lib/hooks/useExerciseResultSaver"

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

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader">Loading</div>,
  CheckCircle: () => <div data-testid="check">Check</div>,
  XCircle: () => <div data-testid="error-icon">Error</div>,
  RotateCcw: () => <div data-testid="retry-icon">Retry</div>,
}))

describe("useExerciseResultSaver Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("saves results successfully with correct exerciseId", async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: 1,
          exercise_title: "Test Exercise",
          score: 75,
          wpm: 150,
          completed_at: "2024-01-15T10:00:00Z",
        },
      }),
    })

    function TestComponent() {
      const { status, error, saveResult } = useExerciseResultSaver()
      
      return (
        <div>
          <div data-testid="status">{status}</div>
          {error && <div data-testid="error">{error}</div>}
          <button
            onClick={() => saveResult({ exerciseId: 2, score: 75, wpm: 150 })}
            data-testid="save-btn"
          >
            Save
          </button>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId("status").textContent).toBe("idle")

    fireEvent.click(screen.getByTestId("save-btn"))

    expect(screen.getByTestId("status").textContent).toBe("loading")

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/exercise-results",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: 1,
            exerciseId: 2,
            score: 75,
            wpm: 150,
          }),
        })
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("success")
    })
  })

  it("returns error when user is not logged in", async () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    function TestComponent() {
      const { status, error, saveResult } = useExerciseResultSaver()
      
      return (
        <div>
          <div data-testid="status">{status}</div>
          {error && <div data-testid="error">{error}</div>}
          <button
            onClick={() => saveResult({ exerciseId: 2, score: 75, wpm: 150 })}
            data-testid="save-btn"
          >
            Save
          </button>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByTestId("save-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("error")
    })

    expect(screen.getByTestId("error").textContent).toContain("girişi yapılmamış")
  })

  it("returns error when user data is missing id", async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ name: "Test User" }))

    function TestComponent() {
      const { status, error, saveResult } = useExerciseResultSaver()
      
      return (
        <div>
          <div data-testid="status">{status}</div>
          {error && <div data-testid="error">{error}</div>}
          <button
            onClick={() => saveResult({ exerciseId: 2, score: 75, wpm: 150 })}
            data-testid="save-btn"
          >
            Save
          </button>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByTestId("save-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("error")
    })

    expect(screen.getByTestId("error").textContent).toContain("bilgisi eksik")
  })

  it("handles API error response", async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: {
          message: "Exercise not found",
        },
      }),
    })

    function TestComponent() {
      const { status, error, saveResult } = useExerciseResultSaver()
      
      return (
        <div>
          <div data-testid="status">{status}</div>
          {error && <div data-testid="error">{error}</div>}
          <button
            onClick={() => saveResult({ exerciseId: 999, score: 75, wpm: 150 })}
            data-testid="save-btn"
          >
            Save
          </button>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByTestId("save-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("error")
    })

    expect(screen.getByTestId("error").textContent).toContain("not found")
  })

  it("handles network error", async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

    function TestComponent() {
      const { status, error, saveResult } = useExerciseResultSaver()
      
      return (
        <div>
          <div data-testid="status">{status}</div>
          {error && <div data-testid="error">{error}</div>}
          <button
            onClick={() => saveResult({ exerciseId: 2, score: 75, wpm: 150 })}
            data-testid="save-btn"
          >
            Save
          </button>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByTestId("save-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("error")
    })

    expect(screen.getByTestId("error").textContent).toContain("Network error")
  })

  it("resets state correctly", async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 1 } }),
    })

    function TestComponent() {
      const { status, error, saveResult, reset } = useExerciseResultSaver()
      
      return (
        <div>
          <div data-testid="status">{status}</div>
          {error && <div data-testid="error">{error}</div>}
          <button
            onClick={() => saveResult({ exerciseId: 2, score: 75, wpm: 150 })}
            data-testid="save-btn"
          >
            Save
          </button>
          <button onClick={reset} data-testid="reset-btn">Reset</button>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByTestId("save-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("success")
    })

    fireEvent.click(screen.getByTestId("reset-btn"))

    expect(screen.getByTestId("status").textContent).toBe("idle")
  })

  it("works with different exercise IDs", async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, name: "Test User" }))
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 1 } }),
    })

    function TestComponent({ exerciseId }: { exerciseId: number }) {
      const { status, saveResult } = useExerciseResultSaver()
      
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button
            onClick={() => saveResult({ exerciseId, score: 80, wpm: 160 })}
            data-testid="save-btn"
          >
            Save
          </button>
        </div>
      )
    }

    const { rerender } = render(<TestComponent exerciseId={2} />)

    fireEvent.click(screen.getByTestId("save-btn"))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/exercise-results",
        expect.objectContaining({
          body: expect.stringContaining("\"exerciseId\":2"),
        })
      )
    })

    rerender(<TestComponent exerciseId={10} />)

    fireEvent.click(screen.getByTestId("save-btn"))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        "/api/exercise-results",
        expect.objectContaining({
          body: expect.stringContaining("\"exerciseId\":10"),
        })
      )
    })

    rerender(<TestComponent exerciseId={5} />)

    fireEvent.click(screen.getByTestId("save-btn"))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        "/api/exercise-results",
        expect.objectContaining({
          body: expect.stringContaining("\"exerciseId\":5"),
        })
      )
    })
  })
})

describe("SaveResultFeedback Component", () => {
  it("renders nothing when status is idle", () => {
    const { container } = render(<SaveResultFeedback status="idle" />)
    expect(container.firstChild).toBeNull()
  })

  it("shows loading spinner when status is loading", () => {
    render(<SaveResultFeedback status="loading" />)
    expect(screen.getByText(/kaydediliyor/i)).toBeInTheDocument()
  })

  it("shows success message when status is success", () => {
    render(<SaveResultFeedback status="success" />)
    expect(screen.getByText(/başarıyla kaydedildi/i)).toBeInTheDocument()
  })

  it("shows error message when status is error", () => {
    render(<SaveResultFeedback status="error" error="Bir hata oluştu" />)
    expect(screen.getByText(/hata oluştu/i)).toBeInTheDocument()
  })

  it("shows retry button when onRetry is provided", () => {
    const onRetry = jest.fn()
    render(<SaveResultFeedback status="error" error="Hata" onRetry={onRetry} />)
    
    const retryBtn = screen.getByText("Tekrar Dene")
    expect(retryBtn).toBeInTheDocument()
    
    fireEvent.click(retryBtn)
    expect(onRetry).toHaveBeenCalled()
  })

  it("shows continue button when onContinue is provided", () => {
    const onContinue = jest.fn()
    render(<SaveResultFeedback status="error" error="Hata" onContinue={onContinue} />)
    
    const continueBtn = screen.getByText(/devam et/i)
    expect(continueBtn).toBeInTheDocument()
    
    fireEvent.click(continueBtn)
    expect(onContinue).toHaveBeenCalled()
  })
})
