import { render, screen } from "@testing-library/react"
import { NavigationWrapper } from "@/components/navigation-wrapper"
import { usePathname } from "next/navigation"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}))

describe("NavigationWrapper", () => {
  const mockUsePathname = usePathname as jest.Mock

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders children on user pages", () => {
    mockUsePathname.mockReturnValue("/")
    render(
      <NavigationWrapper>
        <div data-testid="content">Page Content</div>
      </NavigationWrapper>
    )
    
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("renders children on egzersizler page", () => {
    mockUsePathname.mockReturnValue("/egzersizler")
    render(
      <NavigationWrapper>
        <div data-testid="content">Page Content</div>
      </NavigationWrapper>
    )
    
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("renders children on profil page", () => {
    mockUsePathname.mockReturnValue("/profil")
    render(
      <NavigationWrapper>
        <div data-testid="content">Page Content</div>
      </NavigationWrapper>
    )
    
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("renders children on puan-tablosu page", () => {
    mockUsePathname.mockReturnValue("/puan-tablosu")
    render(
      <NavigationWrapper>
        <div data-testid="content">Page Content</div>
      </NavigationWrapper>
    )
    
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("renders children on admin pages", () => {
    mockUsePathname.mockReturnValue("/admin")
    render(
      <NavigationWrapper>
        <div data-testid="content">Admin Content</div>
      </NavigationWrapper>
    )
    
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("renders children on nested admin pages", () => {
    mockUsePathname.mockReturnValue("/admin/users")
    render(
      <NavigationWrapper>
        <div data-testid="content">Admin Users Content</div>
      </NavigationWrapper>
    )
    
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("renders children on exercise detail pages", () => {
    mockUsePathname.mockReturnValue("/egzersiz/blok-okuma")
    render(
      <NavigationWrapper>
        <div data-testid="content">Exercise Content</div>
      </NavigationWrapper>
    )
    
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("wraps children in main element on user pages", () => {
    mockUsePathname.mockReturnValue("/")
    render(
      <NavigationWrapper>
        <div data-testid="content">Page Content</div>
      </NavigationWrapper>
    )
    
    const main = screen.getByRole("main")
    expect(main).toContainElement(screen.getByTestId("content"))
  })

  it("does not wrap children in main element on admin pages", () => {
    mockUsePathname.mockReturnValue("/admin")
    render(
      <NavigationWrapper>
        <div data-testid="content">Admin Content</div>
      </NavigationWrapper>
    )
    
    expect(screen.queryByRole("main")).not.toBeInTheDocument()
  })
})
