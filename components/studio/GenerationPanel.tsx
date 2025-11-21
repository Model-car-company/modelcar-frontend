'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Box, Upload, Image, Sparkles } from 'lucide-react'

interface GenerationPanelProps {
  onGenerate: (modelUrl: string) => void;
}

export default function GenerationPanel({ onGenerate }: GenerationPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [model, setModel] = useState('standard')
  const [style, setStyle] = useState('realistic')
  const [resolution, setResolution] = useState('high')
  const [mode, setMode] = useState<'text' | 'image'>('text')

  const handleGenerate = async () => {
    if (!prompt) return
    
    setIsGenerating(true)
    setProgress(0)
    
    try {
      // Update progress incrementally
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 300)

      // Call the real API
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('quality', resolution)

      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      
      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      setProgress(100)
      
      // Pass the generated model URL to parent
      if (data.modelUrl) {
        onGenerate(data.modelUrl)
      }
      
      setTimeout(() => {
        setIsGenerating(false)
        setProgress(0)
      }, 1000)

    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      setProgress(0)
      alert('Failed to generate 3D model. Please try again.')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsGenerating(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 300)

      const formData = new FormData()
      formData.append('image', file)
      formData.append('quality', resolution)

      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setProgress(100)

      if (data.modelUrl) {
        onGenerate(data.modelUrl)
      }

      setTimeout(() => {
        setIsGenerating(false)
        setProgress(0)
      }, 1000)

    } catch (error) {
      console.error('Upload error:', error)
      setIsGenerating(false)
      setProgress(0)
      alert('Failed to process image. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Generation Mode Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
        <button 
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs transition-colors ${
            mode === 'text' 
              ? 'bg-red-500/20 text-red-400' 
              : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          <Wand2 className="w-3 h-3" />
          Text to 3D
        </button>
        <button 
          onClick={() => setMode('image')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs transition-colors ${
            mode === 'image' 
              ? 'bg-red-500/20 text-red-400' 
              : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          <Image className="w-3 h-3" />
          Image to 3D
        </button>
      </div>

      {/* Text Mode Content */}
      {mode === 'text' && (
        <>
          {/* Text Prompt */}
          <div>
            <label className="text-xs font-light text-gray-400 mb-2 block">
              Describe your car model
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic sports car with aerodynamic design, carbon fiber body, and glowing LED accents..."
              className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm font-light resize-none focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Quick Prompts */}
          <div>
            <label className="text-xs font-light text-gray-400 mb-2 block">
              Quick Prompts
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Cyberpunk Car',
                'Classic Muscle',
                'F1 Racing',
                'Luxury SUV'
              ].map(quick => (
                <button
                  key={quick}
                  onClick={() => setPrompt(quick)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded text-xs hover:bg-white/10"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Image Mode Content */}
      {mode === 'image' && (
        <div>
          <label className="text-xs font-light text-gray-400 mb-3 block">
            Upload car image
          </label>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center cursor-pointer hover:border-white/30 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-sm text-gray-300 mb-1">Click or drag image here</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          </label>
        </div>
      )}

      {/* Model Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-light text-gray-400 mb-2 block">
            AI Model
          </label>
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light focus:outline-none"
          >
            <option value="fast">Fast (30s)</option>
            <option value="standard">Standard (1m)</option>
            <option value="ultra">Ultra (3m)</option>
          </select>
        </div>
        
        <div>
          <label className="text-xs font-light text-gray-400 mb-2 block">
            Style
          </label>
          <select 
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light focus:outline-none"
          >
            <option value="realistic">Realistic</option>
            <option value="stylized">Stylized</option>
            <option value="lowpoly">Low Poly</option>
          </select>
        </div>
      </div>

      {/* Resolution */}
      <div>
        <label className="text-xs font-light text-gray-400 mb-2 block">
          Mesh Resolution
        </label>
        <div className="flex gap-2">
          {['draft', 'standard', 'high', 'ultra'].map(res => (
            <button
              key={res}
              onClick={() => setResolution(res)}
              className={`flex-1 py-2 text-xs font-light rounded ${
                resolution === res
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={(mode === 'text' && !prompt) || isGenerating}
        className={`w-full py-3 rounded font-light text-sm flex items-center justify-center gap-2 ${
          isGenerating || (mode === 'text' && !prompt)
            ? 'bg-white/10 text-gray-400 cursor-not-allowed'
            : 'bg-white text-black hover:bg-gray-100'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Generating... {progress}%
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {mode === 'text' ? 'Generate 3D Model' : 'Upload & Generate'}
          </>
        )}
      </button>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-white"
          />
        </div>
      )}

      {/* Recent Generations */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-light text-gray-400 mb-3">Recent</h3>
        <div className="space-y-2">
          {[
            { name: 'Cybertruck', time: '2m' },
            { name: 'McLaren P1', time: '15m' },
            { name: 'Vintage GT', time: '1h' }
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-gray-500" />
                <span className="text-xs">{item.name}</span>
              </div>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
