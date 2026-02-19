import { render, screen } from '@testing-library/react'
import Home from '../app/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  usePathname: jest.fn(() => '/'),
}))

describe('Home', () => {
  it('redirects to /admin', () => {
    const { redirect } = require('next/navigation')
    
    render(<Home />)
    
    expect(redirect).toHaveBeenCalledWith('/admin')
  })
})
