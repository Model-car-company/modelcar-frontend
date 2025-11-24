'use client'

import { useState } from 'react'
import CollapsibleSidebar from './CollapsibleSidebar'

interface DashboardLayoutProps {
  currentPage: 'dashboard' | 'image' | 'studio' | 'garage' | 'profile'
  fullName: string
  creditsRemaining: number
  children: React.ReactNode
}

export default function DashboardLayout({ currentPage, fullName, creditsRemaining, children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className={`${isCollapsed ? 'w-20' : 'w-56'} transition-all duration-300`}>
        <CollapsibleSidebar 
          currentPage={currentPage}
          fullName={fullName}
          creditsRemaining={creditsRemaining}
        />
      </div>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
