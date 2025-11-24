"use client"

import Link from "next/link"

export default function SimpleFooter() {
  return (
    <footer className="border-t border-white/5 py-20 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 text-center">
        
        {/* Centered Title and CTA */}
        <div className="mb-24">
          <h2 className="text-3xl sm:text-4xl font-thin tracking-tight mb-8 whitespace-nowrap">
            The workshop where car enthusiasts build their dreams.
          </h2>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-light rounded-sm transition-all hover:bg-red-500/30 backdrop-blur-sm"
          >
            Get Early Access
          </Link>
        </div>
      </div>

      {/* Bottom Right Links */}
      <div className="absolute bottom-10 right-6 sm:right-10 md:right-20">
        <div className="flex items-center justify-end gap-6 text-xs font-extralight text-gray-500">
          <Link href="/affiliate" className="hover:text-white transition-colors">Affiliate</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
          <a href="https://www.linkedin.com/company/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
        </div>
      </div>

    </footer>
  )
}
