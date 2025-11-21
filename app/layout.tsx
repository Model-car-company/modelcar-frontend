import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Model Masters - Premium Model Car Creation',
  description: 'Crafting perfection in miniature. Experience the art of precision model car creation.',
  keywords: 'model cars, miniature cars, custom models, car replicas, precision crafting',
  authors: [{ name: 'Model Masters' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
