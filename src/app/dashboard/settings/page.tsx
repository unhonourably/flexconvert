'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Cog6ToothIcon, ArrowDownTrayIcon, TrashIcon, BellIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { getUploadSettings, saveUploadSettings, resetUploadSettings, type UploadSettings } from '@/lib/settings'
import { FILE_FORMATS } from '@/lib/file-formats'

export default function UploadSettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<UploadSettings>(getUploadSettings())
  const [saved, setSaved] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    setSettings(getUploadSettings())
  }, [])

  const handleSettingChange = (key: keyof UploadSettings, value: any) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveUploadSettings(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      resetUploadSettings()
      setSettings(getUploadSettings())
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (!user) return null

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className={`mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <h1 className="text-5xl font-extrabold text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Upload Settings
        </h1>
        <p className="text-gray-400">Configure your upload and conversion preferences</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Download on Completion */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <ArrowDownTrayIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Download on Completion</h2>
              </div>
              <p className="text-gray-400 text-sm">
                Automatically download converted files when conversion completes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.downloadOnCompletion}
                onChange={(e) => handleSettingChange('downloadOnCompletion', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Default Output Format */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DocumentTextIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Default Output Format</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Set a default format to use when converting files (optional)
          </p>
          <select
            value={settings.defaultOutputFormat || ''}
            onChange={(e) => handleSettingChange('defaultOutputFormat', e.target.value || null)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">No default (ask each time)</option>
            {FILE_FORMATS.filter(f => f.category === 'image').map(format => (
              <option key={format.ext} value={format.ext}>
                {format.name} (.{format.ext})
              </option>
            ))}
          </select>
        </div>

        {/* Compression Quality */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <PhotoIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Compression Quality</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Image compression quality (1-100, higher = better quality but larger file)
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              value={settings.compressionQuality}
              onChange={(e) => handleSettingChange('compressionQuality', parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <span className="text-white font-semibold w-12 text-right">{settings.compressionQuality}%</span>
          </div>
        </div>

        {/* Notification on Completion */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BellIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Notification on Completion</h2>
              </div>
              <p className="text-gray-400 text-sm">
                Show browser notification when conversion completes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationOnCompletion}
                onChange={(e) => handleSettingChange('notificationOnCompletion', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Preserve Metadata */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <PhotoIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Preserve Metadata</h2>
              </div>
              <p className="text-gray-400 text-sm">
                Keep EXIF data and other metadata when converting images
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preserveMetadata}
                onChange={(e) => handleSettingChange('preserveMetadata', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Reset Button */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Reset Settings</h2>
              <p className="text-gray-400 text-sm">Reset all settings to default values</p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

