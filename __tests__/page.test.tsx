import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home', () => {
  it('renders the admin panel heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { name: /Hızlı Okuma Admin Panel/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders exercise sections', () => {
    render(<Home />)
    
    expect(screen.getByText('Blok Okuma')).toBeInTheDocument()
    expect(screen.getByText('Grup Okuma')).toBeInTheDocument()
    expect(screen.getByText('Metin Arama')).toBeInTheDocument()
    expect(screen.getByText('Gölgeleme')).toBeInTheDocument()
  })

  it('renders reward system section', () => {
    render(<Home />)
    
    expect(screen.getByText('Ödül Sistemi')).toBeInTheDocument()
    expect(screen.getByText(/Puan Sistemi/i)).toBeInTheDocument()
  })
})
