'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { Sparkles, Image as ImageIcon, Download, Loader, X, Paintbrush, Eraser, Undo, Redo, Trash2, Minus, Plus } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
// All credits and asset writes now happen on the backend
import ImageCard from '../../components/ImageCard'
import ModelViewer3D from '../../components/ModelViewer3D'
import UpgradeModal from '../../components/UpgradeModal'
import { SubscriptionTier } from '../../lib/subscription-config'

// Memoized component to prevent 3D viewer re-renders when typing in prompt
const ModelAssetCard = memo(({ asset }: { asset: { id: string; url: string; prompt: string; format?: string; isGenerating?: boolean } }) => {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-black/50">
      <div className="p-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-200">3D Model</p>
          <p className="text-xs text-gray-500">{asset.prompt}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/studio?asset=${asset.id}`} className="px-3 py-1.5 bg-white text-black rounded text-xs hover:bg-gray-200 font-medium">
            View in Studio
          </Link>
        </div>
      </div>
      <div className="h-[360px] border-t border-white/10">
        {asset.isGenerating || !asset.url ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 mt-2">Generating 3D model…</p>
            </div>
          </div>
        ) : (
          <ModelViewer3D modelUrl={asset.url} className="w-full h-full" />
        )}
      </div>
    </div>
  )
})
ModelAssetCard.displayName = 'ModelAssetCard'

export default function ImagePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0)
  const requiredTier: SubscriptionTier = 'showroom' // starter paid plan
  const activeStatuses = ['active', 'trialing', 'past_due']
  const IMAGE_COST = 3
  const MODEL3D_COST = 40

  // Form states
  const [prompt, setPrompt] = useState('')
  const [referenceImages, setReferenceImages] = useState<(File | null)[]>([null, null, null])
  const [referencePreviews, setReferencePreviews] = useState<(string | null)[]>([null, null, null])
  const [mode, setMode] = useState<'text' | 'sketch'>('text')
  const [sketchImage, setSketchImage] = useState<string>('')
  const [drawingInfluence, setDrawingInfluence] = useState(70)
  const [stylePreset, setStylePreset] = useState<'automotive' | 'vray' | 'keyshot' | 'octane'>('automotive')

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(3)
  const [color, setColor] = useState('#000000')
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyStep, setHistoryStep] = useState(-1)

  // Unified design assets (images + 3D models)
  const [designAssets, setDesignAssets] = useState<Array<{
    id: string
    type: 'image' | 'model3d'
    url: string
    prompt: string
    timestamp: string
    format?: 'glb' | 'stl' | 'obj'
    thumbnailUrl?: string
    isGenerating?: boolean
  }>>([])

  // Initialize canvas on mount
  useEffect(() => {
    if (mode === 'sketch' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx && history.length === 0) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        setHistory([imageData])
        setHistoryStep(0)
      }
    }
  }, [mode])

  const isPaidActive = profile?.subscription_status
    ? activeStatuses.includes(profile.subscription_status.toLowerCase()) && profile.subscription_tier !== 'free'
    : false

  // Fetch credit balance from Supabase profile
  const fetchCredits = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single()
    if (!error && data?.credits_remaining !== undefined && data?.credits_remaining !== null) {
      setCreditsRemaining(data.credits_remaining)
    }
  }

  // Handle 1-click 3D (no segmentation) using backend provider
  const handleMake3D = async (imageUrl: string) => {
    if (!user) { router.push('/sign-in'); return }
    if (!isPaidActive) { setShowUpgradeModal(true); return }

    // Check credits before starting
    if (creditsRemaining < MODEL3D_COST) {
      setShowUpgradeModal(true)
      return
    }

    // Insert a loading card immediately
    const tempId = `temp_${Date.now()}`
    const loadingCard = {
      id: tempId,
      type: 'model3d' as const,
      url: '',
      prompt: 'Generating 3D model…',
      timestamp: new Date().toISOString(),
      format: 'glb' as const,
      thumbnailUrl: imageUrl,
      isGenerating: true,
    }
    setDesignAssets(prev => [loadingCard, ...prev])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ image: imageUrl })
      })
      if (response.status === 402) {
        if (!isPaidActive) setShowUpgradeModal(true)
        // Remove temp card
        setDesignAssets(prev => prev.filter(a => a.id !== tempId))
        return
      }
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || data.detail || '3D generation failed')

      const a = data.asset || {}
      const modelUrl = data.modelUrl || a.url
      
      // Save to user_assets database table
      const { data: savedAsset } = await supabase
        .from('user_assets')
        .insert({
          user_id: user.id,
          type: 'model3d',
          url: modelUrl,
          prompt: a.prompt || '3D model',
          format: data.format || a.format || 'glb',
          thumbnail_url: imageUrl
        })
        .select()
        .single()

      const finalized = {
        id: savedAsset?.id || a.id || Date.now().toString(),
        type: 'model3d' as const,
        url: modelUrl,
        prompt: a.prompt || '3D model',
        timestamp: new Date().toISOString(),
        format: data.format || a.format || 'glb',
        thumbnailUrl: imageUrl,
        isGenerating: false,
      }
      setDesignAssets(prev => prev.map(x => x.id === tempId ? finalized : x))
      // Refresh credits after successful generation
      const newCredits = Math.max(0, creditsRemaining - MODEL3D_COST)
      setCreditsRemaining(newCredits)
      await supabase.from('profiles').update({ credits_remaining: newCredits }).eq('id', user.id)
    } catch (e: any) {
      // Remove loading card on error
      toast.error(e.message)
      setDesignAssets(prev => prev.filter(a => a.id !== tempId))
    }
  }

  useEffect(() => {
    const loadPageData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in');
        // Even for non-users, show example assets
        setDesignAssets(getExampleAssets());
        setLoading(false);
        return;
      }

      setUser(user);

      // Fetch profile and assets in parallel
      const [profileResponse, assetsResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (profileResponse.data) {
        setProfile(profileResponse.data);
        if (profileResponse.data.credits_remaining !== undefined && profileResponse.data.credits_remaining !== null) {
          setCreditsRemaining(profileResponse.data.credits_remaining)
        }
      }




      if (assetsResponse.error) {
        setLoading(false);
        return;
      }

      let finalAssets = assetsResponse.data;

      // Only seed if user has absolutely no assets at all
      if (!finalAssets || finalAssets.length === 0) {
        const exampleAssetsToSeed = getExampleAssets().map(asset => ({
          user_id: user.id,
          type: 'image' as const,
          url: asset.url,
          prompt: asset.prompt
        }));

        // Double-check before inserting to prevent race conditions
        const { data: recheckAssets } = await supabase
          .from('user_assets')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!recheckAssets || recheckAssets.length === 0) {
          const { data: seededAssets, error: seedError } = await supabase
            .from('user_assets')
            .insert(exampleAssetsToSeed)
            .select();

          if (seedError) {
            setDesignAssets(getExampleAssets());
          } else if (seededAssets) {
            finalAssets = seededAssets;
          }
        } else {
          // Assets were created by another page/tab, fetch them
          const { data: refreshedAssets } = await supabase
            .from('user_assets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          finalAssets = refreshedAssets || [];
        }
      }

      // Transform and set the final assets
      const transformedAssets = finalAssets.map(asset => ({
        id: asset.id,
        type: asset.type as 'image' | 'model3d',
        url: asset.url,
        prompt: asset.prompt || '',
        timestamp: asset.created_at,
        format: asset.format as 'glb' | 'stl' | 'obj' | undefined,
        thumbnailUrl: asset.thumbnail_url
      }));

      setDesignAssets(transformedAssets);
      setLoading(false);
    };

    loadPageData();
  }, []);

  const getExampleAssets = () => [
    {
      id: '1',
      type: 'image' as const,
      url: '/image/_m9z719mqsvg3fznyh33l_0.webp',
      prompt: 'Metallic silver hypercar with aggressive aerodynamic body kit, large rear wing, angular design, yellow brake calipers, modern track-focused styling, outdoor concrete setting',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'image' as const,
      url: '/image/_rflke8qieluposl2cjot_0.webp',
      prompt: 'Coral pink sports car with sleek modern design, dramatic studio lighting, dark moody atmosphere, top-down angle view, LED taillights, positioned on curved surface with pink accent lighting',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      type: 'image' as const,
      url: '/image/create_a_very_very_beautiful_aesthetically_pleasing_image_that_looks_exactly_like_this_where_its_ci_2vhr50z6s676wi5g7f13_1.webp',
      prompt: 'Classic 1970s American muscle car in dark olive green, rear spoiler, chrome details, studio photography with clean gray background, vintage automotive design',
      timestamp: new Date().toISOString()
    }
  ];


  const handleReferenceImage = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const newImages = [...referenceImages]
      newImages[index] = file
      setReferenceImages(newImages)

      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreviews = [...referencePreviews]
        newPreviews[index] = reader.result as string
        setReferencePreviews(newPreviews)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeReferenceImage = (index: number) => {
    const newImages = [...referenceImages]
    newImages[index] = null
    setReferenceImages(newImages)

    const newPreviews = [...referencePreviews]
    newPreviews[index] = null
    setReferencePreviews(newPreviews)
  }

  const generateImage = async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt'); return }
    if (!user) { router.push('/sign-in'); return }
    if (!isPaidActive) { setShowUpgradeModal(true); return }

    // Check credits before starting
    if (creditsRemaining < IMAGE_COST) {
      setShowUpgradeModal(true)
      return
    }

    setGenerating(true)
    const loadingId = `loading-${Date.now()}`
    const loadingAsset = { id: loadingId, type: 'image' as const, url: '', prompt, timestamp: new Date().toISOString(), isGenerating: true }
    setDesignAssets(prev => [loadingAsset, ...prev])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Collect all non-null reference images
      const referenceImagesList = referencePreviews.filter(preview => preview !== null)

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          prompt,
          reference_images: referenceImagesList.length > 0 ? referenceImagesList : undefined,
          aspect_ratio: '16:9',
          output_format: 'jpg'
        })
      })

      if (!response.ok) throw new Error('Generation failed')
      const data = await response.json()
      const a = data.asset || {}
      const imageUrl = data.imageUrl || a.url
      
      // Save to user_assets database table for persistence
      const { data: savedAsset } = await supabase
        .from('user_assets')
        .insert({
          user_id: user.id,
          type: 'image',
          url: imageUrl,
          prompt: a.prompt || prompt,
          thumbnail_url: imageUrl
        })
        .select()
        .single()
      
      const newAsset = { 
        id: savedAsset?.id || a.id || Date.now().toString(), 
        type: 'image' as const, 
        url: imageUrl, 
        prompt: a.prompt || prompt, 
        timestamp: new Date().toISOString(), 
        isGenerating: false 
      }
      setDesignAssets(prev => prev.map(asset => asset.id === loadingId ? newAsset : asset))
      
      // Deduct credits locally and persist
      const newCredits = Math.max(0, creditsRemaining - IMAGE_COST)
      setCreditsRemaining(newCredits)
      await supabase.from('profiles').update({ credits_remaining: newCredits }).eq('id', user.id)
    } catch (error) {
      setDesignAssets(prev => prev.filter(asset => asset.id !== loadingId))
      toast.error('Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  // Handle 3D generation from ImageCard (segmented flow)
  const handleGenerate3D = async (imageUrl: string, points: { x: number, y: number, label: 1 | 0 }[]) => {
    if (!user) { router.push('/sign-in'); return }
    if (!isPaidActive || creditsRemaining < MODEL3D_COST) { setShowUpgradeModal(true); return }

    const loadingToast = toast.loading('Generating 3D model from selection...')

    try {
      const segmentResponse = await fetch('/api/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageUrl,
          points: points
        })
      })

      const segmentData = await segmentResponse.json()

      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: segmentData.segmentedImage,
          // Uses backend default provider
        })
      })

      const data = await response.json()

      toast.dismiss(loadingToast)
      toast.success('3D model generated!')

      // Save to Supabase user_assets table
      if (user) {
        const { data: savedAsset, error: saveError } = await supabase
          .from('user_assets')
          .insert({
            user_id: user.id,
            type: 'model3d',
            url: data.modelUrl,
            prompt: 'Generated 3D model from image segment',
            format: data.format || 'glb',
            thumbnail_url: imageUrl
          })
          .select()
          .single()

        // Add 3D model to design assets feed (at the top)
        const newAsset = {
          id: savedAsset?.id || Date.now().toString(),
          type: 'model3d' as const,
          url: data.modelUrl,
          prompt: 'Generated 3D model from image segment',
          timestamp: new Date().toISOString(),
          format: data.format || 'glb',
          thumbnailUrl: imageUrl
        }
        setDesignAssets(prev => [newAsset, ...prev])
      }

      // Deduct credits
      const newCredits = Math.max(0, creditsRemaining - MODEL3D_COST)
      setCreditsRemaining(newCredits)
      await supabase.from('profiles').update({ credits_remaining: newCredits }).eq('id', user.id)

    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        creditsRemaining={creditsRemaining}
        requiredCredits={3}
        requiredTier={requiredTier}
        billingInterval="month"
        hasActivePaidPlan={isPaidActive}
      />

      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left Panel - Generation Form */}
        <div className="w-full lg:w-80 border-b lg:border-r lg:border-b-0 border-white/5 bg-gradient-to-b from-black/50 via-black/30 to-black/50 backdrop-blur-sm p-4 lg:p-6 flex flex-col">
          <div className="mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-white/5">
            <Link href="/dashboard" className="flex items-center gap-2 text-xs font-light text-gray-400 hover:text-white transition-colors mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
              <span className="text-[10px] font-light text-gray-500 uppercase tracking-wide">Credits</span>
              <span className="text-sm font-thin text-white">{creditsRemaining}</span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="mb-4 lg:mb-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => setMode('text')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-xs transition-colors ${mode === 'text'
                  ? 'bg-white text-black'
                  : 'hover:bg-white/10 text-gray-400'
                  }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Text Prompt</span>
              </button>
              <button
                onClick={() => setMode('sketch')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-xs transition-colors ${mode === 'sketch'
                  ? 'bg-white text-black'
                  : 'hover:bg-white/10 text-gray-400'
                  }`}
              >
                <Paintbrush className="w-3 h-3" />
                <span>Sketch</span>
              </button>
            </div>
          </div>

          {/* Text Mode */}
          {mode === 'text' && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-sm font-light text-white mb-3 uppercase tracking-wide">Prompt</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your car in detail..."
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-light focus:outline-none focus:border-white/30 transition-colors resize-none h-24 lg:h-32"
                disabled={generating}
              />
              <p className="text-[10px] text-gray-500 mt-2">Be specific about style, color, angle, and details</p>
            </div>
          )}

          {/* Sketch Mode */}
          {mode === 'sketch' && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-sm font-light text-white mb-3 uppercase tracking-wide">Drawing Tools</h3>
              <p className="text-xs text-gray-500 mb-3">Use the canvas on the right to draw your design →</p>

              <div>

                {/* Drawing Tools */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-light text-gray-400 mb-2 block">Tool</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTool('pen')}
                        className={`flex-1 p-2 rounded text-xs flex items-center justify-center gap-2 ${tool === 'pen' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                          }`}
                      >
                        <Paintbrush className="w-3 h-3" />
                        Pen
                      </button>
                      <button
                        onClick={() => setTool('eraser')}
                        className={`flex-1 p-2 rounded text-xs flex items-center justify-center gap-2 ${tool === 'eraser' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                          }`}
                      >
                        <Eraser className="w-3 h-3" />
                        Eraser
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-light text-gray-400 mb-2 block">Brush Size: {brushSize}px</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                      />
                      <button
                        onClick={() => setBrushSize(Math.min(50, brushSize + 1))}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-light text-gray-400 mb-2 block">Color</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (historyStep > 0 && canvasRef.current) {
                          const ctx = canvasRef.current.getContext('2d')
                          if (ctx) {
                            const newStep = historyStep - 1
                            setHistoryStep(newStep)
                            ctx.putImageData(history[newStep], 0, 0)
                          }
                        }
                      }}
                      disabled={historyStep <= 0}
                      className="flex-1 p-2 rounded text-xs flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-30"
                    >
                      <Undo className="w-3 h-3" />
                      Undo
                    </button>
                    <button
                      onClick={() => {
                        if (historyStep < history.length - 1 && canvasRef.current) {
                          const ctx = canvasRef.current.getContext('2d')
                          if (ctx) {
                            const newStep = historyStep + 1
                            setHistoryStep(newStep)
                            ctx.putImageData(history[newStep], 0, 0)
                          }
                        }
                      }}
                      disabled={historyStep >= history.length - 1}
                      className="flex-1 p-2 rounded text-xs flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-30"
                    >
                      <Redo className="w-3 h-3" />
                      Redo
                    </button>
                    <button
                      onClick={() => {
                        if (canvasRef.current) {
                          const canvas = canvasRef.current
                          const ctx = canvas.getContext('2d')
                          if (ctx) {
                            ctx.fillStyle = '#FFFFFF'
                            ctx.fillRect(0, 0, canvas.width, canvas.height)
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                            const newHistory = history.slice(0, historyStep + 1)
                            newHistory.push(imageData)
                            setHistory(newHistory)
                            setHistoryStep(newHistory.length - 1)
                          }
                        }
                      }}
                      className="flex-1 p-2 rounded text-xs flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 lg:mb-8">
            <h3 className="text-sm font-light text-white mb-3 uppercase tracking-wide">Reference Images (up to 3)</h3>
            <p className="text-[10px] text-gray-500 mb-3">Add reference images to guide the AI generation</p>

            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => (
                <label key={index} className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleReferenceImage(e, index)}
                    className="hidden"
                    disabled={generating}
                  />
                  <div className="border border-dashed border-white/10 rounded-lg p-2 text-center cursor-pointer hover:border-white/20 transition-colors h-full">
                    {referencePreviews[index] ? (
                      <div className="relative">
                        <img src={referencePreviews[index]!} alt={`Reference ${index + 1}`} className="w-full h-20 object-cover rounded" />
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            removeReferenceImage(index)
                          }}
                          className="absolute top-1 right-1 p-0.5 bg-black/70 rounded hover:bg-black/90 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <p className="text-[9px] text-gray-500">{index + 1}</p>
                      </>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={async () => {
              if (mode === 'sketch') {
                // Save sketch to reference images
                if (canvasRef.current) {
                  const dataUrl = canvasRef.current.toDataURL('image/png')
                  // Add to first reference image slot
                  const newPreviews = [dataUrl, ...referencePreviews.slice(1)]
                  setReferencePreviews(newPreviews as (string | null)[])
                  toast.success('Sketch saved as reference image!')
                  return
                }
              } else {
                await generateImage()
              }
            }}
            disabled={(mode === 'text' && !prompt.trim()) || generating}
            className={`w-full py-3 rounded font-light text-sm transition-all duration-300 flex items-center justify-center gap-2 ${generating || (mode === 'text' && !prompt.trim())
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-200'
              }`}
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                {mode === 'sketch' ? <Paintbrush className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {mode === 'sketch' ? 'Save as Reference' : 'Generate Image'}
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Canvas or Gallery */}
        <div className="flex-1 bg-gradient-to-br from-black via-black/95 to-black/90 overflow-y-auto p-6">
          {mode === 'sketch' ? (
            /* Sketch Canvas - Always visible in sketch mode */
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-full max-w-5xl">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-light tracking-wider mb-2">DRAW YOUR DESIGN</h3>
                  <p className="text-xs text-gray-500">Use the tools on the left, then click "Save Sketch" button</p>
                </div>
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={800}
                  onMouseDown={(e) => {
                    const canvas = canvasRef.current
                    if (!canvas) return
                    setIsDrawing(true)
                    const ctx = canvas.getContext('2d')
                    if (!ctx) return
                    const rect = canvas.getBoundingClientRect()
                    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
                    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
                    ctx.beginPath()
                    ctx.moveTo(x, y)
                  }}
                  onMouseMove={(e) => {
                    if (!isDrawing) return
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const ctx = canvas.getContext('2d')
                    if (!ctx) return
                    const rect = canvas.getBoundingClientRect()
                    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
                    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
                    ctx.lineWidth = brushSize
                    ctx.lineCap = 'round'
                    ctx.lineJoin = 'round'
                    if (tool === 'eraser') {
                      ctx.globalCompositeOperation = 'destination-out'
                      ctx.strokeStyle = 'rgba(0,0,0,1)'
                    } else {
                      ctx.globalCompositeOperation = 'source-over'
                      ctx.strokeStyle = color
                    }
                    ctx.lineTo(x, y)
                    ctx.stroke()
                  }}
                  onMouseUp={() => {
                    if (!isDrawing) return
                    setIsDrawing(false)
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const ctx = canvas.getContext('2d')
                    if (!ctx) return
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    const newHistory = history.slice(0, historyStep + 1)
                    newHistory.push(imageData)
                    setHistory(newHistory)
                    setHistoryStep(newHistory.length - 1)
                  }}
                  onMouseLeave={() => setIsDrawing(false)}
                  className="w-full border border-white/20 rounded-lg cursor-crosshair bg-white shadow-2xl"
                  style={{ maxHeight: 'calc(100vh - 200px)', height: 'auto', aspectRatio: '3/2' }}
                />

                {/* Render Controls - Simple and minimal */}
                <div className="mt-4 flex items-center gap-4 max-w-5xl">
                  {/* Drawing Influence Slider - Compact */}
                  <div className="flex items-center gap-3 flex-1">
                    <label className="text-xs text-gray-400 whitespace-nowrap">
                      Influence: {drawingInfluence}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={drawingInfluence}
                      onChange={(e) => setDrawingInfluence(Number(e.target.value))}
                      className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                      disabled={generating}
                    />
                  </div>

                  {/* Render Button - Same style as Make 3D */}
                  <button
                    onClick={async () => {
                      if (!user) { router.push('/sign-in'); return }
                      if (!canvasRef.current) { toast.error('No sketch found'); return }

                      if (creditsRemaining < 5) {
                        if (!isPaidActive) setShowUpgradeModal(true)
                        return
                      }

                      setGenerating(true)
                      const loadingId = `loading-sketch-${Date.now()}`
                      const loadingAsset = {
                        id: loadingId,
                        type: 'image' as const,
                        url: '',
                        prompt: prompt.trim() ? `Sketch: ${prompt}` : 'Sketch rendering',
                        timestamp: new Date().toISOString(),
                        isGenerating: true
                      }
                      setDesignAssets(prev => [loadingAsset, ...prev])

                      try {
                        // Get current canvas as blob
                        const canvas = canvasRef.current
                        const dataUrl = canvas.toDataURL('image/png')
                        const base64Response = await fetch(dataUrl)
                        const blob = await base64Response.blob()
                        const fileName = `sketches/${user.id}/${Date.now()}.png`

                        const { data: uploadData, error: uploadError } = await supabase.storage
                          .from('user-sketches')
                          .upload(fileName, blob, { contentType: 'image/png' })

                        if (uploadError) throw new Error('Failed to upload sketch')

                        const { data: { publicUrl } } = supabase.storage
                          .from('user-sketches')
                          .getPublicUrl(fileName)

                        const { data: { session } } = await supabase.auth.getSession()
                        const token = session?.access_token

                        const response = await fetch('/api/sketch-to-render', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({
                            sketch_image_url: publicUrl,
                            prompt: prompt.trim() || 'render this sketch as a realistic car design',
                            drawing_influence: drawingInfluence / 100,
                            style_preset: stylePreset,
                            negative_prompt: 'blurry, low quality, distorted, ugly'
                          })
                        })

                        if (response.status === 402) {
                          if (!isPaidActive) setShowUpgradeModal(true)
                          setDesignAssets(prev => prev.filter(a => a.id !== loadingId))
                          setGenerating(false)
                          return
                        }

                        if (!response.ok) throw new Error('Sketch rendering failed')

                        const data = await response.json()
                        const a = data.asset || {}
                        const newAsset = {
                          id: a.id || Date.now().toString(),
                          type: 'image' as const,
                          url: data.imageUrl || a.url,
                          prompt: a.prompt ? `Sketch: ${a.prompt}` : (prompt.trim() ? `Sketch: ${prompt}` : 'Sketch render'),
                          timestamp: new Date().toISOString(),
                          isGenerating: false
                        }
                        setDesignAssets(prev => prev.map(asset => asset.id === loadingId ? newAsset : asset))

                        await fetchCredits()
                        toast.success('Rendered! ✨')
                      } catch (error: any) {
                        setDesignAssets(prev => prev.filter(asset => asset.id !== loadingId))
                        toast.error(error.message || 'Failed to render')
                      } finally {
                        setGenerating(false)
                      }
                    }}
                    disabled={generating}
                    className={`px-3 py-1.5 text-[11px] rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${generating
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-200'
                      }`}
                  >
                    {generating ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        Rendering...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Render Sketch
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) :
            designAssets.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-gray-500">No designs yet</p>
                <p className="text-xs text-gray-600 mt-2">Start by entering a prompt and clicking generate</p>
              </div>
            ) : (
              <div className="space-y-6">
                {designAssets.map((asset) => (
                  asset.type === 'image' ? (
                    <ImageCard
                      key={asset.id}
                      image={asset}
                      onGenerate3D={handleGenerate3D}
                      onMake3D={handleMake3D}
                    />
                  ) : (
                    <ModelAssetCard key={asset.id} asset={asset as any} />
                  )
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
