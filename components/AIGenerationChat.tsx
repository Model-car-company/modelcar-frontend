'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, Send, Loader2, Download, AlertCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  modelUrl?: string
  status?: 'generating' | 'completed' | 'failed'
}

export default function AIGenerationChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! Describe the car model you want to generate. Be specific about details like make, model, year, color, and style.',
    }
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const pollStatus = async (taskId: string, messageId: string) => {
    const maxAttempts = 60 // 60 seconds max
    let attempts = 0

    const interval = setInterval(async () => {
      attempts++
      
      try {
        const response = await fetch(`/api/generate?taskId=${taskId}`)
        const data = await response.json()

        if (data.status === 'completed') {
          clearInterval(interval)
          setIsGenerating(false)
          
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  status: 'completed',
                  modelUrl: data.modelUrl,
                  content: '✅ Model generated successfully! Click to download or view in 3D.',
                }
              : msg
          ))
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setIsGenerating(false)
          
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  status: 'failed',
                  content: `❌ Generation failed: ${data.error}`,
                }
              : msg
          ))
        } else {
          // Update progress
          const progress = data.progress || 0
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  content: `🔄 Generating... ${progress}%`,
                }
              : msg
          ))
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval)
          setIsGenerating(false)
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  status: 'failed',
                  content: '❌ Generation timeout. Please try again.',
                }
              : msg
          ))
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 1000) // Poll every second
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '🔄 Starting generation...',
      status: 'generating',
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setInput('')
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input.trim(),
          quality: 'standard' 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentTaskId(data.taskId)
        // Start polling for status
        pollStatus(data.taskId, loadingMessage.id)
      } else {
        setIsGenerating(false)
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { 
                ...msg, 
                status: 'failed',
                content: `❌ ${data.error || 'Failed to start generation'}`,
              }
            : msg
        ))
      }
    } catch (error) {
      setIsGenerating(false)
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { 
              ...msg, 
              status: 'failed',
              content: '❌ Network error. Please try again.',
            }
          : msg
      ))
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-light">AI Model Generator</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-purple-500/20 text-purple-100'
                    : 'bg-white/5 text-gray-300'
                }`}
              >
                <p className="text-sm font-light whitespace-pre-wrap">{message.content}</p>
                
                {/* Download button for completed models */}
                {message.status === 'completed' && message.modelUrl && (
                  <div className="mt-3 flex gap-2">
                    <a
                      href={message.modelUrl}
                      download
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download STL
                    </a>
                    <button className="px-3 py-1.5 bg-white/10 rounded text-xs hover:bg-white/20 transition-colors">
                      View in Studio
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your car model..."
            disabled={isGenerating}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded text-sm font-light focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <p className="font-light">
            Each generation costs 10 credits. Be specific about car make, model, year, and style for best results.
          </p>
        </div>
      </form>
    </div>
  )
}
