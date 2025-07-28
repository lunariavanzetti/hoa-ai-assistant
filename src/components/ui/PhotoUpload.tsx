import React, { useState, useRef } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoUploadProps {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
  className?: string
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    )
    
    addFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const remainingSlots = maxPhotos - photos.length
    const filesToAdd = newFiles.slice(0, remainingSlots)
    onPhotosChange([...photos, ...filesToAdd])
  }

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(updatedPhotos)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600'
          }
          ${photos.length >= maxPhotos ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-indigo-400'}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {photos.length >= maxPhotos 
              ? `Maximum ${maxPhotos} photos reached`
              : 'Drop photos here or click to upload'
            }
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, WEBP up to 10MB each
          </p>
        </div>
      </div>

      {/* Photo Previews */}
      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Uploaded Photos ({photos.length}/{maxPhotos})
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Violation photo ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removePhoto(index)
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}