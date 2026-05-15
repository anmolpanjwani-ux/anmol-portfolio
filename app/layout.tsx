import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Anmol Panjwani | Interior Designer',
  description:
    'Creative and detail-oriented Interior Designer specializing in luxury residential and commercial spaces. Creating timeless, meaningful, and visually balanced environments.',
  keywords: [
    'interior design',
    'luxury interiors',
    'residential design',
    'commercial design',
    'spatial design',
    'Anmol Panjwani',
  ],
  authors: [{ name: 'Anmol Panjwani' }],
  openGraph: {
    title: 'Anmol Panjwani | Interior Designer',
    description: 'Designing Spaces That Feel Timeless',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1E1E1E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        {/* Self-served by Google fonts CDN at runtime so the build has no
            external network dependency. Visually identical to next/font/google. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        {children}
        <div className="grain-overlay" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
