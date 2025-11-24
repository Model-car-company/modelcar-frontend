'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { Sparkles, Image as ImageIcon, Download, Loader, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { checkCredits, deductCredits, CREDIT_COSTS } from '../../lib/credits'
import ImageCard from '../../components/ImageCard'
import UpgradeModal from '../../components/UpgradeModal'

export default function ImagePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Form states
  const [prompt, setPrompt] = useState('')
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  
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
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (!user) {
      toast.error('Please sign in to generate images')
      router.push('/sign-in')
      return
    }

    const creditCheck = await checkCredits(user.id, 'IMAGE_GENERATION')
    
    if (!creditCheck.hasEnough) {
      setShowUpgradeModal(true)
      return
    }

    setGenerating(true)
    
    // Create a loading card immediately
    const loadingId = `loading-${Date.now()}`
    const loadingAsset = {
      id: loadingId,
      type: 'image' as const,
      url: '',
      prompt: prompt,
      timestamp: new Date().toISOString(),
      isGenerating: true
    }
    setDesignAssets(prev => [loadingAsset, ...prev])
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          previousImage: referencePreview,
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
      await deductCredits(
        user.id,
        CREDIT_COSTS.IMAGE_GENERATION
      )
      
      // Save to Supabase user_assets table
      const { data: savedAsset, error: saveError } = await supabase
        .from('user_assets')
        .insert({
          user_id: user.id,
          type: 'image',
          url: data.imageUrl,
          prompt: prompt
        })
        .select()
        .single()
      
      if (saveError) {
        toast.error('Failed to save to garage', {
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        })
      }
      
      // Replace loading card with actual image
      const newAsset = {
        id: savedAsset?.id || Date.now().toString(),
        type: 'image' as const,
        url: data.imageUrl,
        prompt: prompt,
        timestamp: new Date().toISOString(),
        isGenerating: false
      }
      setDesignAssets(prev => prev.map(asset => 
        asset.id === loadingId ? newAsset : asset
      ))
      
      toast.success('Image generated successfully!', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
      
      // Refresh profile to get updated credits
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      
    } catch (error) {
      // Remove loading card on error
      setDesignAssets(prev => prev.filter(asset => asset.id !== loadingId))
      toast.error('Failed to generate image', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
    } finally {
      setGenerating(false)
    }
  }

  // Handle 3D generation from ImageCard
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
          provider: 'meshy'
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
        creditsRemaining={profile?.credits_remaining || 0}
        requiredCredits={CREDIT_COSTS.IMAGE_GENERATION}
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
              <span className="text-sm font-thin text-white">{profile?.credits_remaining || 0}</span>
            </div>
          </div>

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
            onClick={generateImage}
            disabled={!prompt.trim() || generating}
            className={`w-full py-3 rounded font-light text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              generating
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
                <Sparkles className="w-4 h-4" />
                Generate Image
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Design Assets (Images + 3D Models) */}
        <div className="flex-1 bg-gradient-to-br from-black via-black/95 to-black/90 overflow-y-auto p-6">
          {designAssets.length === 0 ? (
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
                  />
                ) : (
                  // 3D Model Card - TODO: Create ModelCard component
                  <div key={asset.id} className="border border-white/10 rounded-lg overflow-hidden bg-black/50 p-4">
                    <p className="text-sm text-gray-400">3D Model: {asset.prompt}</p>
                    <p className="text-xs text-gray-600 mt-2">Format: {asset.format}</p>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
