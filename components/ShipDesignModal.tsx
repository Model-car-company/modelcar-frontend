'use client'

import { useState, useEffect } from 'react'
import { X, Package, Ruler, DollarSign, Check, Loader2, Box } from 'lucide-react'
import toast from 'react-hot-toast'

interface Material {
  materialID: string
  materialName: string
  technology: string
  finishes: Finish[]
}

interface Finish {
  finishID: string
  finishName: string
  description?: string
  price_per_cm3?: number
  lead_time_days?: number
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
  const [step, setStep] = useState<'materials' | 'size' | 'invoice'>('materials')
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [selectedFinish, setSelectedFinish] = useState<Finish | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  
  // Size options
  const [unit, setUnit] = useState<'mm' | 'cm' | 'in'>('mm')
  const [scale, setScale] = useState(1.0)
  
  // Quote/preview data
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
      const response = await fetch('/api/imaterialise/materials')
      
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
    // Auto-select first finish if available
    if (material.finishes && material.finishes.length > 0) {
      setSelectedFinish(material.finishes[0])
    }
  }

  const handleContinueToSize = () => {
    if (!selectedMaterial || !selectedFinish) {
      toast.error('Please select a material and finish')
      return
    }
    setStep('size')
  }

  const handleContinueToInvoice = async () => {
    if (!selectedMaterial || !selectedFinish) {
      toast.error('Please select a material and finish')
      return
    }

    setLoading(true)
    setStep('invoice')
    
    try {
      // Get invoice from i.materialise invoice endpoint
      const response = await fetch('/api/imaterialise/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: model.id,
          material_id: selectedMaterial!.materialID,
          finish_id: selectedFinish!.finishID,
          quantity: 1,
          scale: scale,
          currency: 'USD'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get invoice')
      }

      const data = await response.json()
      setQuoteData(data)
      
    } catch (error) {
      console.error('Error getting invoice:', error)
      
      // Show placeholder data so UI is still visible
      setQuoteData({
        success: false,
        material_id: selectedMaterial!.materialID,
        finish_id: selectedFinish!.finishID,
        quantity: 1,
        total_price: null,
        unit_price: null,
        currency: 'USD',
        error: true
      })
      
      toast.error('Failed to get invoice - showing placeholder', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
    } finally {
      setLoading(false)
    }
  }
  const handleContinueToPayment = () => {
    // TODO: Integrate with Stripe or payment provider
    toast.success('Payment integration coming soon!', {
      style: {
        background: '#0a0a0a',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-gradient-to-b from-black via-black to-black/95 border border-white/10 rounded w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-white/60" strokeWidth={1.5} />
            <h2 className="text-lg font-thin tracking-wide">Ship Design to 3D Printing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Model Preview */}
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded overflow-hidden border border-white/10">
                <img
                  src={model.thumbnail}
                  alt={model.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-light text-sm mb-1 text-white">{model.name}</h3>
                <p className="text-[10px] font-light text-gray-500 uppercase tracking-wide">{model.format} format</p>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-3 gap-1.5 pt-4">
                {/* Step 1: Material */}
                <div className={`text-center ${step === 'materials' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-6 h-6 rounded-full border mx-auto mb-1 flex items-center justify-center text-[10px] ${
                    step !== 'materials' ? 'border-white/40 bg-white/10' : 'border-red-500/60 bg-red-500/10'
                  }`}>
                    {step !== 'materials' ? <Check className="w-3 h-3" strokeWidth={1.5} /> : '1'}
                  </div>
                  <p className="text-[9px] font-light tracking-wide uppercase">Material</p>
                </div>

                {/* Step 2: Size */}
                <div className={`text-center ${step === 'size' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-6 h-6 rounded-full border mx-auto mb-1 flex items-center justify-center text-[10px] ${
                    step === 'invoice' ? 'border-white/40 bg-white/10' : step === 'size' ? 'border-red-500/60 bg-red-500/10' : 'border-white/20'
                  }`}>
                    {step === 'invoice' ? <Check className="w-3 h-3" strokeWidth={1.5} /> : '2'}
                  </div>
                  <p className="text-[9px] font-light tracking-wide uppercase">Size</p>
                </div>

                {/* Step 3: Invoice */}
                <div className={`text-center ${step === 'invoice' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-6 h-6 rounded-full border mx-auto mb-1 flex items-center justify-center text-[10px] ${
                    step === 'invoice' ? 'border-red-500/60 bg-red-500/10' : 'border-white/20'
                  }`}>
                    3
                  </div>
                  <p className="text-[9px] font-light tracking-wide uppercase">Invoice</p>
                </div>
              </div>
            </div>

            {/* Right: Configuration */}
            <div>
              {/* Step 1: Material Selection */}
              {step === 'materials' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-light mb-1 flex items-center gap-2 tracking-wide">
                      <Box className="w-4 h-4" strokeWidth={1.5} />
                      Select Material
                    </h3>
                    <p className="text-[10px] font-light text-gray-500">Choose the material for your 3D print</p>
                  </div>

                  {loadingMaterials ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-white/40" strokeWidth={1.5} />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {materials.map((material) => (
                        <button
                          key={material.materialID}
                          onClick={() => handleMaterialSelect(material)}
                          className={`w-full text-left p-3 rounded border transition-all ${
                            selectedMaterial?.materialID === material.materialID
                              ? 'border-white/30 bg-white/5'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-light text-sm">{material.materialName}</div>
                              <div className="text-[10px] font-light text-gray-500 mt-0.5">{material.technology}</div>
                              <div className="text-[10px] font-light text-gray-600 mt-1">
                                {material.finishes.length} finish{material.finishes.length !== 1 ? 'es' : ''} available
                              </div>
                            </div>
                            {selectedMaterial?.materialID === material.materialID && (
                              <Check className="w-4 h-4 text-white flex-shrink-0 mt-1" strokeWidth={1.5} />
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
                    <h3 className="text-sm font-light mb-1 flex items-center gap-2 tracking-wide">
                      <Ruler className="w-4 h-4" strokeWidth={1.5} />
                      Confirm Size & Finish
                    </h3>
                    <p className="text-[10px] font-light text-gray-500">Select finish and adjust scale for your model</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] rounded border border-white/10 space-y-3">
                    <div>
                      <div className="font-light text-xs mb-1 uppercase tracking-wide text-gray-500">Selected Material</div>
                      <div className="text-sm font-light text-white">{selectedMaterial?.materialName}</div>
                      <div className="text-[10px] font-light text-gray-600">{selectedMaterial?.technology}</div>
                    </div>
                    
                    <div>
                      <div className="font-light text-xs mb-2 uppercase tracking-wide text-gray-500">Finish</div>
                      <div className="space-y-2">
                        {selectedMaterial?.finishes.map((finish) => (
                          <button
                            key={finish.finishID}
                            onClick={() => setSelectedFinish(finish)}
                            className={`w-full text-left p-2 rounded border text-xs transition-all ${
                              selectedFinish?.finishID === finish.finishID
                                ? 'border-white/30 bg-white/5'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-light">{finish.finishName}</div>
                                {finish.description && (
                                  <div className="text-[10px] text-gray-600 mt-0.5">{finish.description}</div>
                                )}
                                {finish.price_per_cm3 && (
                                  <div className="text-[10px] text-gray-500 mt-1">${finish.price_per_cm3}/cm³</div>
                                )}
                              </div>
                              {selectedFinish?.finishID === finish.finishID && (
                                <Check className="w-3 h-3 text-white flex-shrink-0" strokeWidth={1.5} />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-light mb-2 uppercase tracking-wide text-gray-500">Unit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['mm', 'cm', 'in'] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => setUnit(u)}
                          className={`py-2 px-4 rounded border text-sm font-light transition-all ${
                            unit === u
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-light mb-2 uppercase tracking-wide text-gray-500">
                      Scale: {scale.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-light text-gray-600 mt-1">
                      <span>0.1x</span>
                      <span>5x</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-light text-gray-400 p-3 bg-white/5 border border-white/10 rounded">
                    The final size will be determined based on your model's geometry
                  </div>
                </div>
              )}

              {/* Step 3: Invoice (Pricing) */}
              {step === 'invoice' && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-white/40" strokeWidth={1.5} />
                      <p className="text-sm font-light text-gray-500">Getting pricing...</p>
                    </div>
                  ) : quoteData ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-light mb-1 flex items-center gap-2 tracking-wide">
                          <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                          Invoice & Pricing
                        </h3>
                        <p className="text-[10px] font-light text-gray-500">Review pricing estimate for your print</p>
                      </div>

                      {/* Order Summary */}
                      <div className="p-4 bg-white/[0.02] rounded border border-white/10 space-y-3">
                        <div>
                          <div className="text-[10px] font-light uppercase tracking-wide text-gray-500">Material</div>
                          <div className="text-sm font-light text-white">{selectedMaterial?.materialName || '--'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-light uppercase tracking-wide text-gray-500">Finish</div>
                          <div className="text-sm font-light text-white">{selectedFinish?.finishName || '--'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-light uppercase tracking-wide text-gray-500">Quantity</div>
                          <div className="text-sm font-light text-white">{quoteData.quantity || 1}</div>
                        </div>
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-light uppercase tracking-wide text-gray-400">Total Price</div>
                            <div className="text-xl font-light text-white">
                              {quoteData.total_price != null ? `$${quoteData.total_price.toFixed(2)} ${quoteData.currency}` : '--'}
                            </div>
                          </div>
                          {quoteData.unit_price != null && (
                            <div className="text-[10px] font-light text-gray-500 mt-1">
                              ${quoteData.unit_price.toFixed(2)} per item
                            </div>
                          )}
                        </div>
                        {quoteData.valid_until && (
                          <div className="text-[10px] font-light text-gray-600">
                            Valid until: {new Date(quoteData.valid_until).toLocaleDateString()}
                          </div>
                        )}
                        {quoteData.error && (
                          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs font-light text-red-300">
                            ⚠️ Unable to fetch pricing. Please try again or contact support.
                          </div>
                        )}
                      </div>

                      {/* Info note */}
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs font-light text-blue-200">
                        Payment and shipping details will be collected securely in the next step
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-light text-gray-500 hover:text-white transition-colors uppercase tracking-wide"
          >
            Maybe Later
          </button>

          <div className="flex gap-2">
            {step !== 'materials' && (
              <button
                onClick={() => {
                  if (step === 'invoice') setStep('size')
                  else if (step === 'size') setStep('materials')
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors uppercase tracking-wide"
              >
                Back
              </button>
            )}
            
            {step === 'materials' && (
              <button
                onClick={handleContinueToSize}
                disabled={!selectedMaterial || !selectedFinish}
                className="px-6 py-2 bg-white text-black rounded text-xs font-light hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                Continue
              </button>
            )}
            
            {step === 'size' && (
              <button
                onClick={handleContinueToInvoice}
                disabled={loading}
                className="px-6 py-2 bg-white text-black rounded text-xs font-light hover:bg-gray-200 transition-all disabled:opacity-30 uppercase tracking-wide"
              >
                {loading ? 'Loading...' : 'Get Invoice'}
              </button>
            )}
            
            {step === 'invoice' && quoteData && !loading && (
              <button
                onClick={handleContinueToPayment}
                className="px-6 py-2 bg-gradient-to-br from-red-500/70 via-red-600/60 to-red-500/70 border border-red-500/40 text-white rounded text-xs font-light hover:from-red-500/90 hover:via-red-600/80 hover:to-red-500/90 transition-all flex items-center gap-2 uppercase tracking-wide"
              >
                <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                Continue to Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
