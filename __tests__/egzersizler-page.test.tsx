import { render, screen } from "@testing-library/react"
import EgzersizlerPage from "../app/egzersizler/page"

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe("Egzersizler Page", () => {
  it("renders the page title", () => {
    render(<EgzersizlerPage />)
    expect(screen.getByText("Egzersizler")).toBeInTheDocument()
  })

  it("renders the page description", () => {
    render(<EgzersizlerPage />)
    expect(screen.getByText("Bir egzersiz türü seç ve başla!")).toBeInTheDocument()
  })

  it("renders all exercise cards", () => {
    render(<EgzersizlerPage />)
    expect(screen.getByText("Blok Okuma")).toBeInTheDocument()
    expect(screen.getByText("Grup Okuma")).toBeInTheDocument()
    expect(screen.getByText("Metin Arama")).toBeInTheDocument()
    expect(screen.getByText("Gölgeleme")).toBeInTheDocument()
  })

  it("renders the back link to home", () => {
    render(<EgzersizlerPage />)
    const backLink = screen.getByText("Ana Sayfaya Dön")
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest("a")).toHaveAttribute("href", "/")
  })

  it("renders the tips section without emoji", () => {
    render(<EgzersizlerPage />)
    
    // Check that "İpuçları" heading exists
    expect(screen.getByText("İpuçları")).toBeInTheDocument()
    
    // Check that the lightbulb icon is used (via Lucide)
    // The heading should not have the 💡 emoji
    const pageContent = document.body.textContent || ""
    expect(pageContent).not.toContain("💡")
  })

  it("does not contain emoji characters in the page", () => {
    render(<EgzersizlerPage />)
    const pageContent = document.body.textContent || ""
    
    // Check for common emoji ranges
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
    const emojis = pageContent.match(emojiRegex)
    
    expect(emojis).toBeNull()
  })

  it("renders all tip items", () => {
    render(<EgzersizlerPage />)
    expect(screen.getByText(/Her egzersizi günde max 30 dakika yap/i)).toBeInTheDocument()
    expect(screen.getByText(/Seviyeni yükseltmek için düzenli egzersiz yap/i)).toBeInTheDocument()
    expect(screen.getByText(/Ödül sistemi:/i)).toBeInTheDocument()
  })

  it("has correct links for all exercises", () => {
    render(<EgzersizlerPage />)
    
    expect(document.querySelector('a[href="/egzersiz/blok-okuma"]')).toBeInTheDocument()
    expect(document.querySelector('a[href="/egzersiz/grup-okuma"]')).toBeInTheDocument()
    expect(document.querySelector('a[href="/egzersiz/metin-arama"]')).toBeInTheDocument()
    expect(document.querySelector('a[href="/egzersiz/golgeleme"]')).toBeInTheDocument()
  })
})
