import React, { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * Upload Zone Component Props
 */
interface UploadZoneProps {
  /** Callback function called when upload is successful */
  onUploadSuccess: () => void
}

/**
 * Upload Zone Component
 * 
 * Provides a drag-and-drop file upload interface for PDF compliance documents.
 * Handles file validation, upload progress, and user feedback.
 * 
 * @fileoverview File upload component with drag-and-drop functionality
 * @author RetailReady Team
 * @version 1.0.0
 * 
 * @param props - Component props
 * @param props.onUploadSuccess - Callback function called when upload succeeds
 * @returns JSX element containing the upload interface
 * 
 * @example
 * <UploadZone onUploadSuccess={() => console.log('Upload successful!')} />
 */
export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processingStage, setProcessingStage] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle drag over event for drag-and-drop functionality
   * 
   * @param e - Drag event object
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  /**
   * Handle drag leave event for drag-and-drop functionality
   * 
   * @param e - Drag event object
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  /**
   * Handle file drop event for drag-and-drop functionality
   * 
   * @param e - Drag event object
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  /**
   * Handle file selection from file input
   * 
   * @param e - Change event from file input
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  /**
   * Handle file upload process including validation and API call
   * 
   * @param file - File object to upload
   */
  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Please upload a PDF file only' })
      return
    }

    setUploading(true)
    setMessage(null)
    setProcessingStage('Uploading file...')

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      // Simulate processing stages with timeouts
      const stages = [
        { delay: 500, stage: 'Uploading file...' },
        { delay: 1000, stage: 'Extracting text from PDF...' },
        { delay: 1500, stage: 'Analyzing compliance requirements...' },
        { delay: 2000, stage: 'Parsing with AI...' },
        { delay: 1000, stage: 'Finalizing results...' }
      ]

      let currentStage = 0
      const updateStage = () => {
        if (currentStage < stages.length) {
          setProcessingStage(stages[currentStage].stage)
          currentStage++
          if (currentStage < stages.length) {
            setTimeout(updateStage, stages[currentStage].delay)
          }
        }
      }
      updateStage()

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setProcessingStage('Complete!')
        setMessage({ 
          type: 'success', 
          text: `Successfully parsed ${data.requirements?.length || 0} requirements from ${file.name}` 
        })
        onUploadSuccess()
      } else {
        setProcessingStage('Error occurred')
        setMessage({ type: 'error', text: data.error || 'Upload failed' })
      }
    } catch (error) {
      setProcessingStage('Error occurred')
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setUploading(false)
      setTimeout(() => setProcessingStage(''), 2000) // Clear stage after 2 seconds
    }
  }

  /**
   * Open the file selection dialog programmatically
   */
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Processing PDF...' : 'Upload Compliance Guide'}
            </p>
            <p className="text-sm text-gray-500">
              {uploading ? processingStage : 'Drag and drop a PDF file here, or click to browse'}
            </p>
            {uploading && (
              <p className="text-xs text-blue-600 font-medium">
                This may take 30-60 seconds for complex documents
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <FileText className="w-4 h-4" />
            <span>PDF files only</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`flex items-center space-x-2 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <span className="text-sm font-medium block">{message.text}</span>
            {message.type === 'success' && (
              <span className="text-xs text-green-600 mt-1 block">
                ✅ Compliance data loaded • Risk calculator ready • Routing guide analysis available
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

