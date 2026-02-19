/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import fs from 'fs'
import path from 'path'

describe('Design Tokens - File Structure', () => {
  const globalsCssPath = path.join(process.cwd(), 'app', 'globals.css')
  const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx')
  const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js')

  describe('globals.css', () => {
    let cssContent: string

    beforeAll(() => {
      cssContent = fs.readFileSync(globalsCssPath, 'utf-8')
    })

    it('should define CSS custom properties in :root', () => {
      expect(cssContent).toContain(':root')
      expect(cssContent).toContain('--primary:')
    })

    it('should have primary color from SaaS palette (blue)', () => {
      expect(cssContent).toContain('--primary:')
      // Should be in HSL format
      expect(cssContent).toMatch(/--primary:\s*\d+/)
    })

    it('should have primary-hover color defined', () => {
      expect(cssContent).toContain('--primary-hover:')
    })

    it('should have accent color defined', () => {
      expect(cssContent).toContain('--accent:')
    })

    it('should have surface colors defined', () => {
      expect(cssContent).toContain('--surface:')
      expect(cssContent).toContain('--surface-dark:')
    })

    it('should have text colors defined', () => {
      expect(cssContent).toContain('--text:')
      expect(cssContent).toContain('--text-muted:')
    })

    it('should have border color defined', () => {
      expect(cssContent).toContain('--border:')
    })

    it('should have status colors defined', () => {
      expect(cssContent).toContain('--success:')
      expect(cssContent).toContain('--warning:')
      expect(cssContent).toContain('--error:')
    })

    it('should have font family variables defined', () => {
      expect(cssContent).toContain('--font-heading:')
      expect(cssContent).toContain('--font-body:')
    })

    it('should use Plus Jakarta Sans for headings', () => {
      expect(cssContent).toContain('"Plus Jakarta Sans"')
    })

    it('should use Work Sans for body', () => {
      expect(cssContent).toContain('"Work Sans"')
    })

    it('should have spacing scale defined', () => {
      expect(cssContent).toContain('--space-xs:')
      expect(cssContent).toContain('--space-sm:')
      expect(cssContent).toContain('--space-md:')
      expect(cssContent).toContain('--space-lg:')
      expect(cssContent).toContain('--space-xl:')
    })

    it('should have border radius scale defined', () => {
      expect(cssContent).toContain('--radius-sm:')
      expect(cssContent).toContain('--radius-md:')
      expect(cssContent).toContain('--radius-lg:')
    })

    it('should have shadow scale defined', () => {
      expect(cssContent).toContain('--shadow-sm:')
      expect(cssContent).toContain('--shadow-md:')
      expect(cssContent).toContain('--shadow-lg:')
    })

    it('should have dark mode selector', () => {
      expect(cssContent).toContain('.dark')
    })

    it('should have cursor-pointer on interactive elements', () => {
      expect(cssContent).toContain('cursor: pointer')
    })

    it('should have reduced motion media query', () => {
      expect(cssContent).toContain('prefers-reduced-motion')
    })

    it('should have text-wrap balance for headings', () => {
      expect(cssContent).toContain('text-wrap: balance')
    })

    it('should have tabular-nums utility', () => {
      expect(cssContent).toContain('font-variant-numeric: tabular-nums')
    })

    it('should have font-heading utility class', () => {
      expect(cssContent).toContain('.font-heading')
    })

    it('should have font-body utility class', () => {
      expect(cssContent).toContain('.font-body')
    })
  })

  describe('layout.tsx', () => {
    let layoutContent: string

    beforeAll(() => {
      layoutContent = fs.readFileSync(layoutPath, 'utf-8')
    })

    it('should import Plus_Jakarta_Sans from next/font/google', () => {
      expect(layoutContent).toContain("Plus_Jakarta_Sans")
      expect(layoutContent).toContain("from 'next/font/google'")
    })

    it('should import Work_Sans from next/font/google', () => {
      expect(layoutContent).toContain("Work_Sans")
    })

    it('should have font-display swap', () => {
      expect(layoutContent).toContain("display: 'swap'")
    })

    it('should apply font-heading variable to html', () => {
      expect(layoutContent).toContain('--font-heading')
    })

    it('should apply font-body variable to html', () => {
      expect(layoutContent).toContain('--font-body')
    })

    it('should use font-body class on body element', () => {
      expect(layoutContent).toContain('className="font-body')
    })
  })

  describe('tailwind.config.js', () => {
    let configContent: string

    beforeAll(() => {
      configContent = fs.readFileSync(tailwindConfigPath, 'utf-8')
    })

    it('should extend fontFamily with heading', () => {
      expect(configContent).toContain('fontFamily:')
      expect(configContent).toContain('heading:')
    })

    it('should extend fontFamily with body', () => {
      expect(configContent).toContain('body:')
    })

    it('should reference CSS variables for fonts', () => {
      expect(configContent).toContain('var(--font-heading)')
      expect(configContent).toContain('var(--font-body)')
    })
  })
})
