'use client'

import { useState, useEffect } from 'react'
import {
  SparklesIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export default function PremiumPage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const freeFeatures = [
    { name: 'Limited Storage', value: '5 GB' },
    { name: 'File Size Limit', value: '100 MB' },
    { name: 'Standard Conversion Speed', value: true },
    { name: 'Basic File Conversions', value: true },
    { name: 'Unlimited Conversions', value: true},
    { name: 'Batch Conversions', value: false },
  ]

  const premiumFeatures = [
    { name: 'Unlimited Storage', value: true },
    { name: 'Higher File Size Limit', value: '10 GB' },
    { name: 'All File Conversions', value: true },
    { name: 'Batch Conversions', value: true },
  ]

  const handleUpgrade = () => {
    alert('Premium upgrade coming soon!')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className={`mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="w-8 h-8 text-yellow-400" />
          <h1 className="text-5xl font-extrabold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Premium
          </h1>
        </div>
        <p className="text-gray-400">Unlock advanced features and unlimited storage</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Free Plan</h2>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">$0</span>
            <span className="text-gray-400">/month</span>
          </div>
          <ul className="space-y-3 mb-6">
            {freeFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                {typeof feature.value === 'boolean' ? (
                  feature.value ? (
                    <CheckIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                  )
                ) : (
                  <CheckIcon className="w-5 h-5 text-green-400" />
                )}
                <span className="text-gray-300">
                  {feature.name}
                  {typeof feature.value === 'string' && (
                    <span className="text-gray-500 ml-2">({feature.value})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
            RECOMMENDED
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Premium Plan</h2>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">$3</span>
            <span className="text-gray-400"> lifetime</span>
          </div>
          <ul className="space-y-3 mb-6">
            {premiumFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-white">
                  {feature.name}
                  {typeof feature.value === 'string' && (
                    <span className="text-gray-300 ml-2">({feature.value})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full px-6 py-3 bg-gray-700 rounded-xl text-gray-400 font-semibold cursor-not-allowed opacity-50"
          >
            Coming Soon
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Why Upgrade?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Unlimited Storage</h3>
            <p className="text-gray-400">Never worry about running out of space. Upload and convert as many files as you need.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
              <SparklesIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Higher File Size Limit</h3>
            <p className="text-gray-400">Upload and convert larger files up to 10 GB per file.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg flex items-center justify-center mb-4">
              <SparklesIcon className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Batch Conversions</h3>
            <p className="text-gray-400">Convert multiple files at once with batch processing capabilities.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

