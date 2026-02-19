import { render, screen } from "@testing-library/react"
import Home from "../app/page"

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

describe("Landing Page", () => {
  it("renders the hero section with correct title", () => {
    render(<Home />)
    expect(screen.getByText("Hızlı Okuma Egzersizleri")).toBeInTheDocument()
  })

  it("renders the hero description", () => {
    render(<Home />)
    expect(screen.getByText(/Odak süreni uzat, okuma hızını artır/i)).toBeInTheDocument()
  })

  it("renders the 'Egzersizlere Başla' button", () => {
    render(<Home />)
    const button = screen.getByText("Egzersizlere Başla")
    expect(button).toBeInTheDocument()
    expect(button.closest("a")).toHaveAttribute("href", "/egzersizler")
  })

  it("renders the 'Profilim' button", () => {
    render(<Home />)
    const button = screen.getByText("Profilim")
    expect(button).toBeInTheDocument()
    expect(button.closest("a")).toHaveAttribute("href", "/profil")
  })

  it("renders the Login button with LogIn icon", () => {
    render(<Home />)
    const button = screen.getByText("Giriş Yap")
    expect(button).toBeInTheDocument()
    expect(button.closest("a")).toHaveAttribute("href", "/giris")
  })

  it("renders the Register button with UserPlus icon", () => {
    render(<Home />)
    const button = screen.getByText("Kayıt Ol")
    expect(button).toBeInTheDocument()
    expect(button.closest("a")).toHaveAttribute("href", "/kayit")
  })

  it("renders the Features section with correct headings", () => {
    render(<Home />)
    expect(screen.getByText("Özellikler")).toBeInTheDocument()
    // These headings appear in both Features and Exercise Types sections
    expect(screen.getAllByText("Blok Okuma").length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText("Grup Okuma").length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText("Gölgeleme").length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText("Ödül Sistemi")).toBeInTheDocument()
  })

  it("renders the Exercise Types section with correct headings", () => {
    render(<Home />)
    expect(screen.getByText("Egzersiz Türleri")).toBeInTheDocument()
  })

  it("renders all exercise type cards with correct links", () => {
    render(<Home />)
    
    // Check for exercise cards - use getAllByText since titles appear in both Features and Exercise Types
    const blokOkumaLinks = screen.getAllByText("Blok Okuma")
    expect(blokOkumaLinks.length).toBeGreaterThanOrEqual(2)
    
    const grupOkumaLinks = screen.getAllByText("Grup Okuma")
    expect(grupOkumaLinks.length).toBeGreaterThanOrEqual(2)
    
    // Check for exercise type section links
    expect(screen.getByText("Metin Arama")).toBeInTheDocument()
    
    // Check links are present
    expect(document.querySelector('a[href="/egzersiz/blok-okuma"]')).toBeInTheDocument()
    expect(document.querySelector('a[href="/egzersiz/grup-okuma"]')).toBeInTheDocument()
    expect(document.querySelector('a[href="/egzersiz/metin-arama"]')).toBeInTheDocument()
    expect(document.querySelector('a[href="/egzersiz/golgeleme"]')).toBeInTheDocument()
  })

  it("does not contain emoji characters in the page", () => {
    render(<Home />)
    const pageContent = document.body.textContent || ""
    
    // Check for common emoji ranges
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
    const emojis = pageContent.match(emojiRegex)
    
    expect(emojis).toBeNull()
  })

  it("renders the footer with copyright", () => {
    render(<Home />)
    expect(screen.getByText(/© 2026 Hızlı Okuma/i)).toBeInTheDocument()
  })

  it("has cursor-pointer class on all interactive elements", () => {
    render(<Home />)
    
    // Get all links
    const links = document.querySelectorAll("a")
    
    links.forEach(link => {
      expect(link.classList.toString()).toContain("cursor-pointer")
    })
  })
})
