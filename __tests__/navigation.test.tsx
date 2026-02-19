import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Navigation } from "@/components/navigation"
import { usePathname } from "next/navigation"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}))

// Mock next/link
jest.mock("next/link", () => {
  return function Link({ children, href, ...props }: { children: React.ReactNode; href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe("Navigation", () => {
  const mockUsePathname = usePathname as jest.Mock

  beforeEach(() => {
    mockUsePathname.mockReturnValue("/")
  })

  afterEach(() => {
    jest.clearAllMocks()
    document.body.style.overflow = "unset"
  })

  describe("Desktop Navigation", () => {
    it("renders navigation header", () => {
      render(<Navigation />)
      expect(screen.getByTestId("navigation-header")).toBeInTheDocument()
    })

    it("renders logo with link to home", () => {
      render(<Navigation />)
      const logo = screen.getByTestId("nav-logo")
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute("href", "/")
    })

    it("renders all main navigation links", () => {
      render(<Navigation />)
      
      expect(screen.getByTestId("nav-link-/")).toHaveTextContent("Ana Sayfa")
      expect(screen.getByTestId("nav-link-/egzersizler")).toHaveTextContent("Egzersizler")
      expect(screen.getByTestId("nav-link-/profil")).toHaveTextContent("Profil")
      expect(screen.getByTestId("nav-link-/puan-tablosu")).toHaveTextContent("Puan Tablosu")
    })

    it("highlights active link based on pathname", () => {
      mockUsePathname.mockReturnValue("/egzersizler")
      render(<Navigation />)
      
      const activeLink = screen.getByTestId("nav-link-/egzersizler")
      expect(activeLink).toHaveAttribute("aria-current", "page")
      expect(activeLink).toHaveClass("bg-primary")
    })

    it("does not highlight inactive links", () => {
      mockUsePathname.mockReturnValue("/egzersizler")
      render(<Navigation />)
      
      const inactiveLink = screen.getByTestId("nav-link-/")
      expect(inactiveLink).not.toHaveAttribute("aria-current")
      expect(inactiveLink).not.toHaveClass("bg-primary")
    })

    it("shows login and register buttons when user is not authenticated", () => {
      render(<Navigation />)
      
      expect(screen.getByTestId("nav-login")).toBeInTheDocument()
      expect(screen.getByTestId("nav-register")).toBeInTheDocument()
    })

    it("shows user info when authenticated", () => {
      const user = { name: "Test User", email: "test@example.com" }
      render(<Navigation user={user} />)
      
      expect(screen.getByTestId("nav-user-profile")).toBeInTheDocument()
      // Check for the user name in the desktop nav (not mobile)
      const desktopNav = screen.getByLabelText("Ana navigasyon")
      expect(desktopNav).toBeInTheDocument()
    })

    it("shows logout button when user is authenticated and onLogout provided", () => {
      const user = { name: "Test User", email: "test@example.com" }
      const onLogout = jest.fn()
      render(<Navigation user={user} onLogout={onLogout} />)
      
      expect(screen.getByTestId("nav-logout")).toBeInTheDocument()
    })
  })

  describe("Mobile Navigation", () => {
    it("renders mobile menu button on small screens", () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      expect(menuButton).toBeInTheDocument()
      expect(menuButton).toHaveAttribute("aria-label", "Menüyü aç")
    })

    it("opens mobile menu when button is clicked", async () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByTestId("mobile-menu")).toHaveClass("translate-x-0")
      })
    })

    it("shows mobile overlay when menu is open", async () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByTestId("mobile-overlay")).toBeInTheDocument()
      })
    })

    it("closes mobile menu when overlay is clicked", async () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      fireEvent.click(menuButton)
      await waitFor(() => {
        expect(screen.getByTestId("mobile-overlay")).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId("mobile-overlay"))
      
      await waitFor(() => {
        expect(screen.queryByTestId("mobile-overlay")).not.toBeInTheDocument()
      })
    })

    it("closes mobile menu when close button is clicked", async () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      fireEvent.click(menuButton)
      await waitFor(() => {
        expect(screen.getByTestId("mobile-menu-close")).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId("mobile-menu-close"))
      
      await waitFor(() => {
        expect(screen.queryByTestId("mobile-overlay")).not.toBeInTheDocument()
      })
    })

    it("renders all navigation links in mobile menu", async () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByTestId("mobile-nav-link-/")).toHaveTextContent("Ana Sayfa")
        expect(screen.getByTestId("mobile-nav-link-/egzersizler")).toHaveTextContent("Egzersizler")
        expect(screen.getByTestId("mobile-nav-link-/profil")).toHaveTextContent("Profil")
        expect(screen.getByTestId("mobile-nav-link-/puan-tablosu")).toHaveTextContent("Puan Tablosu")
      })
    })

    it("shows login and register buttons in mobile menu when not authenticated", async () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByTestId("mobile-nav-login")).toBeInTheDocument()
        expect(screen.getByTestId("mobile-nav-register")).toBeInTheDocument()
      })
    })

    it("shows user info in mobile menu when authenticated", async () => {
      const user = { name: "Test User", email: "test@example.com" }
      render(<Navigation user={user} />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByTestId("mobile-nav-user-profile")).toBeInTheDocument()
        // Check email is shown in mobile menu
        expect(screen.getByText("test@example.com")).toBeInTheDocument()
      })
    })

    it("calls onLogout when logout button is clicked in mobile menu", async () => {
      const user = { name: "Test User", email: "test@example.com" }
      const onLogout = jest.fn()
      render(<Navigation user={user} onLogout={onLogout} />)
      
      const menuButton = screen.getByTestId("mobile-menu-button")
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByTestId("mobile-nav-logout")).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId("mobile-nav-logout"))
      expect(onLogout).toHaveBeenCalledTimes(1)
    })

    it("closes mobile menu when navigation link is clicked", async () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      fireEvent.click(menuButton)
      await waitFor(() => {
        expect(screen.getByTestId("mobile-nav-link-/")).toBeInTheDocument()
      })
      
      // Click on a nav link
      fireEvent.click(screen.getByTestId("mobile-nav-link-/egzersizler"))
      
      // Menu should close - check that the mobile menu has translate-x-full class
      await waitFor(() => {
        const mobileMenu = screen.getByTestId("mobile-menu")
        expect(mobileMenu).toHaveClass("translate-x-full")
      })
    })
  })

  describe("Accessibility", () => {
    it("has correct aria-label on navigation", () => {
      render(<Navigation />)
      expect(screen.getByLabelText("Ana navigasyon")).toBeInTheDocument()
    })

    it("has aria-current on active link", () => {
      mockUsePathname.mockReturnValue("/egzersizler")
      render(<Navigation />)
      
      const activeLink = screen.getByTestId("nav-link-/egzersizler")
      expect(activeLink).toHaveAttribute("aria-current", "page")
    })

    it("mobile menu has correct aria attributes", async () => {
      render(<Navigation />)
      const menuButton = screen.getByTestId("mobile-menu-button")
      
      expect(menuButton).toHaveAttribute("aria-expanded", "false")
      expect(menuButton).toHaveAttribute("aria-controls", "mobile-menu")
      
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        const mobileMenu = screen.getByTestId("mobile-menu")
        expect(mobileMenu).toHaveAttribute("role", "dialog")
        expect(mobileMenu).toHaveAttribute("aria-modal", "true")
      })
    })

    it("mobile menu button has correct aria-label", () => {
      render(<Navigation />)
      expect(screen.getByLabelText("Menüyü aç")).toBeInTheDocument()
    })
  })

  describe("Active State Detection", () => {
    it("correctly identifies home page as active", () => {
      mockUsePathname.mockReturnValue("/")
      render(<Navigation />)
      
      expect(screen.getByTestId("nav-link-/")).toHaveAttribute("aria-current", "page")
    })

    it("correctly identifies nested routes as active", () => {
      mockUsePathname.mockReturnValue("/egzersiz/blok-okuma")
      render(<Navigation />)
      
      // The /egzersizler link should not be active for /egzersiz/*
      expect(screen.getByTestId("nav-link-/egzersizler")).not.toHaveAttribute("aria-current")
    })

    it("correctly identifies exercises page as active", () => {
      mockUsePathname.mockReturnValue("/egzersizler")
      render(<Navigation />)
      
      expect(screen.getByTestId("nav-link-/egzersizler")).toHaveAttribute("aria-current", "page")
    })
  })
})
