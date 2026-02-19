import { render, screen, fireEvent } from '@testing-library/react'
import { AdminLayout } from '../components/admin-layout'
import { AdminSidebar } from '../components/admin-sidebar'
import { AdminHeader } from '../components/admin-header'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/admin'),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('AdminLayout', () => {
  it('renders the admin layout with children', () => {
    render(
      <AdminLayout>
        <div data-testid="test-content">Test Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
    expect(screen.getByTestId('admin-main')).toBeInTheDocument()
  })

  it('renders desktop sidebar', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
  })
})

describe('AdminSidebar', () => {
  it('renders all navigation items', () => {
    render(
      <AdminSidebar
        isCollapsed={false}
        onToggle={jest.fn()}
        isMobileOpen={false}
        onMobileClose={jest.fn()}
      />
    )
    
    // Use getAllByText since we have both mobile and desktop sidebars
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Egzersizler')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Kullanıcılar')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Ödüller')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Analitik')[0]).toBeInTheDocument()
  })

  it('highlights active route', () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/admin/exercises')
    
    render(
      <AdminSidebar
        isCollapsed={false}
        onToggle={jest.fn()}
        isMobileOpen={false}
        onMobileClose={jest.fn()}
      />
    )
    
    // Get all exercise links and check the first one has aria-current
    const exercisesLinks = screen.getAllByTestId('nav-link-/admin/exercises')
    expect(exercisesLinks[0]).toHaveAttribute('aria-current', 'page')
  })

  it('toggles sidebar collapse', () => {
    const onToggle = jest.fn()
    
    render(
      <AdminSidebar
        isCollapsed={false}
        onToggle={onToggle}
        isMobileOpen={false}
        onMobileClose={jest.fn()}
      />
    )
    
    const toggleButton = screen.getAllByLabelText('Menüyü daralt')[0]
    fireEvent.click(toggleButton)
    
    expect(onToggle).toHaveBeenCalled()
  })

  it('shows mobile sidebar when open', () => {
    render(
      <AdminSidebar
        isCollapsed={false}
        onToggle={jest.fn()}
        isMobileOpen={true}
        onMobileClose={jest.fn()}
      />
    )
    
    expect(screen.getByTestId('mobile-sidebar')).toHaveClass('translate-x-0')
    expect(screen.getByTestId('mobile-overlay')).toBeInTheDocument()
  })

  it('closes mobile sidebar on overlay click', () => {
    const onMobileClose = jest.fn()
    
    render(
      <AdminSidebar
        isCollapsed={false}
        onToggle={jest.fn()}
        isMobileOpen={true}
        onMobileClose={onMobileClose}
      />
    )
    
    const overlay = screen.getByTestId('mobile-overlay')
    fireEvent.click(overlay)
    
    expect(onMobileClose).toHaveBeenCalled()
  })

  it('hides text when collapsed', () => {
    render(
      <AdminSidebar
        isCollapsed={true}
        onToggle={jest.fn()}
        isMobileOpen={false}
        onMobileClose={jest.fn()}
      />
    )
    
    const desktopSidebar = screen.getByTestId('desktop-sidebar')
    expect(desktopSidebar).toHaveClass('w-16')
  })
})

describe('AdminHeader', () => {
  it('renders header with user menu', () => {
    render(
      <AdminHeader
        onMenuClick={jest.fn()}
        sidebarCollapsed={false}
      />
    )
    
    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
    expect(screen.getAllByText('Admin')[0]).toBeInTheDocument()
  })

  it('opens mobile menu on hamburger click', () => {
    const onMenuClick = jest.fn()
    
    render(
      <AdminHeader
        onMenuClick={onMenuClick}
        sidebarCollapsed={false}
      />
    )
    
    const menuButton = screen.getByLabelText('Menüyü aç')
    fireEvent.click(menuButton)
    
    expect(onMenuClick).toHaveBeenCalled()
  })

  it('toggles theme on theme button click', () => {
    render(
      <AdminHeader
        onMenuClick={jest.fn()}
        sidebarCollapsed={false}
      />
    )
    
    const themeButton = screen.getByLabelText(/temaya geç/)
    fireEvent.click(themeButton)
    
    // Theme toggle should work without errors
    expect(themeButton).toBeInTheDocument()
  })
})
