'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2, Download, AlertCircle, Check, Box } from 'lucide-react'
import { Model3DConverter } from '../lib/3d-converter'
import dynamic from 'next/dynamic'

// Dynamically import 3D viewer to avoid SSR issues
const Model3DViewer = dynamic(() => import('./Model3DViewer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-black/50 rounded-sm">
      <Loader2 className="w-8 h-8 animate-spin opacity-40" />
    </div>
  )
})

interface ConversionStatus {
  stage: 'idle' | 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
  message?: string;
  result?: {
    stlUrl: string;
    objUrl: string;
    glbUrl: string;
    dimensions?: { x: number; y: number; z: number };
  };
}

export default function Model3DUploader() {
  const [status, setStatus] = useState<ConversionStatus>({ stage: 'idle' });
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setStatus({ 
        stage: 'error', 
        message: 'Please upload an image file' 
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start conversion process
    setStatus({ stage: 'uploading', progress: 0 });

    try {
      // Initialize converter (in production, use environment variable for API key)
      const converter = new Model3DConverter(process.env.NEXT_PUBLIC_MESHY_API_KEY || '');
      
      setStatus({ stage: 'processing', progress: 30 });

      // Simulate API call (replace with actual implementation)
      const mockConversion = async () => {
        // Simulating progress updates
        for (let i = 40; i <= 90; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setStatus({ stage: 'processing', progress: i });
        }

        // Mock result - in production, this would be actual API response
        return {
          stlUrl: '/api/models/generated-model.stl',
          objUrl: '/api/models/generated-model.obj',
          glbUrl: '/api/models/generated-model.glb',
          dimensions: { x: 100, y: 50, z: 40 }
        };
      };

      const result = await mockConversion();
      
      setStatus({ 
        stage: 'ready', 
        progress: 100,
        result 
      });

    } catch (error) {
      setStatus({ 
        stage: 'error', 
        message: 'Failed to convert image to 3D model' 
      });
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setStatus({ stage: 'idle' });
    setSelectedImage(null);
  };

  return (
    <section className="py-32 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-8">
        <div className="mb-16 text-center">
          <h3 className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
            3D Generation
          </h3>
          <h2 className="text-5xl md:text-7xl font-thin tracking-tight mb-4">
            Image to Print
          </h2>
          <p className="text-sm font-extralight text-gray-400 max-w-xl mx-auto">
            Transform any model car image into a 3D printable file. Upload your image and download STL files ready for 3D printing.
          </p>
        </div>

        <div className="space-y-8">
          {/* Upload Area */}
          <AnimatePresence mode="wait">
            {status.stage === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-sm p-16 text-center transition-all
                  ${dragActive 
                    ? 'border-white/30 bg-white/5' 
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                  }
                `}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-light mb-2">Drop your image here</p>
                <p className="text-xs font-extralight text-gray-500">
                  or click to browse • JPG, PNG, WEBP up to 10MB
                </p>
              </motion.div>
            )}

            {/* Processing State */}
            {(status.stage === 'uploading' || status.stage === 'processing') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="relative w-32 h-32 mx-auto mb-8">
                  {selectedImage && (
                    <img 
                      src={selectedImage} 
                      alt="Processing" 
                      className="w-full h-full object-cover rounded-sm opacity-40"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                </div>
                
                <p className="text-sm font-light mb-2">
                  {status.stage === 'uploading' ? 'Uploading image...' : 'Generating 3D model...'}
                </p>
                <p className="text-[10px] font-extralight text-gray-500 mb-6">
                  This may take 30-60 seconds
                </p>

                {/* Progress Bar */}
                <div className="max-w-xs mx-auto">
                  <div className="h-[1px] bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white/40"
                      initial={{ width: '0%' }}
                      animate={{ width: `${status.progress || 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] font-extralight text-gray-500 mt-2">
                    {status.progress}% complete
                  </p>
                </div>
              </motion.div>
            )}

            {/* Success State */}
            {status.stage === 'ready' && status.result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {/* 3D Preview */}
                  <div className="aspect-square bg-gradient-to-br from-gray-900/10 to-black rounded-sm overflow-hidden">
                    <Model3DViewer modelUrl={status.result.glbUrl} type="glb" />
                    {status.result.dimensions && (
                      <div className="absolute bottom-4 right-4 text-[10px] font-extralight text-gray-400">
                        {status.result.dimensions.x} × {status.result.dimensions.y} × {status.result.dimensions.z} mm
                      </div>
                    )}
                  </div>

                  {/* Download Options */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-light mb-4">Download Files</h4>
                    
                    <button
                      onClick={() => downloadFile(status.result!.stlUrl, 'model.stl')}
                      className="w-full p-4 border border-white/10 hover:bg-white/5 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-light">STL File</p>
                          <p className="text-[10px] font-extralight text-gray-500">
                            Ready for 3D printing
                          </p>
                        </div>
                        <Download className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                      </div>
                    </button>

                    <button
                      onClick={() => downloadFile(status.result!.objUrl, 'model.obj')}
                      className="w-full p-4 border border-white/10 hover:bg-white/5 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-light">OBJ File</p>
                          <p className="text-[10px] font-extralight text-gray-500">
                            With texture support
                          </p>
                        </div>
                        <Download className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                      </div>
                    </button>

                    <button
                      onClick={() => downloadFile(status.result!.glbUrl, 'model.glb')}
                      className="w-full p-4 border border-white/10 hover:bg-white/5 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-light">GLB File</p>
                          <p className="text-[10px] font-extralight text-gray-500">
                            For AR/VR viewing
                          </p>
                        </div>
                        <Download className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                      </div>
                    </button>

                    <div className="pt-4 border-t border-white/5">
                      <h5 className="text-xs font-light mb-3">3D Printing Tips</h5>
                      <ul className="space-y-1 text-[10px] font-extralight text-gray-400">
                        <li>• Layer height: 0.2mm recommended</li>
                        <li>• Infill: 20-30% for display models</li>
                        <li>• Support: Tree supports for overhangs</li>
                        <li>• Material: PLA or PETG recommended</li>
                      </ul>
                    </div>

                    <button
                      onClick={reset}
                      className="btn-minimal w-full mt-6"
                    >
                      Convert Another Image
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {status.stage === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500/50" />
                <p className="text-sm font-light mb-2">Conversion Failed</p>
                <p className="text-[10px] font-extralight text-gray-500 mb-6">
                  {status.message || 'Something went wrong. Please try again.'}
                </p>
                <button onClick={reset} className="btn-minimal">
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Section */}
        <div className="mt-16 pt-16 border-t border-white/5">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-thin mb-2">AI</div>
              <p className="text-[10px] font-extralight text-gray-400">
                Advanced neural networks
              </p>
            </div>
            <div>
              <div className="text-3xl font-thin mb-2">1-2min</div>
              <p className="text-[10px] font-extralight text-gray-400">
                Average processing time
              </p>
            </div>
            <div>
              <div className="text-3xl font-thin mb-2">STL</div>
              <p className="text-[10px] font-extralight text-gray-400">
                Print-ready formats
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
