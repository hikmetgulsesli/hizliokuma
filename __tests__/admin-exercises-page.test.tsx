import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import ExercisesPage from "@/app/admin/exercises/page"
import "@testing-library/jest-dom"

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock the AdminLayout component
jest.mock("@/components/admin-layout", () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-layout">{children}</div>
  ),
}))

const mockExercises = [
  {
    id: 1,
    title: "Temel Okuma Egzersizi",
    description: "Günlük temel okuma hızı geliştirme egzersizi",
    type: "reading",
    difficulty_levels: "beginner,intermediate,advanced",
    duration_minutes: 5,
    is_active: 1,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    title: "Kelime Tespiti",
    description: "Hızlı kelime tanıma ve tespit egzersizi",
    type: "word_recognition",
    difficulty_levels: "beginner,intermediate",
    duration_minutes: 3,
    is_active: 1,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
  },
  {
    id: 3,
    title: "Paragraf Anlama",
    description: "Okuduğunu anlama ve hız artırma egzersizi",
    type: "comprehension",
    difficulty_levels: "intermediate,advanced",
    duration_minutes: 10,
    is_active: 0,
    created_at: "2024-01-03T00:00:00.000Z",
    updated_at: "2024-01-03T00:00:00.000Z",
  },
]

describe("ExercisesPage", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it("shows loading state while fetching exercises", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<ExercisesPage />)
    
    expect(screen.getByTestId("loading-state")).toBeInTheDocument()
    expect(screen.getByText("Egzersizler yükleniyor...")).toBeInTheDocument()
  })

  it("fetches exercises from API on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/exercises")
    })
  })

  it("displays exercise data in card grid", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Check that exercise titles are displayed
    expect(screen.getByText("Temel Okuma Egzersizi")).toBeInTheDocument()
    expect(screen.getByText("Kelime Tespiti")).toBeInTheDocument()
    expect(screen.getByText("Paragraf Anlama")).toBeInTheDocument()
    
    // Check descriptions
    expect(screen.getByText("Günlük temel okuma hızı geliştirme egzersizi")).toBeInTheDocument()
    
    // Check type labels
    expect(screen.getByText("Okuma")).toBeInTheDocument()
    expect(screen.getByText("Kelime Tanıma")).toBeInTheDocument()
    
    // Check duration
    expect(screen.getByText("5 dk")).toBeInTheDocument()
    expect(screen.getByText("3 dk")).toBeInTheDocument()
    expect(screen.getByText("10 dk")).toBeInTheDocument()
  })

  it("displays correct columns (title, description, type, difficulty_levels, duration)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Verify difficulty levels are shown
    expect(screen.getAllByText(/Seviyeler:/).length).toBeGreaterThanOrEqual(3)
    // These appear in multiple cards, so use getAllByText
    expect(screen.getAllByText(/Başlangıç, Orta, İleri/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Başlangıç, Orta/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Orta, İleri/).length).toBeGreaterThanOrEqual(1)
  })

  it("shows error state when API fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"))
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toBeInTheDocument()
    })
    
    expect(screen.getByText("Network error")).toBeInTheDocument()
    expect(screen.getByText("Tekrar Dene")).toBeInTheDocument()
  })

  it("shows error state on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toBeInTheDocument()
    })
  })

  it("refresh button reloads data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Clear mock and click refresh
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    const refreshButton = screen.getByLabelText("Egzersizleri yenile")
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/exercises")
    })
  })

  it("retry button in error state reloads data", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"))
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toBeInTheDocument()
    })
    
    // Clear mock and click retry
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    const retryButton = screen.getByText("Tekrar Dene")
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/exercises")
    })
  })

  it("shows empty state when no exercises", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], meta: { total: 0 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument()
    })
    
    expect(screen.getByText("Henüz egzersiz bulunmuyor.")).toBeInTheDocument()
  })

  it("filter dropdown shows all options with counts", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    const filterSelect = screen.getByLabelText("Egzersizleri filtrele")
    
    expect(filterSelect).toBeInTheDocument()
    expect(screen.getByText("Tümü (3)")).toBeInTheDocument()
    expect(screen.getByText("Aktif (2)")).toBeInTheDocument()
    expect(screen.getByText("Pasif (1)")).toBeInTheDocument()
  })

  it("filters exercises by active status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Initially all exercises should be shown
    expect(screen.getByTestId("exercise-card-1")).toBeInTheDocument()
    expect(screen.getByTestId("exercise-card-2")).toBeInTheDocument()
    expect(screen.getByTestId("exercise-card-3")).toBeInTheDocument()
    
    // Filter to active only
    const filterSelect = screen.getByLabelText("Egzersizleri filtrele")
    fireEvent.change(filterSelect, { target: { value: "active" } })
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-card-1")).toBeInTheDocument()
      expect(screen.getByTestId("exercise-card-2")).toBeInTheDocument()
      expect(screen.queryByTestId("exercise-card-3")).not.toBeInTheDocument()
    })
  })

  it("filters exercises by inactive status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Filter to inactive only
    const filterSelect = screen.getByLabelText("Egzersizleri filtrele")
    fireEvent.change(filterSelect, { target: { value: "inactive" } })
    
    await waitFor(() => {
      expect(screen.queryByTestId("exercise-card-1")).not.toBeInTheDocument()
      expect(screen.queryByTestId("exercise-card-2")).not.toBeInTheDocument()
      expect(screen.getByTestId("exercise-card-3")).toBeInTheDocument()
    })
  })

  it("shows empty state for active filter when no active exercises", async () => {
    const allInactive = mockExercises.map(e => ({ ...e, is_active: 0 }))
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: allInactive, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Filter to active only
    const filterSelect = screen.getByLabelText("Egzersizleri filtrele")
    fireEvent.change(filterSelect, { target: { value: "active" } })
    
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument()
      expect(screen.getByText("Aktif egzersiz bulunmuyor.")).toBeInTheDocument()
    })
  })

  it("toggles exercise status when toggle switch is clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Setup mock for toggle
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        data: { ...mockExercises[0], is_active: 0 } 
      }),
    })
    
    const toggle = screen.getByTestId("toggle-1")
    fireEvent.click(toggle)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/exercises?id=1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: 0 }),
        })
      )
    })
  })

  it("displays correct status badges for active and inactive exercises", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Check active status badges
    expect(screen.getByTestId("status-badge-1")).toHaveTextContent("Aktif")
    expect(screen.getByTestId("status-badge-2")).toHaveTextContent("Aktif")
    expect(screen.getByTestId("status-badge-3")).toHaveTextContent("Pasif")
  })

  it("displays stats cards with correct counts", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("total-count")).toHaveTextContent("3")
    })
    
    expect(screen.getByTestId("active-count")).toHaveTextContent("2")
    expect(screen.getByTestId("inactive-count")).toHaveTextContent("1")
  })

  it("handles toggle API error gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Setup mock for toggle error
    mockFetch.mockRejectedValueOnce(new Error("Toggle failed"))
    
    const toggle = screen.getByTestId("toggle-1")
    fireEvent.click(toggle)
    
    await waitFor(() => {
      expect(screen.getByText("Toggle failed")).toBeInTheDocument()
    })
  })

  it("displays exercise type labels correctly", async () => {
    const exercisesWithTypes = [
      { ...mockExercises[0], type: "reading" },
      { ...mockExercises[1], type: "word_recognition" },
      { ...mockExercises[2], type: "comprehension" },
    ]
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: exercisesWithTypes, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    expect(screen.getByText("Okuma")).toBeInTheDocument()
    expect(screen.getByText("Kelime Tanıma")).toBeInTheDocument()
    expect(screen.getByText("Anlama")).toBeInTheDocument()
  })

  it("displays difficulty level labels in Turkish", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    // Check that difficulty levels are translated
    expect(screen.getAllByText(/Seviyeler:/).length).toBeGreaterThanOrEqual(3)
    // Başlangıç appears in multiple places (difficulty levels), so check for at least one
    expect(screen.getAllByText(/Başlangıç/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Orta/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/İleri/).length).toBeGreaterThanOrEqual(1)
  })

  it("shows fallback text when description is null", async () => {
    const exercisesWithNullDesc = [
      { ...mockExercises[0], description: null },
    ]
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: exercisesWithNullDesc, meta: { total: 1 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    expect(screen.getByText("Açıklama yok")).toBeInTheDocument()
  })

  it("toggle switch has correct accessibility attributes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockExercises, meta: { total: 3 } }),
    })
    
    render(<ExercisesPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId("exercise-grid")).toBeInTheDocument()
    })
    
    const activeToggle = screen.getByTestId("toggle-1")
    expect(activeToggle).toHaveAttribute("role", "switch")
    expect(activeToggle).toHaveAttribute("aria-checked", "true")
    expect(activeToggle).toHaveAttribute("aria-label", "Egzersizi pasifleştir")
    
    const inactiveToggle = screen.getByTestId("toggle-3")
    expect(inactiveToggle).toHaveAttribute("aria-checked", "false")
    expect(inactiveToggle).toHaveAttribute("aria-label", "Egzersizi aktifleştir")
  })
})
