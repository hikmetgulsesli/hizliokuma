import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Work_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
})

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Hızlı Okuma Admin',
  description: 'Hızlı okuma egzersizleri yönetim paneli',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${plusJakartaSans.variable} ${workSans.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  )
}
