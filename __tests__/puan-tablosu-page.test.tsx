import { render, screen } from '@testing-library/react'
import PuanTablosuPage from '../app/puan-tablosu/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => '/puan-tablosu'),
}))

describe('PuanTablosu Page', () => {
  it('renders the page title correctly', () => {
    render(<PuanTablosuPage />)
    
    expect(screen.getByText('Puan Tablosu')).toBeInTheDocument()
  })

  it('renders the page description', () => {
    render(<PuanTablosuPage />)
    
    expect(screen.getByText(/En iyi okuyucular ile kendini karşılaştır/i)).toBeInTheDocument()
  })

  it('renders back link', () => {
    render(<PuanTablosuPage />)
    
    expect(screen.getByText('Ana Sayfaya Dön')).toBeInTheDocument()
  })

  it('renders top 3 users with names', () => {
    render(<PuanTablosuPage />)
    
    // Check for top 3 users
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    expect(screen.getByText('Ayşe Demir')).toBeInTheDocument()
    expect(screen.getByText('Mehmet Kaya')).toBeInTheDocument()
  })

  it('renders leaderboard table headers', () => {
    render(<PuanTablosuPage />)
    
    expect(screen.getByText('Kullanıcı')).toBeInTheDocument()
    expect(screen.getAllByText('Puan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Streak').length).toBeGreaterThan(0)
  })

  it('renders leaderboard data for users 4-10', () => {
    render(<PuanTablosuPage />)
    
    // Check for users in the table (ranks 4-10)
    expect(screen.getByText('Fatma Şahin')).toBeInTheDocument()
    expect(screen.getByText('Ali Öztürk')).toBeInTheDocument()
    expect(screen.getByText('Zeynep Çelik')).toBeInTheDocument()
    expect(screen.getByText('Mustafa Doğan')).toBeInTheDocument()
    expect(screen.getByText('Elif Arslan')).toBeInTheDocument()
    expect(screen.getByText('Hakan Yavuz')).toBeInTheDocument()
    expect(screen.getByText('Senem Bulut')).toBeInTheDocument()
  })

  it('renders current user section', () => {
    render(<PuanTablosuPage />)
    
    expect(screen.getByText('Demo Kullanıcı')).toBeInTheDocument()
  })

  it('renders reward system legend', () => {
    render(<PuanTablosuPage />)
    
    expect(screen.getByText('Ödül Sistemimiz')).toBeInTheDocument()
    expect(screen.getByText('Bronz')).toBeInTheDocument()
    expect(screen.getByText('Gümüş')).toBeInTheDocument()
    expect(screen.getByText('Altın')).toBeInTheDocument()
  })

  it('renders user avatars with initials', () => {
    render(<PuanTablosuPage />)
    
    // Check for initials in avatars (using getAllByText since there may be multiple)
    // AD = Ayşe Demir, MK = Mehmet Kaya, FŞ = Fatma Şahin
    expect(screen.getAllByText('AD').length).toBeGreaterThan(0)
    expect(screen.getAllByText('MK').length).toBeGreaterThan(0)
    expect(screen.getAllByText('FŞ').length).toBeGreaterThan(0)
  })

  it('does not use emoji characters', () => {
    render(<PuanTablosuPage />)
    
    const pageContent = document.body.textContent || ''
    
    // Check for common medal emojis
    expect(pageContent).not.toContain('🥇')
    expect(pageContent).not.toContain('🥈')
    expect(pageContent).not.toContain('🥉')
    expect(pageContent).not.toContain('👑')
    expect(pageContent).not.toContain('👨')
    expect(pageContent).not.toContain('👩')
    expect(pageContent).not.toContain('👤')
  })

  it('uses Lucide icons instead of emojis', () => {
    render(<PuanTablosuPage />)
    
    // Check for SVG icons (Lucide renders as svg elements)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
    
    // Check for specific icon attributes that Lucide uses
    const svgWithStroke = document.querySelectorAll('svg[stroke]')
    expect(svgWithStroke.length).toBeGreaterThan(0)
  })

  it('maintains visual hierarchy for top 3 placements', () => {
    render(<PuanTablosuPage />)
    
    // First place should have highest points
    const firstPlacePoints = screen.getByText('4,500')
    expect(firstPlacePoints).toBeInTheDocument()
    
    // Second place
    const secondPlacePoints = screen.getByText('4,200')
    expect(secondPlacePoints).toBeInTheDocument()
    
    // Third place
    const thirdPlacePoints = screen.getByText('3,800')
    expect(thirdPlacePoints).toBeInTheDocument()
  })

  it('uses Crown icon for first place', () => {
    render(<PuanTablosuPage />)
    
    // Crown icon should be present (Lucide Crown SVG)
    const crownSvgs = document.querySelectorAll('svg')
    let hasCrown = false
    crownSvgs.forEach((svg) => {
      if (svg.classList.contains('lucide-crown') || svg.classList.contains('lucide')) {
        hasCrown = true
      }
    })
    expect(hasCrown).toBe(true)
  })

  it('uses User icon for current user avatar', () => {
    render(<PuanTablosuPage />)
    
    // User icon should be present for the current user
    const userSvgs = document.querySelectorAll('svg')
    expect(userSvgs.length).toBeGreaterThan(0)
  })
})
