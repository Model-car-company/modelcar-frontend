'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

// Create wrapper components to properly handle the dynamic imports
const RoughNotationWrapper = dynamic(
  () => import('react-rough-notation').then(mod => {
    const { RoughNotation } = mod
    return { default: RoughNotation }
  }),
  { 
    ssr: false,
    loading: () => <span />
  }
)

const RoughNotationGroupWrapper = dynamic(
  () => import('react-rough-notation').then(mod => {
    const { RoughNotationGroup } = mod
    return { default: RoughNotationGroup }
  }),
  { 
    ssr: false,
    loading: () => <span />
  }
)

export const RoughNotation = RoughNotationWrapper
export const RoughNotationGroup = RoughNotationGroupWrapper
