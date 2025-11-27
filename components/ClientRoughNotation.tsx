'use client'

import dynamic from 'next/dynamic'

// Dynamically import RoughNotation with SSR disabled to prevent hydration issues
export const RoughNotation = dynamic(
  () => import('react-rough-notation').then(mod => mod.RoughNotation),
  { ssr: false }
)

export const RoughNotationGroup = dynamic(
  () => import('react-rough-notation').then(mod => mod.RoughNotationGroup),
  { ssr: false }
)
