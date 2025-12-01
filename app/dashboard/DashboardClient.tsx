'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Box, Image as ImageIcon } from 'lucide-react'
import CollapsibleSidebar from '../../components/CollapsibleSidebar'
import { RoughNotation } from '../../components/ClientRoughNotation'
import GallerySection from '../../components/GallerySection'
import dynamic from 'next/dynamic'

const Model3DShowcase = dynamic(() => import('../../components/Model3DShowcase'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white/5">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-400">Loading 3D Model...</p>
      </div>
    </div>
  ),
})

const CategoryModel3D = dynamic(() => import('../../components/CategoryModel3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white/5">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-400">Loading...</p>
      </div>
    </div>
  ),
})

interface DashboardClientProps {
  fullName: string
  creditsRemaining: number
}

export default function DashboardClient({ fullName, creditsRemaining }: DashboardClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        currentPage="dashboard"
        fullName={fullName}
        creditsRemaining={creditsRemaining}
        onCollapseChange={setIsCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-56'}`}>
        <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-thin tracking-tight mb-2">
              Welcome back, <span className="text-white/60">{fullName}</span>
            </h1>
          </div>

          {/* Dashboard Hero Image */}
          <div className="mb-8 sm:mb-12">
            <div className="relative overflow-hidden rounded border border-white/10 h-48 sm:h-64 lg:h-96">
              <img
                src="/dashboard/Gemini_Generated_Image_yycbrpyycbrpyycb.png"
                alt="Dashboard Overview"
                className="w-full h-full object-cover"
              />
              {/* Subtle dark overlay */}
              <div className="absolute inset-0 bg-black/25" />

              {/* Sketch Mark Overlays - Using RoughNotation with fast glitch */}
              <style>{`
                .sketch-flash-1 { animation: sketchFlash1 0.6s infinite; }
                .sketch-flash-2 { animation: sketchFlash2 0.6s infinite; }
                .sketch-flash-3 { animation: sketchFlash3 0.6s infinite; }
                .sketch-flash-4 { animation: sketchFlash4 0.6s infinite; }
                .sketch-flash-5 { animation: sketchFlash5 0.6s infinite; }
                .sketch-flash-6 { animation: sketchFlash6 0.6s infinite; }
                
                @keyframes sketchFlash1 {
                  0%, 15% { opacity: 1; }
                  16%, 100% { opacity: 0; }
                }
                @keyframes sketchFlash2 {
                  0%, 15% { opacity: 0; }
                  16%, 31% { opacity: 1; }
                  32%, 100% { opacity: 0; }
                }
                @keyframes sketchFlash3 {
                  0%, 31% { opacity: 0; }
                  32%, 47% { opacity: 1; }
                  48%, 100% { opacity: 0; }
                }
                @keyframes sketchFlash4 {
                  0%, 47% { opacity: 0; }
                  48%, 63% { opacity: 1; }
                  64%, 100% { opacity: 0; }
                }
                @keyframes sketchFlash5 {
                  0%, 63% { opacity: 0; }
                  64%, 79% { opacity: 1; }
                  80%, 100% { opacity: 0; }
                }
                @keyframes sketchFlash6 {
                  0%, 79% { opacity: 0; }
                  80%, 100% { opacity: 1; }
                }
              `}</style>

              {/* Sketch 1 - Top Left Squiggly */}
              <div className="absolute top-12 left-16 pointer-events-none">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={6}>
                    <div style={{ width: '180px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={6}>
                    <div style={{ width: '180px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={6}>
                    <div style={{ width: '180px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={6}>
                    <div style={{ width: '180px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={6}>
                    <div style={{ width: '180px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={6}>
                    <div style={{ width: '180px', height: '8px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 2 - Top Right Circle */}
              <div className="absolute top-16 right-24 pointer-events-none">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={8}>
                    <div style={{ width: '80px', height: '80px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={8}>
                    <div style={{ width: '80px', height: '80px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={8}>
                    <div style={{ width: '80px', height: '80px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={8}>
                    <div style={{ width: '80px', height: '80px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={8}>
                    <div style={{ width: '80px', height: '80px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={8}>
                    <div style={{ width: '80px', height: '80px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 3 - Bottom Left Diagonal */}
              <div className="absolute bottom-20 left-32 pointer-events-none -rotate-6">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={0}>
                    <div style={{ width: '160px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={0}>
                    <div style={{ width: '160px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={0}>
                    <div style={{ width: '160px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={0}>
                    <div style={{ width: '160px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={0}>
                    <div style={{ width: '160px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={0}>
                    <div style={{ width: '160px', height: '8px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 4 - X Mark */}
              <div className="absolute top-1/3 right-1/3 pointer-events-none rotate-12">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '30px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '30px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '30px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '30px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '30px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '30px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 5 - Top Center Squiggly */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={5}>
                    <div style={{ width: '140px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={5}>
                    <div style={{ width: '140px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={5}>
                    <div style={{ width: '140px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={5}>
                    <div style={{ width: '140px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={5}>
                    <div style={{ width: '140px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={2.5} iterations={2} padding={5}>
                    <div style={{ width: '140px', height: '8px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 6 - Middle Left Circle */}
              <div className="absolute top-1/2 left-20 -translate-y-1/2 pointer-events-none">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={6}>
                    <div style={{ width: '60px', height: '60px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={6}>
                    <div style={{ width: '60px', height: '60px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={6}>
                    <div style={{ width: '60px', height: '60px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={6}>
                    <div style={{ width: '60px', height: '60px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={6}>
                    <div style={{ width: '60px', height: '60px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={6}>
                    <div style={{ width: '60px', height: '60px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 7 - Bottom Right X Mark */}
              <div className="absolute bottom-16 right-28 pointer-events-none -rotate-6">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2.5} iterations={3} padding={0}>
                    <div style={{ width: '90px', height: '25px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2.5} iterations={3} padding={0}>
                    <div style={{ width: '90px', height: '25px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2.5} iterations={3} padding={0}>
                    <div style={{ width: '90px', height: '25px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2.5} iterations={3} padding={0}>
                    <div style={{ width: '90px', height: '25px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2.5} iterations={3} padding={0}>
                    <div style={{ width: '90px', height: '25px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2.5} iterations={3} padding={0}>
                    <div style={{ width: '90px', height: '25px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 8 - Top Right Small Box */}
              <div className="absolute top-20 right-36 pointer-events-none rotate-3">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="box" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={4}>
                    <div style={{ width: '50px', height: '50px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="box" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={4}>
                    <div style={{ width: '50px', height: '50px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="box" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={4}>
                    <div style={{ width: '50px', height: '50px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="box" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={4}>
                    <div style={{ width: '50px', height: '50px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="box" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={4}>
                    <div style={{ width: '50px', height: '50px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="box" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={4}>
                    <div style={{ width: '50px', height: '50px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 9 - Bottom Center BIG Squiggly */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none rotate-2">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={8}>
                    <div style={{ width: '240px', height: '12px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={8}>
                    <div style={{ width: '240px', height: '12px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={8}>
                    <div style={{ width: '240px', height: '12px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={8}>
                    <div style={{ width: '240px', height: '12px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={8}>
                    <div style={{ width: '240px', height: '12px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="highlight" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={8}>
                    <div style={{ width: '240px', height: '12px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 10 - Middle Right Tiny Circle */}
              <div className="absolute top-1/3 right-20 pointer-events-none">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={3}>
                    <div style={{ width: '35px', height: '35px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={3}>
                    <div style={{ width: '35px', height: '35px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={3}>
                    <div style={{ width: '35px', height: '35px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={3}>
                    <div style={{ width: '35px', height: '35px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={3}>
                    <div style={{ width: '35px', height: '35px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={3}>
                    <div style={{ width: '35px', height: '35px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 11 - Top Left Corner Tiny X */}
              <div className="absolute top-6 left-8 pointer-events-none -rotate-12">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2} iterations={3} padding={0}>
                    <div style={{ width: '40px', height: '15px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2} iterations={3} padding={0}>
                    <div style={{ width: '40px', height: '15px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2} iterations={3} padding={0}>
                    <div style={{ width: '40px', height: '15px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2} iterations={3} padding={0}>
                    <div style={{ width: '40px', height: '15px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2} iterations={3} padding={0}>
                    <div style={{ width: '40px', height: '15px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={2} iterations={3} padding={0}>
                    <div style={{ width: '40px', height: '15px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 12 - Middle Center BIG Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={3} iterations={2} padding={10}>
                    <div style={{ width: '120px', height: '120px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={3} iterations={2} padding={10}>
                    <div style={{ width: '120px', height: '120px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={3} iterations={2} padding={10}>
                    <div style={{ width: '120px', height: '120px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={3} iterations={2} padding={10}>
                    <div style={{ width: '120px', height: '120px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={3} iterations={2} padding={10}>
                    <div style={{ width: '120px', height: '120px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="circle" show={true} color="#FF0000" strokeWidth={3} iterations={2} padding={10}>
                    <div style={{ width: '120px', height: '120px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 13 - Bottom Left Small Underline */}
              <div className="absolute bottom-12 left-24 pointer-events-none rotate-6">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={0}>
                    <div style={{ width: '70px', height: '5px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={0}>
                    <div style={{ width: '70px', height: '5px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={0}>
                    <div style={{ width: '70px', height: '5px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={0}>
                    <div style={{ width: '70px', height: '5px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={0}>
                    <div style={{ width: '70px', height: '5px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={2} iterations={2} padding={0}>
                    <div style={{ width: '70px', height: '5px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 14 - Right Edge BIG X Mark */}
              <div className="absolute top-1/4 right-12 pointer-events-none rotate-15">
                <div className="absolute inset-0 sketch-flash-1">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3.5} iterations={3} padding={0}>
                    <div style={{ width: '130px', height: '40px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-2">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3.5} iterations={3} padding={0}>
                    <div style={{ width: '130px', height: '40px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-3">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3.5} iterations={3} padding={0}>
                    <div style={{ width: '130px', height: '40px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-4">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3.5} iterations={3} padding={0}>
                    <div style={{ width: '130px', height: '40px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-5">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3.5} iterations={3} padding={0}>
                    <div style={{ width: '130px', height: '40px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 sketch-flash-6">
                  <RoughNotation type="crossed-off" show={true} color="#FF0000" strokeWidth={3.5} iterations={3} padding={0}>
                    <div style={{ width: '130px', height: '40px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* Sketch 15 - Left Side BIG X Mark (Two diagonal lines) */}
              <div className="absolute top-2/3 left-16 pointer-events-none">
                {/* First diagonal line (top-left to bottom-right) */}
                <div className="absolute inset-0 rotate-45 sketch-flash-1">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 rotate-45 sketch-flash-2">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 rotate-45 sketch-flash-3">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 rotate-45 sketch-flash-4">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 rotate-45 sketch-flash-5">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 rotate-45 sketch-flash-6">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>

                {/* Second diagonal line (top-right to bottom-left) */}
                <div className="absolute inset-0 -rotate-45 sketch-flash-1">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 -rotate-45 sketch-flash-2">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 -rotate-45 sketch-flash-3">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 -rotate-45 sketch-flash-4">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 -rotate-45 sketch-flash-5">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
                <div className="absolute inset-0 -rotate-45 sketch-flash-6">
                  <RoughNotation type="underline" show={true} color="#FF0000" strokeWidth={4} iterations={3} padding={0}>
                    <div style={{ width: '100px', height: '8px' }} />
                  </RoughNotation>
                </div>
              </div>

              {/* CTA Panel (dark background for text + button) */}
              <div className="absolute bottom-6 left-6 z-10">
                <div className="bg-black/65 backdrop-blur-sm border border-white/10 rounded-lg p-4 pr-5 max-w-xl shadow-lg">
                  <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-light leading-snug tracking-wide mb-3">
                    Your dream car
                    <br />
                    just got one step closer
                  </h3>
                  <Link
                    href="/image"
                    className="inline-block px-4 py-2 bg-white text-black border border-white/80 hover:bg-gray-100 transition-all shadow-md text-xs sm:text-sm font-light tracking-wide rounded-md"
                  >
                    Start Designing
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-base sm:text-lg font-thin tracking-tight mb-4 sm:mb-6 text-gray-400">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Generate Image */}
              <Link
                href="/image"
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded p-4 sm:p-6 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <ImageIcon className="w-6 sm:w-8 h-6 sm:h-8 mb-2 sm:mb-3 text-white group-hover:scale-110 transition-transform" />
                <h3 className="text-sm sm:text-base font-light mb-1">Generate Image</h3>
                <p className="text-[10px] font-light text-gray-500">
                  Create car images with AI
                </p>
              </Link>

              {/* Create 3D Model */}
              <Link
                href="/studio"
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded p-4 sm:p-6 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 mb-2 sm:mb-3 text-white group-hover:scale-110 transition-transform" />
                <h3 className="text-sm sm:text-base font-light mb-1">Create 3D Model</h3>
                <p className="text-[10px] font-light text-gray-500">
                  Convert images to 3D models
                </p>
              </Link>

              {/* View Garage */}
              <Link
                href="/garage"
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded p-4 sm:p-6 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Box className="w-6 sm:w-8 h-6 sm:h-8 mb-2 sm:mb-3 text-white group-hover:scale-110 transition-transform" />
                <h3 className="text-sm sm:text-base font-light mb-1">My Garage</h3>
                <p className="text-[10px] font-light text-gray-500">
                  Browse and manage your 3D collection
                </p>
              </Link>
            </div>
          </div>

          {/* 3D Model Showcase - Complete Car */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-base sm:text-lg font-thin tracking-tight mb-4 sm:mb-6 text-gray-400">Featured Complete Model</h2>
            <div className="relative overflow-hidden border border-white/10 h-64 sm:h-80 lg:h-96 bg-gradient-to-b from-white/5 to-black">
              <Model3DShowcase />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <p className="text-xs font-light text-gray-500 uppercase tracking-wide mb-1">AI Generated</p>
                <h3 className="text-lg font-thin text-white mb-2">Sport Car Model</h3>
                <Link
                  href="/studio"
                  className="inline-block px-4 py-2 bg-white/10 border border-white/20 text-white text-xs font-light hover:bg-white/20 transition-all"
                >
                  Create Your Own
                </Link>
              </div>
            </div>
          </div>

          {/* Community Gallery */}
          <GallerySection />

          {/* Component Library Showcase - temporarily disabled */}
          {false && (
            <div className="mb-8 sm:mb-12">
              <h2 className="text-base sm:text-lg font-thin tracking-tight mb-4 sm:mb-6 text-gray-400">Component Library</h2>
              {/* ...component library content... */}
            </div>
          )}

          {/* Subscription Status - COMMENTED OUT */}
          {/* 
          {creditsRemaining < 3 && (
            <div className="bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-light text-gray-500 uppercase tracking-wide mb-1">
                    Low Credits
                  </p>
                  <p className="text-sm font-light text-white">
                    You have {creditsRemaining} credits remaining
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="px-6 py-2 bg-white text-black rounded text-xs font-light hover:bg-gray-100 transition-colors"
                >
                  Get More Credits
                </Link>
              </div>
            </div>
          )}
          */}
        </div>
      </div>
    </div>
  )
}
