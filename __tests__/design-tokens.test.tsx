/**
 * Design Tokens Tests
 * Verifies that all required CSS custom properties are defined in globals.css
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Design Tokens', () => {
  let cssContent: string;

  beforeAll(() => {
    // Read the actual globals.css file
    const cssPath = path.join(process.cwd(), 'app', 'globals.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  describe('CSS Custom Properties', () => {
    it('should have all required color tokens defined', () => {
      const colorTokens = [
        '--primary',
        '--primary-hover',
        '--primary-foreground',
        '--accent',
        '--accent-foreground',
        '--surface',
        '--surface-alt',
        '--text',
        '--text-muted',
        '--success',
        '--warning',
        '--error',
        '--info',
        '--background',
        '--foreground',
        '--border',
      ];

      colorTokens.forEach(token => {
        const regex = new RegExp(`${token}\\s*:`);
        expect(cssContent).toMatch(regex);
      });
    });

    it('should have typography tokens defined', () => {
      const typographyTokens = [
        '--font-heading',
        '--font-body',
      ];

      typographyTokens.forEach(token => {
        const regex = new RegExp(`${token}\\s*:`);
        expect(cssContent).toMatch(regex);
      });
    });

    it('should have spacing tokens defined', () => {
      const spacingTokens = [
        '--space-xs',
        '--space-sm',
        '--space-md',
        '--space-lg',
        '--space-xl',
        '--space-2xl',
        '--space-3xl',
      ];

      spacingTokens.forEach(token => {
        const regex = new RegExp(`${token}\\s*:`);
        expect(cssContent).toMatch(regex);
      });
    });

    it('should have border radius tokens defined', () => {
      const radiusTokens = [
        '--radius-sm',
        '--radius-md',
        '--radius-lg',
        '--radius-xl',
        '--radius-full',
      ];

      radiusTokens.forEach(token => {
        const regex = new RegExp(`${token}\\s*:`);
        expect(cssContent).toMatch(regex);
      });
    });

    it('should have shadow tokens defined', () => {
      const shadowTokens = [
        '--shadow-sm',
        '--shadow-md',
        '--shadow-lg',
        '--shadow-xl',
        '--shadow-inner',
      ];

      shadowTokens.forEach(token => {
        const regex = new RegExp(`${token}\\s*:`);
        expect(cssContent).toMatch(regex);
      });
    });

    it('should have animation duration tokens defined', () => {
      const durationTokens = [
        '--duration-fast',
        '--duration-normal',
        '--duration-slow',
      ];

      durationTokens.forEach(token => {
        const regex = new RegExp(`${token}\\s*:`);
        expect(cssContent).toMatch(regex);
      });
    });

    it('should have z-index tokens defined', () => {
      const zIndexTokens = [
        '--z-dropdown',
        '--z-sticky',
        '--z-fixed',
        '--z-modal-backdrop',
        '--z-modal',
        '--z-popover',
        '--z-tooltip',
      ];

      zIndexTokens.forEach(token => {
        const regex = new RegExp(`${token}\\s*:`);
        expect(cssContent).toMatch(regex);
      });
    });
  });

  describe('Dark Mode Tokens', () => {
    it('should have dark class defined in CSS', () => {
      expect(cssContent).toContain('.dark');
    });

    it('should have dark mode color overrides', () => {
      // Check that dark mode has its own color definitions
      const darkSection = cssContent.match(/\.dark\s*\{[^}]+\}/s);
      expect(darkSection).toBeTruthy();
      
      // Check for specific dark mode tokens
      expect(cssContent).toMatch(/\.dark\s*\{[\s\S]*?--primary:/m);
      expect(cssContent).toMatch(/\.dark\s*\{[\s\S]*?--surface:/m);
      expect(cssContent).toMatch(/\.dark\s*\{[\s\S]*?--text:/m);
    });
  });

  describe('Font Configuration', () => {
    it('should use Plus Jakarta Sans for headings', () => {
      expect(cssContent).toContain('Plus Jakarta Sans');
      expect(cssContent).toMatch(/--font-heading:\s*"Plus Jakarta Sans"/);
    });

    it('should use Work Sans for body text', () => {
      expect(cssContent).toContain('Work Sans');
      expect(cssContent).toMatch(/--font-body:\s*"Work Sans"/);
    });
  });

  describe('Accessibility Features', () => {
    it('should have prefers-reduced-motion media query', () => {
      expect(cssContent).toContain('prefers-reduced-motion');
    });

    it('should have focus-visible styles', () => {
      expect(cssContent).toContain(':focus-visible');
    });

    it('should have selection styles', () => {
      expect(cssContent).toContain('::selection');
    });
  });

  describe('Tailwind Integration', () => {
    it('should have Tailwind directives', () => {
      expect(cssContent).toContain('@tailwind base');
      expect(cssContent).toContain('@tailwind components');
      expect(cssContent).toContain('@tailwind utilities');
    });

    it('should have @layer base directive', () => {
      expect(cssContent).toContain('@layer base');
    });
  });
});
