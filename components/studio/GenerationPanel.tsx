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

  const handleGenerate = async () => {
    if (!prompt) return
    
    setIsGenerating(true)
    setProgress(0)
    
    // Simulate generation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          // Use an actual model from your collection
          onGenerate('/models/gta-progen-t20.stl')
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Handle image upload
      console.log('Uploading:', file.name)
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
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded text-xs">
          <Wand2 className="w-3 h-3" />
          Text to 3D
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-white/5 text-gray-400 rounded text-xs">
          <Image className="w-3 h-3" />
          Image to 3D
        </button>
      </div>

      {/* Text Prompt */}
      <div>
        <label className="text-xs font-light text-gray-400 mb-2 block">
          Describe your car model
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic sports car with aerodynamic design, carbon fiber body, and glowing LED accents..."
          className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm font-light resize-none focus:outline-none focus:border-purple-500/50"
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
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
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
        disabled={!prompt || isGenerating}
        className={`w-full py-3 rounded font-light text-sm flex items-center justify-center gap-2 ${
          isGenerating
            ? 'bg-purple-500/10 text-purple-400 cursor-not-allowed'
            : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating... {progress}%
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate 3D Model
          </>
        )}
      </button>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      )}

      {/* Upload Section */}
      <div className="pt-4 border-t border-white/10">
        <label className="text-xs font-light text-gray-400 mb-3 block">
          Or upload an image
        </label>
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <p className="text-xs text-gray-400">Click or drag image here</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
          </div>
        </label>
      </div>

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
