'use client'

import { useState, useEffect } from 'react'
import { X, Package, Ruler, DollarSign, Check, Loader2, Box } from 'lucide-react'
import toast from 'react-hot-toast'

interface Material {
  id: string
  name: string
  technology: string
  description?: string
  price_per_cm3?: number
}

interface ShipDesignModalProps {
  isOpen: boolean
  onClose: () => void
  model: {
    id: string
    name: string
    thumbnail: string
    url: string
    format: string
  }
  userEmail?: string
}

export default function ShipDesignModal({ 
  isOpen, 
  onClose, 
  model,
  userEmail 
}: ShipDesignModalProps) {
  const [step, setStep] = useState<'materials' | 'size' | 'quote'>('materials')
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  
  // Size options
  const [unit, setUnit] = useState<'mm' | 'cm' | 'in'>('mm')
  const [scale, setScale] = useState(1.0)
  
  // Quote data
  const [quoteData, setQuoteData] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      loadMaterials()
      setStep('materials')
      setSelectedMaterial(null)
      setQuoteData(null)
    }
  }, [isOpen])

  const loadMaterials = async () => {
    setLoadingMaterials(true)
    try {
      const response = await fetch('/api/sculpteo/materials')
      
      if (!response.ok) {
        throw new Error('Failed to load materials')
      }
      
      const data = await response.json()
      setMaterials(data.materials || [])
      
    } catch (error) {
      console.error('Error loading materials:', error)
      toast.error('Failed to load materials', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
    } finally {
      setLoadingMaterials(false)
    }
  }

  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material)
  }

  const handleContinueToSize = () => {
    if (!selectedMaterial) {
      toast.error('Please select a material')
      return
    }
    setStep('size')
  }

  const handleContinueToQuote = async () => {
    if (!selectedMaterial) return
    
    setStep('quote')
    setLoading(true)
    
    try {
      // Call backend to generate Sculpteo upload URL
      const response = await fetch('/api/sculpteo/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: model.id,
          design_name: model.name,
          user_email: userEmail,
          unit: unit,
          scale: scale,
          material: selectedMaterial.id,
          description: `3D model: ${model.name}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quote')
      }

      const data = await response.json()
      setQuoteData(data)
      
    } catch (error) {
      console.error('Error generating quote:', error)
      toast.error('Failed to generate quote', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
      setStep('size')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptQuote = () => {
    if (!quoteData) return
    
    // Create form and submit to Sculpteo
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = quoteData.upload_url
    form.target = '_blank' // Open in new tab
    
    Object.entries(quoteData.form_data).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value as string
      form.appendChild(input)
    })
    
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
    
    toast.success('Redirecting to Sculpteo...', {
      style: {
        background: '#0a0a0a',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    })
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-light">Ship Design to 3D Printing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Model Preview */}
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                <img
                  src={model.thumbnail}
                  alt={model.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">{model.name}</h3>
                <p className="text-xs text-gray-400">{model.format} format</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 pt-4">
                <div className={`flex items-center gap-2 text-xs ${
                  step === 'materials' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    step !== 'materials' ? 'border-green-500 bg-green-500/10' : 'border-red-500'
                  }`}>
                    {step !== 'materials' ? <Check className="w-3 h-3 text-green-500" /> : '1'}
                  </div>
                  <span>Material</span>
                </div>
                <div className="flex-1 h-px bg-white/10" />
                <div className={`flex items-center gap-2 text-xs ${
                  step === 'size' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    step === 'quote' ? 'border-green-500 bg-green-500/10' : step === 'size' ? 'border-red-500' : 'border-white/20'
                  }`}>
                    {step === 'quote' ? <Check className="w-3 h-3 text-green-500" /> : '2'}
                  </div>
                  <span>Size</span>
                </div>
                <div className="flex-1 h-px bg-white/10" />
                <div className={`flex items-center gap-2 text-xs ${
                  step === 'quote' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    step === 'quote' ? 'border-red-500' : 'border-white/20'
                  }`}>
                    3
                  </div>
                  <span>Quote</span>
                </div>
              </div>
            </div>

            {/* Right: Configuration */}
            <div>
              {/* Step 1: Material Selection */}
              {step === 'materials' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <Box className="w-4 h-4" />
                      Select Material
                    </h3>
                    <p className="text-xs text-gray-400">Choose the material for your 3D print</p>
                  </div>

                  {loadingMaterials ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {materials.slice(0, 20).map((material) => (
                        <button
                          key={material.id}
                          onClick={() => handleMaterialSelect(material)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedMaterial?.id === material.id
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{material.name}</div>
                              <div className="text-xs text-gray-400">{material.technology}</div>
                              {material.description && (
                                <div className="text-xs text-gray-500 mt-1">{material.description}</div>
                              )}
                            </div>
                            {selectedMaterial?.id === material.id && (
                              <Check className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Size Confirmation */}
              {step === 'size' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      Confirm Size
                    </h3>
                    <p className="text-xs text-gray-400">Adjust the scale and units for your model</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="font-medium text-sm mb-2">Selected Material</div>
                    <div className="text-sm text-gray-400">{selectedMaterial?.name}</div>
                    <div className="text-xs text-gray-500">{selectedMaterial?.technology}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2">Unit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['mm', 'cm', 'in'] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => setUnit(u)}
                          className={`py-2 px-4 rounded border text-sm transition-all ${
                            unit === u
                              ? 'border-red-500 bg-red-500/10 text-white'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2">
                      Scale: {scale.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.1x</span>
                      <span>5x</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    💡 The final size will be determined by Sculpteo based on your model's geometry
                  </div>
                </div>
              )}

              {/* Step 3: Quote */}
              {step === 'quote' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Quote & Pricing
                    </h3>
                    <p className="text-xs text-gray-400">Review and proceed to Sculpteo for final pricing</p>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                      <p className="text-sm text-gray-400">Generating quote...</p>
                    </div>
                  ) : quoteData ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                        <div>
                          <div className="text-xs text-gray-400">Material</div>
                          <div className="text-sm font-medium">{selectedMaterial?.name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Unit & Scale</div>
                          <div className="text-sm">{unit} • {scale.toFixed(2)}x</div>
                        </div>
                        <div className="pt-3 border-t border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Status</div>
                          <div className="text-sm text-green-400 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Ready for final quote on Sculpteo
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-gray-300 space-y-2">
                        <div className="font-medium">What happens next?</div>
                        <ul className="space-y-1 text-gray-400">
                          <li>• You'll be redirected to Sculpteo's platform</li>
                          <li>• Your model will be automatically loaded</li>
                          <li>• You'll see the exact price and delivery time</li>
                          <li>• Complete your order securely on Sculpteo</li>
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-light text-gray-400 hover:text-white transition-colors"
          >
            Maybe Later
          </button>

          <div className="flex gap-2">
            {step !== 'materials' && (
              <button
                onClick={() => setStep(step === 'quote' ? 'size' : 'materials')}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded text-sm font-light hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            )}
            
            {step === 'materials' && (
              <button
                onClick={handleContinueToSize}
                disabled={!selectedMaterial}
                className="px-6 py-2 bg-gradient-to-br from-red-500/70 via-red-600/60 to-red-500/70 border border-red-500/40 rounded text-sm font-light text-white hover:from-red-500/90 hover:via-red-600/80 hover:to-red-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
            
            {step === 'size' && (
              <button
                onClick={handleContinueToQuote}
                className="px-6 py-2 bg-gradient-to-br from-red-500/70 via-red-600/60 to-red-500/70 border border-red-500/40 rounded text-sm font-light text-white hover:from-red-500/90 hover:via-red-600/80 hover:to-red-500/90 transition-all"
              >
                Get Quote
              </button>
            )}
            
            {step === 'quote' && quoteData && !loading && (
              <button
                onClick={handleAcceptQuote}
                className="px-6 py-2 bg-gradient-to-br from-green-500/70 via-green-600/60 to-green-500/70 border border-green-500/40 rounded text-sm font-light text-white hover:from-green-500/90 hover:via-green-600/80 hover:to-green-500/90 transition-all flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Continue to Sculpteo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
