'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, File, X, Check, AlertCircle, Loader2 } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  url: string
  status: 'uploading' | 'completed' | 'failed'
  progress: number
}

interface STLUploaderProps {
  onFileUploaded?: (fileUrl: string, fileName: string) => void
}

export default function STLUploader({ onFileUploaded }: STLUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString()
    
    // Add to list with uploading status
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      url: '',
      status: 'uploading',
      progress: 0,
    }
    
    setFiles(prev => [...prev, uploadedFile])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'completed', url: data.fileUrl, progress: 100 }
          : f
      ))

      // Callback with file URL
      if (onFileUploaded) {
        onFileUploaded(data.fileUrl, file.name)
      }

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'failed', progress: 0 }
          : f
      ))
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      return ['stl', 'obj', 'glb'].includes(ext || '')
    })

    validFiles.forEach(file => uploadFile(file))
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    Array.from(selectedFiles).forEach(file => uploadFile(file))
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <input
          type="file"
          accept=".stl,.obj,.glb"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
          isDragging ? 'text-purple-400' : 'text-gray-500'
        }`} />
        
        <p className="text-sm font-light text-gray-300 mb-2">
          Drag & drop your 3D model files here
        </p>
        <p className="text-xs text-gray-500">
          or click to browse (STL, OBJ, GLB - Max 50MB)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-light text-gray-400 uppercase tracking-wider">
            Uploaded Files ({files.length})
          </h4>
          
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/10"
            >
              {/* Icon */}
              <div className={`flex-shrink-0 ${
                file.status === 'completed' ? 'text-green-400' :
                file.status === 'failed' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {file.status === 'uploading' && (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
                {file.status === 'completed' && (
                  <Check className="w-5 h-5" />
                )}
                {file.status === 'failed' && (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-light truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                
                {/* Progress bar */}
                {file.status === 'uploading' && (
                  <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                      className="h-full bg-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              {file.status === 'completed' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                  >
                    View
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
              
              {file.status === 'failed' && (
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
