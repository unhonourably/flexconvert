'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowUpTrayIcon,
  DocumentIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FunnelIcon,
  PencilIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { getUserUploads, deleteUpload, createUpload, getUserConversions, createConversion, updateConversion, updateUpload } from '@/lib/supabase/database'
import { FILE_FORMATS, searchFormats, getFormatByExt } from '@/lib/file-formats'
import { getUploadSettings } from '@/lib/settings'
import { validateConversion, getSupportedTargetFormats } from '@/lib/conversion-validation'
import type { Upload, Conversion } from '@/types/database'

type UploadWithConversions = Upload & {
  conversions?: Conversion[]
}

export default function UploadsPage() {
  const [mounted, setMounted] = useState(false)
  const [uploads, setUploads] = useState<UploadWithConversions[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFormatModal, setShowFormatModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedUpload, setSelectedUpload] = useState<UploadWithConversions | null>(null)
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({})
  const [formatSearch, setFormatSearch] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all')
  const [conversionStatusFilter, setConversionStatusFilter] = useState<string>('all')
  const [editingUploadId, setEditingUploadId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedUploadForHistory, setSelectedUploadForHistory] = useState<UploadWithConversions | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = useAuth()
  const formatDropdownRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  
  const ITEMS_PER_PAGE = 9

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, fileTypeFilter, conversionStatusFilter])

  useEffect(() => {
    const loadPreviews = async () => {
      if (!user) return
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const urls: { [key: string]: string } = {}
      
      for (const upload of uploads) {
        let previewPath: string | null = null
        
        if (upload.conversions && upload.conversions.length > 0) {
          const completed = upload.conversions.find(c => c.status === 'completed' && c.output_path)
          if (completed?.output_path) {
            previewPath = completed.output_path
          }
        }
        
        if (!previewPath) {
          const fileExt = upload.original_filename.split('.').pop()?.toLowerCase() || ''
          const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
          if (imageExts.includes(fileExt)) {
            previewPath = upload.storage_path
          }
        }
        
        if (previewPath) {
          try {
            const { data, error } = await supabase.storage
              .from('uploads')
              .createSignedUrl(previewPath, 3600)
            if (data?.signedUrl && !error) {
              urls[upload.id] = data.signedUrl
            }
          } catch (error) {
            console.error('Error loading preview:', error)
          }
        }
      }
      
      setPreviewUrls(urls)
    }
    
    if (uploads.length > 0) {
      loadPreviews()
    }
  }, [uploads, user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target as Node)) {
        setFormatSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const uploadsData = await getUserUploads(user.id)
      const conversionsData = await getUserConversions(user.id)
      
      const uploadsWithConversions = uploadsData.map(upload => ({
        ...upload,
        conversions: conversionsData.filter(conv => conv.upload_id === upload.id)
      }))
      
      setUploads(uploadsWithConversions)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    
    setSelectedFile(file)
    setShowUploadModal(false)
    setShowFormatModal(true)
    setFormatSearch('')
    setSelectedFormat(null)
  }

  const handleUploadAndConvert = async () => {
    if (!user || !selectedFormat) return
    if (!selectedFile && !selectedUpload) return

    setUploading(true)
    setConverting(true)
    try {
      let upload: Upload

      if (selectedFile) {
        const fileSize = selectedFile.size
        const fileType = selectedFile.type || 'application/octet-stream'
        const fileName = selectedFile.name
        const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
        
        const supabase = (await import('@/lib/supabase/client')).createClient()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        upload = await createUpload({
          user_id: user.id,
          original_filename: fileName,
          file_size: fileSize,
          file_type: fileType,
          storage_path: filePath,
        })
      } else if (selectedUpload) {
        upload = selectedUpload
      } else {
        throw new Error('No file or upload selected')
      }

      const originalFormat = upload.original_filename.split('.').pop()?.toLowerCase() || ''

      // Validate conversion before creating
      const validation = validateConversion(originalFormat, selectedFormat)
      if (!validation.isValid) {
        alert(validation.error || 'Invalid conversion')
        setUploading(false)
        setConverting(false)
        return
      }

      const conversion = await createConversion({
        upload_id: upload.id,
        user_id: user.id,
        original_format: originalFormat,
        target_format: selectedFormat,
        status: 'processing',
        output_path: null,
        output_size: null,
        error_message: null,
      })

      try {
        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversionId: conversion.id,
            uploadId: upload.id,
            targetFormat: selectedFormat,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Conversion failed')
        }

        const pollConversion = async () => {
          const maxAttempts = 30
          let attempts = 0
          
          const checkStatus = async () => {
            try {
              const { getUserConversions, getUserUploads } = await import('@/lib/supabase/database')
              const conversions = await getUserConversions(user.id)
              const currentConversion = conversions.find(c => c.id === conversion.id)
              
              if (currentConversion) {
                if (currentConversion.status === 'completed') {
                  await loadData()
                  // Auto-download if enabled
                  const settings = getUploadSettings()
                  if (settings.downloadOnCompletion && currentConversion.output_path) {
                    // Reload uploads to get the latest data
                    const latestUploads = await getUserUploads(user.id)
                    const upload = latestUploads.find(u => u.id === currentConversion.upload_id)
                    if (upload) {
                      setTimeout(() => {
                        handleDownload(currentConversion, upload)
                      }, 500)
                    }
                  }
                  // Show notification if enabled
                  if (settings.notificationOnCompletion && 'Notification' in window && Notification.permission === 'granted') {
                    const latestUploads = await getUserUploads(user.id)
                    const upload = latestUploads.find(u => u.id === currentConversion.upload_id)
                    if (upload) {
                      new Notification('Conversion Complete', {
                        body: `${upload.original_filename} has been converted to ${currentConversion.target_format.toUpperCase()}`,
                        icon: '/favicon.ico'
                      })
                    }
                  }
                  return
                } else if (currentConversion.status === 'failed') {
                  await loadData()
                  return
                }
              }
              
              attempts++
              if (attempts < maxAttempts) {
                setTimeout(checkStatus, 1000)
              } else {
                await loadData()
              }
            } catch (error) {
              console.error('Error polling conversion:', error)
            }
          }
          
          setTimeout(checkStatus, 1000)
        }
        
        pollConversion()
        await loadData()
      } catch (error: any) {
        console.error('Error converting file:', error)
        await updateConversion(conversion.id, {
          status: 'failed',
          error_message: error.message || 'Conversion failed'
        })
        await loadData()
        alert('Conversion failed: ' + (error.message || 'Unknown error'))
      }

      if (selectedFile) {
        await loadData()
      }
      setShowFormatModal(false)
      setSelectedFile(null)
      setSelectedUpload(null)
      setSelectedFormat(null)
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Failed to process file. Please try again.')
    } finally {
      setUploading(false)
      setConverting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this file?')) return
    
    try {
      await deleteUpload(id, user.id)
      await loadData()
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file.')
    }
  }

  const getFileExtensionWithDot = (filename: string) => {
    const parts = filename.split('.')
    return parts.length > 1 ? '.' + parts.pop() : ''
  }

  const getFileNameWithoutExtension = (filename: string) => {
    const lastDot = filename.lastIndexOf('.')
    return lastDot > 0 ? filename.substring(0, lastDot) : filename
  }

  const handleStartRename = (upload: UploadWithConversions) => {
    if (editingUploadId && editingUploadId !== upload.id) {
      handleCancelRename()
    }
    setEditingUploadId(upload.id)
    const nameWithoutExt = getFileNameWithoutExtension(upload.original_filename)
    setEditingName(nameWithoutExt)
    setTimeout(() => {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }, 0)
  }

  const handleSaveRename = async (uploadId: string, originalFilename: string) => {
    if (!user || !editingName.trim()) {
      setEditingUploadId(null)
      return
    }

    try {
      const extension = getFileExtensionWithDot(originalFilename)
      const newFilename = editingName.trim() + extension
      
      await updateUpload(uploadId, user.id, { 
        original_filename: newFilename,
        updated_at: new Date().toISOString()
      })
      await loadData()
      setEditingUploadId(null)
      setEditingName('')
    } catch (error: any) {
      console.error('Error renaming file:', error)
      const errorMessage = error?.message || error?.error_description || 'Failed to rename file. Please check if you have permission to update this file.'
      alert(`Failed to rename file: ${errorMessage}`)
    }
  }

  const handleCancelRename = () => {
    setEditingUploadId(null)
    setEditingName('')
  }

  const handleDownload = async (conversion: Conversion, upload: Upload) => {
    if (!user) return
    
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient()
      let downloadPath = conversion.output_path
      let fileName = `converted.${conversion.target_format}`
      
      if (!downloadPath || conversion.status !== 'completed') {
        downloadPath = upload.storage_path
        fileName = upload.original_filename
      }
      
      const { data, error } = await supabase.storage
        .from('uploads')
        .download(downloadPath)
      
      if (error) {
        const { data: urlData } = await supabase.storage
          .from('uploads')
          .createSignedUrl(downloadPath, 3600)
        
        if (urlData?.signedUrl) {
          const a = document.createElement('a')
          a.href = urlData.signedUrl
          a.download = fileName
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          return
        }
        throw error
      }
      
      if (data) {
        const url = URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('File not available for download yet. The conversion may still be processing.')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredFormats = formatSearch 
    ? searchFormats(formatSearch)
    : FILE_FORMATS

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  const getFileCategory = (filename: string) => {
    const ext = getFileExtension(filename)
    const format = FILE_FORMATS.find(f => f.ext === ext)
    return format?.category || 'other'
  }

  const filteredUploads = uploads.filter(upload => {
    if (searchQuery && !upload.original_filename.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    if (fileTypeFilter !== 'all') {
      if (fileTypeFilter === 'image') {
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff']
        if (!imageExts.includes(getFileExtension(upload.original_filename))) {
          return false
        }
      } else if (fileTypeFilter === 'document') {
        const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt']
        if (!docExts.includes(getFileExtension(upload.original_filename))) {
          return false
        }
      } else if (fileTypeFilter === 'video') {
        const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
        if (!videoExts.includes(getFileExtension(upload.original_filename))) {
          return false
        }
      } else if (fileTypeFilter === 'audio') {
        const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac']
        if (!audioExts.includes(getFileExtension(upload.original_filename))) {
          return false
        }
      } else if (fileTypeFilter === 'archive') {
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz']
        if (!archiveExts.includes(getFileExtension(upload.original_filename))) {
          return false
        }
      } else {
        const category = getFileCategory(upload.original_filename)
        if (category !== fileTypeFilter) {
          return false
        }
      }
    }

    if (conversionStatusFilter !== 'all') {
      if (conversionStatusFilter === 'has-conversions') {
        if (!upload.conversions || upload.conversions.length === 0) {
          return false
        }
      } else if (conversionStatusFilter === 'no-conversions') {
        if (upload.conversions && upload.conversions.length > 0) {
          return false
        }
      } else if (conversionStatusFilter === 'completed') {
        if (!upload.conversions || !upload.conversions.some(c => c.status === 'completed')) {
          return false
        }
      } else if (conversionStatusFilter === 'processing') {
        if (!upload.conversions || !upload.conversions.some(c => c.status === 'processing')) {
          return false
        }
      } else if (conversionStatusFilter === 'failed') {
        if (!upload.conversions || !upload.conversions.some(c => c.status === 'failed')) {
          return false
        }
      }
    }

    return true
  })

  const totalPages = Math.ceil(filteredUploads.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedUploads = filteredUploads.slice(startIndex, endIndex)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-yellow-400 animate-spin" />
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-400" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-extrabold text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              My Uploads
            </h1>
            <p className="text-gray-400">Manage your uploaded files and conversions</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            Upload File
          </button>
        </div>

        {uploads.length > 0 && (
          <div className="mb-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by filename..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={fileTypeFilter}
                  onChange={(e) => setFileTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="archive">Archives</option>
                </select>

                <select
                  value={conversionStatusFilter}
                  onChange={(e) => setConversionStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="has-conversions">Has Conversions</option>
                  <option value="no-conversions">No Conversions</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading uploads...</div>
        ) : uploads.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center">
            <DocumentIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No uploads yet</h3>
            <p className="text-gray-400 mb-6">Upload your first file to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition-all duration-300"
            >
              Upload File
            </button>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center">
            <FunnelIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No files match your filters</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFileTypeFilter('all')
                setConversionStatusFilter('all')
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedUploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="mb-4">
                  <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                    {previewUrls[upload.id] ? (
                      <img 
                        src={previewUrls[upload.id]}
                        alt={upload.original_filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <DocumentIcon className="w-16 h-16 text-gray-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {editingUploadId === upload.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-1 flex-1 px-3 py-1 bg-gray-800 border border-purple-500 rounded-lg">
                          <input
                            ref={nameInputRef}
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveRename(upload.id, upload.original_filename)
                              } else if (e.key === 'Escape') {
                                handleCancelRename()
                              }
                            }}
                            className="flex-1 bg-transparent text-white text-sm font-semibold focus:outline-none"
                          />
                          <span className="text-gray-400 text-sm">{getFileExtensionWithDot(upload.original_filename)}</span>
                        </div>
                        <button
                          onClick={() => handleSaveRename(upload.id, upload.original_filename)}
                          className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all duration-300"
                          title="Save"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                          title="Cancel"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-white font-semibold truncate flex-1">{upload.original_filename}</h3>
                        <button
                          onClick={() => handleStartRename(upload)}
                          className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                          title="Rename file"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>{formatBytes(upload.file_size)}</span>
                    <span>•</span>
                    <span>{formatDate(upload.created_at)}</span>
                  </div>
                </div>

                {upload.conversions && upload.conversions.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {upload.conversions.slice(0, 1).map((conversion) => (
                      <div key={conversion.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(conversion.status)}
                          <span className="text-sm text-gray-300">
                            {conversion.original_format.toUpperCase()} → {conversion.target_format.toUpperCase()}
                          </span>
                        </div>
                        {conversion.status === 'completed' && (
                          <button
                            onClick={() => handleDownload(conversion, upload)}
                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-300"
                            title="Download converted file"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {upload.conversions.length > 1 && (
                      <button
                        onClick={() => {
                          setSelectedUploadForHistory(upload)
                          setShowHistoryModal(true)
                        }}
                        className="w-full text-xs text-purple-400 hover:text-purple-300 text-center py-2 transition-colors duration-300"
                      >
                        View conversion history ({upload.conversions.length})
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedUpload(upload)
                      setSelectedFile(null)
                      setShowFormatModal(true)
                      setFormatSearch('')
                      setSelectedFormat(null)
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-all duration-300"
                  >
                    {upload.conversions && upload.conversions.length > 0 ? 'Convert Again' : 'Convert'}
                  </button>
                  <button
                    onClick={() => handleDelete(upload.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="text-gray-500 px-2">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="mt-4 text-center text-sm text-gray-400">
                Showing {startIndex + 1} - {Math.min(endIndex, filteredUploads.length)} of {filteredUploads.length} files
              </div>
            )}
          </>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Upload File</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <ArrowUpTrayIcon className="w-12 h-12 text-gray-400" />
                <div>
                  <span className="text-purple-400 font-semibold">Click to upload</span>
                  <span className="text-gray-400"> or drag and drop</span>
                </div>
                <p className="text-sm text-gray-500">Any file format supported</p>
              </label>
            </div>
          </div>
        </div>
      )}

      {showFormatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Select Format</h2>
              <button
                onClick={() => {
                  setShowFormatModal(false)
                  setSelectedFile(null)
                  setSelectedUpload(null)
                  setSelectedFormat(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {(selectedFile || selectedUpload) && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">File:</p>
                <p className="text-white font-medium">
                  {selectedFile?.name || selectedUpload?.original_filename}
                </p>
              </div>
            )}

            <div className="relative mb-4" ref={formatDropdownRef}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formatSearch}
                  onChange={(e) => setFormatSearch(e.target.value)}
                  placeholder="Search formats..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              {formatSearch && (
                <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl max-h-64 overflow-y-auto">
                  {filteredFormats.length > 0 ? (
                    filteredFormats.map((format) => (
                      <button
                        key={format.ext}
                        onClick={() => {
                          setSelectedFormat(format.ext)
                          setFormatSearch('')
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                          selectedFormat === format.ext ? 'bg-purple-600/20 border-l-2 border-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{format.name}</p>
                            <p className="text-sm text-gray-400">.{format.ext}</p>
                          </div>
                          {selectedFormat === format.ext && (
                            <CheckCircleIcon className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400 text-center">No formats found</div>
                  )}
                </div>
              )}
              {selectedFormat && (
                <div className="mt-2 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-gray-400">Selected format:</p>
                  <p className="text-white font-medium">
                    {getFormatByExt(selectedFormat)?.name} (.{selectedFormat})
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleUploadAndConvert}
              disabled={!selectedFormat || uploading || converting}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading || converting ? 'Processing...' : 'Upload & Convert'}
            </button>
          </div>
        </div>
      )}

      {showHistoryModal && selectedUploadForHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-modal-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-modal-content-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Conversion History</h2>
                <p className="text-sm text-gray-400 mt-1">{selectedUploadForHistory.original_filename}</p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false)
                  setSelectedUploadForHistory(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedUploadForHistory.conversions && selectedUploadForHistory.conversions.length > 0 ? (
                selectedUploadForHistory.conversions.map((conversion) => (
                  <div key={conversion.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(conversion.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {conversion.original_format.toUpperCase()} → {conversion.target_format.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Created: {formatDate(conversion.created_at)}</span>
                          {conversion.completed_at && (
                            <span>Completed: {formatDate(conversion.completed_at)}</span>
                          )}
                          {conversion.output_size && (
                            <span>Size: {formatBytes(conversion.output_size)}</span>
                          )}
                        </div>
                        {conversion.error_message && (
                          <p className="text-xs text-red-400 mt-1">{conversion.error_message}</p>
                        )}
                      </div>
                    </div>
                    {conversion.status === 'completed' && (
                      <button
                        onClick={() => {
                          handleDownload(conversion, selectedUploadForHistory)
                          setShowHistoryModal(false)
                          setSelectedUploadForHistory(null)
                        }}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-300 ml-4"
                        title="Download converted file"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">No conversion history</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
