'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { Sparkles, Image as ImageIcon, Download, Loader, X, Paintbrush, Eraser, Undo, Redo, Trash2, Minus, Plus } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
// All credits and asset writes now happen on the backend
import ImageCard from '../../components/ImageCard'
import ModelViewer3D from '../../components/ModelViewer3D'
import UpgradeModal from '../../components/UpgradeModal'

export default function ImagePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0)
  
  // Form states
  const [prompt, setPrompt] = useState('')
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  const [mode, setMode] = useState<'text' | 'sketch'>('text')
  const [sketchImage, setSketchImage] = useState<string>('')
  
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

  // Fetch credit balance from backend
  const fetchCredits = async () => {
    if (!user) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/external/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resp.ok) {
        const data = await resp.json()
        setCreditsRemaining(data.credits_remaining || 0)
      }
    } catch (e) {
      console.error('Failed to fetch credits:', e)
    }
  }

  // Handle 1-click 3D (no segmentation) using backend provider
  const handleMake3D = async (imageUrl: string) => {
    if (!user) { router.push('/sign-in'); return }

    // Check credits before starting
    if (creditsRemaining < 14) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/external/generate-3d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ image_url: imageUrl, provider: 'hyper3d' })
      })
      if (response.status === 402) {
        setShowUpgradeModal(true)
        // Remove temp card
        setDesignAssets(prev => prev.filter(a => a.id !== tempId))
        return
      }
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to generate 3D')

      const a = data.asset || {}
      const finalized = {
        id: a.id || Date.now().toString(),
        type: 'model3d' as const,
        url: data.modelUrl || a.url,
        prompt: a.prompt || '3D model',
        timestamp: new Date().toISOString(),
        format: data.format || a.format || 'glb',
        thumbnailUrl: imageUrl,
        isGenerating: false,
      }
      setDesignAssets(prev => prev.map(x => x.id === tempId ? finalized : x))
      // Refresh credits after successful generation
      await fetchCredits()
    } catch (e) {
      // Remove loading card on error
      setDesignAssets(prev => prev.filter(a => a.id !== tempId))
    }
  }

  // Small inline component to render a model with split controls
  const ModelAssetCard = ({ asset }: { asset: { id: string; url: string; prompt: string; format?: string; isGenerating?: boolean } }) => {
    const [split, setSplit] = useState(false)
    const [sep, setSep] = useState(0.8)
    const [serverSplitLoading, setServerSplitLoading] = useState(false)
    const [modelUrlOverride, setModelUrlOverride] = useState<string | null>(null)

    const doServerSplit = async () => {
      try {
        setServerSplitLoading(true)
        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/external/split-3d`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model_url: modelUrlOverride || asset.url, mode: 'by-node', explode: sep }),
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data?.detail || data?.error || 'Split failed')
        setModelUrlOverride(data.modelUrl)
        setSplit(true)
      } catch (e) {
        // No toast; silent failure could be confusing. Minimal alert for now.
        alert('Server-side split failed')
      } finally {
        setServerSplitLoading(false)
      }
    }
    return (
      <div className="border border-white/10 rounded-lg overflow-hidden bg-black/50">
        <div className="p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-200">3D Model</p>
            <p className="text-xs text-gray-500">{asset.prompt}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/studio?model=${encodeURIComponent(asset.url)}`} className="px-3 py-1.5 bg-white text-black rounded text-xs hover:bg-gray-200">View in Studio</Link>
          </div>
        </div>
        <div className="h-[360px] border-t border-white/10">
          {asset.isGenerating || !(modelUrlOverride || asset.url) ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 mt-2">Generating 3D model…</p>
              </div>
            </div>
          ) : (
            <ModelViewer3D modelUrl={modelUrlOverride || asset.url} explode={split} explodeFactor={sep} className="w-full h-full" />
          )}
        </div>
        <div className="p-3 flex items-center gap-3 border-t border-white/10 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />
            Split parts
          </label>
          <input type="range" min={0} max={2} step={0.1} value={sep} onChange={(e) => setSep(parseFloat(e.target.value))} className="flex-1" />
          <span className="text-[10px] text-gray-500 w-8 text-right">{sep.toFixed(1)}</span>
          <button onClick={doServerSplit} disabled={serverSplitLoading} className={`px-3 py-1.5 text-xs rounded ${serverSplitLoading ? 'bg-white/10 text-gray-400' : 'bg-white text-black hover:bg-gray-200'}`}>
            {serverSplitLoading ? 'Splitting…' : 'Request server-side split'}
          </button>
        </div>
      </div>
    )
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
      }

      // Fetch credits from backend
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        try {
          const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/external/credits/balance`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (resp.ok) {
            const data = await resp.json()
            setCreditsRemaining(data.credits_remaining || 0)
          }
        } catch (e) {
          console.error('Failed to fetch credits:', e)
        }
      }

      if (assetsResponse.error) {
        console.error('Failed to load assets:', assetsResponse.error);
        setLoading(false);
        return;
      }

      let finalAssets = assetsResponse.data;

      // Only seed if user has absolutely no assets at all
      if (!finalAssets || finalAssets.length === 0) {
        console.log('No assets found, seeding examples...');
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
            console.error('Failed to seed example assets:', seedError);
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


  const handleReferenceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReferenceImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setReferencePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateImage = async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt'); return }
    if (!user) { router.push('/sign-in'); return }

    // Check credits before starting
    if (creditsRemaining < 3) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/external/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt, previousImage: referencePreview, aspect_ratio: '16:9', output_format: 'jpg' })
      })
      if (response.status === 402) {
        setShowUpgradeModal(true)
        setDesignAssets(prev => prev.filter(a => a.id !== loadingId))
        setGenerating(false)
        return
      }
      if (!response.ok) throw new Error('Generation failed')
      const data = await response.json()
      const a = data.asset || {}
      const newAsset = { id: a.id || Date.now().toString(), type: 'image' as const, url: data.imageUrl || a.url, prompt: a.prompt || prompt, timestamp: new Date().toISOString(), isGenerating: false }
      setDesignAssets(prev => prev.map(asset => asset.id === loadingId ? newAsset : asset))
      // Refresh credits after successful generation
      await fetchCredits()
    } catch (error) {
      setDesignAssets(prev => prev.filter(asset => asset.id !== loadingId))
      toast.error('Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  // Handle 3D generation from ImageCard (segmented flow)
  const handleGenerate3D = async (imageUrl: string, points: {x: number, y: number, label: 1 | 0}[]) => {
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
          provider: 'hyper3d'  // Use Hyper3D for best quality with part separation
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
        
        if (saveError) {
          console.error('Failed to save 3D asset:', saveError)
        }
        
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
      
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Failed to generate 3D model')
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
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-xs transition-colors ${
                  mode === 'text'
                    ? 'bg-white text-black'
                    : 'hover:bg-white/10 text-gray-400'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Text Prompt</span>
              </button>
              <button
                onClick={() => setMode('sketch')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-xs transition-colors ${
                  mode === 'sketch'
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
              <h3 className="text-sm font-light text-white mb-3 uppercase tracking-wide">Sketch Your Design</h3>
              
              {sketchImage && (
                <div className="relative mb-4">
                  <img src={sketchImage} alt="Your sketch" className="w-full rounded-lg border border-white/10" />
                  <button
                    onClick={() => setSketchImage('')}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
                  >
                    Clear & Redraw
                  </button>
                </div>
              )}
              
              {!sketchImage && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">Use the canvas on the right to draw your design →</p>
                  
                  {/* Drawing Tools */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-light text-gray-400 mb-2 block">Tool</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTool('pen')}
                          className={`flex-1 p-2 rounded text-xs flex items-center justify-center gap-2 ${
                            tool === 'pen' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <Paintbrush className="w-3 h-3" />
                          Pen
                        </button>
                        <button
                          onClick={() => setTool('eraser')}
                          className={`flex-1 p-2 rounded text-xs flex items-center justify-center gap-2 ${
                            tool === 'eraser' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
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
              )}

              {sketchImage && (
                <div>
                  <h3 className="text-sm font-light text-white mb-2 uppercase tracking-wide">Add Details (Optional)</h3>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Make it matte black, add carbon fiber spoiler, aggressive stance..."
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-light focus:outline-none focus:border-white/30 transition-colors resize-none h-20"
                    disabled={generating}
                  />
                </div>
              )}
            </div>
          )}

          <div className="mb-6 lg:mb-8">
            <h3 className="text-sm font-light text-white mb-3 uppercase tracking-wide">Reference Image</h3>
            <label className="block w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleReferenceImage}
                className="hidden"
                disabled={generating}
              />
              <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-white/20 transition-colors">
                {referencePreview ? (
                  <div className="relative">
                    <img src={referencePreview} alt="Reference" className="w-full h-32 object-cover rounded" />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setReferenceImage(null)
                        setReferencePreview(null)
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded hover:bg-black/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-xs text-gray-400">Upload reference (optional)</p>
                  </>
                )}
              </div>
            </label>
          </div>

          <button
            onClick={async () => {
              if (mode === 'sketch') {
                if (!sketchImage && canvasRef.current) {
                  const dataUrl = canvasRef.current.toDataURL('image/png')
                  setSketchImage(dataUrl)
                  return
                }
                if (!sketchImage) { toast.error('Please draw something first'); return }
                if (!user) { router.push('/sign-in'); return }
                // Use sketch as reference
                setReferencePreview(sketchImage)
                await generateImage()
              } else {
                await generateImage()
              }
            }}
            disabled={(mode === 'text' && !prompt.trim()) || generating}
            className={`w-full py-3 rounded font-light text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              generating || (mode === 'text' && !prompt.trim())
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {mode === 'sketch' ? 'Rendering Sketch...' : 'Generating...'}
              </>
            ) : (
              <>
                {mode === 'sketch' ? <Paintbrush className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {mode === 'sketch' ? (sketchImage ? 'Render Sketch' : 'Save Sketch') : 'Generate Image'}
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Canvas or Gallery */}
        <div className="flex-1 bg-gradient-to-br from-black via-black/95 to-black/90 overflow-y-auto p-6">
          {mode === 'sketch' && !sketchImage ? (
            /* Large Sketch Canvas */
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
