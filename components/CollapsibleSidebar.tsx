'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Box, LayoutDashboard, User, LogOut, Image as ImageIcon, ChevronLeft, ChevronRight, Menu, X, Truck } from 'lucide-react'

interface CollapsibleSidebarProps {
  currentPage: 'dashboard' | 'image' | 'studio' | 'garage' | 'orders' | 'profile'
  fullName: string
  creditsRemaining: number
  onCollapseChange?: (collapsed: boolean) => void
}

export default function CollapsibleSidebar({ currentPage, fullName, creditsRemaining, onCollapseChange }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapseChange?.(newState)
  }
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await fetch('/auth/sign-out', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black/80 backdrop-blur-sm border border-white/10 rounded text-white hover:bg-white/10 transition-colors"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isCollapsed ? 'w-20' : 'w-56'} 
        border-r border-white/5 bg-black/50 backdrop-blur-sm 
        fixed h-full flex flex-col transition-all duration-300 z-50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo & Toggle */}
        <div className={`${isCollapsed ? 'px-4' : 'px-6'} py-6 border-b border-white/5 transition-all duration-300 flex items-center justify-between`}>
          <Link href="/" className="flex items-center gap-1 transition-all duration-300">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src="/logo/Tangibellight.png"
                alt="Tangibel"
                fill
                className="object-contain"
                priority
              />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-thin tracking-[0.3em] text-white">TANGIBEL</span>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="w-6 h-6 bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-3 h-3 text-white" strokeWidth={2} />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="w-full h-6 bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-white" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-1.5 transition-all duration-300`}>
          <Link
            href="/dashboard"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded ${currentPage === 'dashboard'
                ? 'bg-white/10 border border-white/10 text-white'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              } transition-colors`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-light tracking-wide">Dashboard</span>}
          </Link>

          <Link
            href="/image"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded ${currentPage === 'image'
                ? 'bg-white/10 border border-white/10 text-white'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              } transition-colors`}
            title="Design Studio"
          >
            <ImageIcon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-light tracking-wide">Design Studio</span>}
          </Link>

          <Link
            href="/studio"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded ${currentPage === 'studio'
                ? 'bg-white/10 border border-white/10 text-white'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              } transition-colors`}
            title="3D Assemble"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-light tracking-wide">3D Assemble</span>}
          </Link>

          <Link
            href="/garage"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded ${currentPage === 'garage'
                ? 'bg-white/10 border border-white/10 text-white'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              } transition-colors`}
            title="Garage"
          >
            <Box className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-light tracking-wide">Garage</span>}
          </Link>

          <Link
            href="/orders"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded ${currentPage === 'orders'
                ? 'bg-white/10 border border-white/10 text-white'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              } transition-colors`}
            title="Orders"
          >
            <Truck className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-light tracking-wide">Orders</span>}
          </Link>

          <Link
            href="/profile"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded ${currentPage === 'profile'
                ? 'bg-white/10 border border-white/10 text-white'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              } transition-colors`}
            title="Profile"
          >
            <User className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-light tracking-wide">Profile</span>}
          </Link>
        </nav>

        {/* User Info & Sign Out */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-white/5 space-y-2.5 transition-all duration-300`}>
          {!isCollapsed && (
            <>
              <div className="px-3 py-2.5 bg-white/5 rounded">
                <p className="text-[10px] font-light text-gray-500 uppercase tracking-wide mb-1">Signed in as</p>
                <p className="text-xs font-light text-white truncate">{fullName}</p>
              </div>

              {/* Credits & Upgrade */}
              <Link
                href="/pricing"
                className="block px-3 py-3 bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-500/20 border border-red-500/30 rounded hover:from-red-500/30 hover:via-red-600/20 hover:to-red-500/30 transition-all"
              >
                <div className="flex items-baseline justify-between mb-2.5">
                  <p className="text-[10px] font-light text-gray-400 uppercase tracking-wide">Credits</p>
                  <p className="text-xl font-thin text-white">{creditsRemaining}</p>
                </div>
                <p className="text-sm font-light text-red-400 tracking-wide mb-1">Go Pro</p>
                <p className="text-[9px] font-light text-gray-500 leading-relaxed">Unlock unlimited credits, priority support & exclusive features</p>
              </Link>
            </>
          )}

          {isCollapsed && (
            <Link
              href="/pricing"
              className="flex items-center justify-center px-3 py-3 bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-500/20 border border-red-500/30 rounded hover:from-red-500/30 hover:via-red-600/20 hover:to-red-500/30 transition-all"
              title={`${creditsRemaining} Credits - Upgrade`}
            >
              <p className="text-lg font-thin text-white">{creditsRemaining}</p>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-3'} py-2.5 rounded hover:bg-white/5 transition-colors text-gray-400 hover:text-white`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-light tracking-wide">Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  )
}
