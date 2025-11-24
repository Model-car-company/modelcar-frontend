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
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([])  

  const handleGenerate = async () => {
    if (!prompt) return
    
    setIsGenerating(true)
    setProgress(0)
    
    try {
      // Add to chat history
      setChatHistory(prev => [...prev, { role: 'user', content: prompt }])
      
      // Update progress incrementally
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      if (mode === 'text') {
        // Text to Image via Gemini Nano Banana
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt,
            previousImage: generatedImage,
            chatHistory 
          }),
        })

        clearInterval(progressInterval)
        
        if (!response.ok) {
          throw new Error('Image generation failed')
        }

        const data = await response.json()
        setProgress(100)
        
        // Display generated image
        if (data.imageUrl) {
          setGeneratedImage(data.imageUrl)
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: generatedImage ? 'Image updated!' : 'Image generated! Click "Convert to 3D" or refine it further.' 
          }])
        }
        
        setTimeout(() => {
          setIsGenerating(false)
          setProgress(0)
          setPrompt('')
        }, 1000)
        
      } else {
        // Image to 3D (existing flow)
        const formData = new FormData()
        formData.append('prompt', prompt)
        formData.append('quality', 'high')

        const response = await fetch('/api/generate-3d', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)
        
        if (!response.ok) {
          throw new Error('3D generation failed')
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
      }

    } catch (error) {
      setIsGenerating(false)
      setProgress(0)
      alert(`Failed to generate. Please try again. ${error}`)
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
      formData.append('quality', 'high')

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
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
        <button 
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs transition-colors ${
            mode === 'text' 
              ? 'bg-white text-black' 
              : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          <Wand2 className="w-3 h-3" />
          Text to Image
        </button>
        <button 
          onClick={() => setMode('image')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs transition-colors ${
            mode === 'image' 
              ? 'bg-white text-black' 
              : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          <Image className="w-3 h-3" />
          Image to 3D
        </button>
      </div>

      {/* Text to Image Mode */}
      {mode === 'text' && (
        <>
          {/* Generated Image Display */}
          {generatedImage && (
            <div className="relative">
              <img src={generatedImage} alt="Generated" className="w-full rounded-lg border border-white/10" />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => setMode('image')}
                  className="px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 font-medium"
                >
                  Convert to 3D →
                </button>
                <button
                  onClick={() => {
                    setGeneratedImage('')
                    setChatHistory([])
                    setPrompt('')
                  }}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-white/5 rounded">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`text-xs ${msg.role === 'user' ? 'text-gray-300' : 'text-blue-400'}`}>
                  <span className="font-medium">{msg.role === 'user' ? 'You' : 'Gemini'}:</span> {msg.content}
                </div>
              ))}
            </div>
          )}

          {/* Text Prompt */}
          <div>
            <label className="text-xs font-light text-gray-400 mb-2 block">
              {generatedImage ? 'Refine your car ("make it red", "add spoiler")' : 'Describe your dream car'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={generatedImage 
                ? "Make the wheels bigger, change color to matte black, add carbon fiber hood..."
                : "A futuristic cyberpunk sports car with neon underglow, aggressive stance,"}
              className="w-full h-20 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm font-light resize-none focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Quick Prompts */}
          {!generatedImage && (
            <div>
              <label className="text-xs font-light text-gray-400 mb-2 block">
                Quick Prompts
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Cyberpunk muscle car',
                  'Matte black supercar',
                  'Vintage racing car',
                  'Electric concept'
                ].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setPrompt(quick)}
                    className="px-2 py-1.5 bg-white/5 border border-white/10 text-[10px] font-light text-white hover:bg-white/10 transition-colors text-center"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Image Mode Content */}
      {mode === 'image' && (
        <>

          {/* Show Generated Image if exists */}
          {generatedImage && (
            <div className="p-3 bg-white/5 border border-white/10 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">Using your generated image</span>
              </div>
              <img src={generatedImage} alt="Generated" className="w-full rounded border border-white/10 mb-2" />
              <button
                onClick={async () => {
                  // Convert generated image to 3D
                  setIsGenerating(true)
                  // Trigger conversion with the generated image
                  // You would send generatedImage to Meshy.ai here
                }}
                className="w-full px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                Convert This to 3D Model
              </button>
            </div>
          )}

          <div>
            <label className="text-xs font-light text-gray-400 mb-3 block">
              Or upload a different car image
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
        </>
      )}


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
            {mode === 'text' ? `Generating Image... ${progress}%` : `Converting... ${progress}%`}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {mode === 'text' 
              ? (generatedImage ? 'Refine Image' : 'Generate Image')
              : 'Upload & Generate'}
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

    </motion.div>
  )
}
