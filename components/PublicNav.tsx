'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function PublicNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8">
              <Image
                src="/logo/Tangibellight.png"
                alt="Tangibel"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg sm:text-xl font-thin tracking-[0.3em]">TANGIBEL</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/sign-in"
              className="text-[10px] sm:text-[11px] font-extralight tracking-[0.2em] uppercase hover:opacity-60 transition-opacity"
            >
              SIGN IN
            </Link>
            <Link 
              href="/sign-up"
              className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white text-black text-[10px] sm:text-[11px] font-light tracking-[0.2em] uppercase hover:bg-gray-100 transition-colors"
            >
              START FREE
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
