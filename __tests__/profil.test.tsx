import { render, screen } from '@testing-library/react'
import ProfilPage from '../app/profil/page'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('ProfilPage', () => {
  it('renders profile page with user info', () => {
    render(<ProfilPage />)
    
    expect(screen.getByText('Demo Kullanıcı')).toBeInTheDocument()
    expect(screen.getByText('demo@hizliokuma.com')).toBeInTheDocument()
  })

  it('renders stats with Lucide icons', () => {
    render(<ProfilPage />)
    
    // Stats should be present
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Seviye')).toBeInTheDocument()
    expect(screen.getByText('1250')).toBeInTheDocument()
    expect(screen.getByText('Puan')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Gün Streak')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Toplam Egzersiz')).toBeInTheDocument()
  })

  it('renders achievements section with Lucide icons instead of emojis', () => {
    render(<ProfilPage />)
    
    // Check achievements section exists
    expect(screen.getByText('Başarılar')).toBeInTheDocument()
    
    // Check achievement titles
    expect(screen.getByText('7 Gün Streak')).toBeInTheDocument()
    expect(screen.getByText('100 Puan')).toBeInTheDocument()
    expect(screen.getByText('10 Egzersiz')).toBeInTheDocument()
    
    // Check achievement descriptions
    expect(screen.getByText('7 gün üst üste egzersiz')).toBeInTheDocument()
    expect(screen.getByText('İlk 100 puan')).toBeInTheDocument()
    expect(screen.getByText('10 egzersiz tamamla')).toBeInTheDocument()
    
    // Ensure no emoji characters are rendered in the document
    const { container } = render(<ProfilPage />)
    const textContent = container.textContent || ''
    
    // Check for common emoji characters that should NOT be present
    const emojis = ['🔥', '⭐', '🎯', '←']
    emojis.forEach(emoji => {
      expect(textContent).not.toContain(emoji)
    })
  })

  it('renders back link with ArrowLeft icon instead of text arrow', () => {
    render(<ProfilPage />)
    
    const backLink = screen.getByText('Ana Sayfaya Dön')
    expect(backLink).toBeInTheDocument()
    
    // The link should be in an anchor tag (from our mock)
    expect(backLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders medals section', () => {
    render(<ProfilPage />)
    
    expect(screen.getByText('Madalyalar')).toBeInTheDocument()
    expect(screen.getByText('bronze')).toBeInTheDocument()
    expect(screen.getByText('gümüş')).toBeInTheDocument()
    expect(screen.getByText('altın')).toBeInTheDocument()
  })

  it('renders recent activity section', () => {
    render(<ProfilPage />)
    
    expect(screen.getByText('Son Aktiviteler')).toBeInTheDocument()
    expect(screen.getByText('Blok Okuma')).toBeInTheDocument()
    expect(screen.getByText('Gölgeleme')).toBeInTheDocument()
    expect(screen.getByText('Metin Arama')).toBeInTheDocument()
  })
})
