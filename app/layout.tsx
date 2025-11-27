import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider, PostHogPageView } from '../components/providers/PostHogProvider'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tangibel - Make Your Dream Tangible',
  description: 'AI-powered platform that transforms imagination into reality. Upload images, generate production-ready 3D models, and manufacture custom products. Starting with cars.',
  keywords: 'AI design, 3D modeling, custom products, on-demand manufacturing, custom cars, personalized goods, product creation, physical products, AI manufacturing',
  authors: [{ name: 'Tangibel' }],
  icons: {
    icon: '/logo/Tangibellight.png',
    shortcut: '/logo/Tangibellight.png',
    apple: '/logo/Tangibellight.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script async src="https://tally.so/widgets/embed.js"></script>
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen overflow-x-hidden`}>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
