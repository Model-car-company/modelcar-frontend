'use client'

import { useState, useEffect } from 'react'
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride'

interface OnboardingTourProps {
  page?: 'image' | 'dashboard' | 'garage' | 'studio'
  run?: boolean
  onComplete?: () => void
}

// Tour steps for the /image page
const imageSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to Tangibel! Let me show you how to create amazing 3D models from your ideas.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="prompt-input"]',
    content: 'Start by describing your design here. Be specific about style, colors, and details for best results.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="reference-images"]',
    content: 'Upload up to 3 reference images to guide the AI. This helps create more accurate designs.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="generate-button"]',
    content: 'Click here to generate your image. Each generation costs 3 credits.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="image-card"]',
    content: 'Your generated images appear here. Hover to see more options.',
    placement: 'left',
    disableBeacon: true,
  },
  {
    target: '[data-tour="add-blueprint"]',
    content: 'Have a technical drawing? Add a blueprint here and your 3D model will have accurate real-world dimensions.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="make-3d"]',
    content: 'Turn your 2D image into a 3D model with one click! This costs 40 credits.',
    placement: 'top',
    disableBeacon: true,
  },
]

// Tour steps for the /dashboard page
const dashboardSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to your Dashboard! This is your home base for creating amazing designs.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar"]',
    content: 'Use the sidebar to navigate between pages. Access your designs, garage, orders, and account settings here.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="credits"]',
    content: 'Your credit balance is shown here. Credits are used for generating images and 3D models.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="start-designing"]',
    content: 'Ready to create? Click here to start designing your first product!',
    placement: 'top',
    disableBeacon: true,
  },
]

// Tour steps for the /garage page
const garageSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to your Garage! This is where all your creations live.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="model-card"]',
    content: 'Click on any design to preview it. 3D models can be viewed in an interactive viewer.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="ship-button"]',
    content: 'Ready to bring your design to life? Click Ship to order a physical 3D print of your model.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="download-button"]',
    content: 'Download your designs to use in other software or for 3D printing at home.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="public-toggle"]',
    content: 'Make your designs public to share them with the community, or keep them private.',
    placement: 'left',
    disableBeacon: true,
  },
]

// Tour steps for the /studio page
const studioSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to the Studio! Here you can customize and perfect your 3D models.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="3d-viewer"]',
    content: 'Your 3D model appears here. Click and drag to rotate, scroll to zoom.',
    placement: 'left',
    disableBeacon: true,
  },
  {
    target: '[data-tour="customize-tools"]',
    content: 'Use these tools to smooth, scale, repair, and optimize your model for 3D printing.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="export-tab"]',
    content: 'When you\'re happy with your model, export it in various formats for 3D printing or other uses.',
    placement: 'right',
    disableBeacon: true,
  },
]

// Map page to steps
const stepsByPage: Record<string, Step[]> = {
  image: imageSteps,
  dashboard: dashboardSteps,
  garage: garageSteps,
  studio: studioSteps,
}

export default function OnboardingTour({ page = 'image', run = true, onComplete }: OnboardingTourProps) {
  const [mounted, setMounted] = useState(false)
  const [shouldRun, setShouldRun] = useState(false)
  const steps = stepsByPage[page] || imageSteps
  
  const storageKey = `tangibel_tour_${page}_completed`

  useEffect(() => {
    setMounted(true)
    
    // Check if user has already completed this tour
    const hasCompleted = localStorage.getItem(storageKey)
    if (!hasCompleted && run) {
      setShouldRun(true)
    }
  }, [storageKey, run])

  const handleCallback = (data: CallBackProps) => {
    const { status, action } = data
    
    // Handle close button click, skip, or finish
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === 'close') {
      // Mark tour as completed in localStorage
      localStorage.setItem(storageKey, 'true')
      setShouldRun(false)
      onComplete?.()
    }
  }

  if (!mounted || !shouldRun) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      callback={handleCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#ef4444', // red-500
          backgroundColor: '#0a0a0a',
          textColor: '#ffffff',
          arrowColor: '#0a0a0a',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
        },
        tooltip: {
          backgroundColor: '#0a0a0a',
          borderRadius: 0,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 300,
        },
        tooltipContent: {
          color: '#a1a1aa',
          fontSize: 14,
          fontWeight: 300,
          lineHeight: 1.6,
        },
        buttonNext: {
          backgroundColor: '#ffffff',
          color: '#000000',
          fontSize: 12,
          fontWeight: 400,
          padding: '8px 16px',
          borderRadius: 0,
        },
        buttonBack: {
          color: '#a1a1aa',
          fontSize: 12,
          fontWeight: 300,
        },
        buttonSkip: {
          color: '#ef4444',
          fontSize: 12,
          fontWeight: 300,
        },
        buttonClose: {
          color: '#a1a1aa',
        },
        spotlight: {
          borderRadius: 0,
        },
        beacon: {
          display: 'none', // Hide beacons, we use disableBeacon anyway
        },
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5))',
          },
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get Started',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  )
}
