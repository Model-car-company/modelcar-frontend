import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider, PostHogPageView } from '../components/providers/PostHogProvider'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atelier - Premium Model Car Creation',
  description: 'Crafting perfection in miniature. Experience the art of precision model car creation.',
  keywords: 'model cars, miniature cars, custom models, car replicas, precision crafting',
  authors: [{ name: 'Atelier' }],
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
