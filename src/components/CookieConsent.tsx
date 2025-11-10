'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { getCookieConsent, setCookieConsent, type CookieConsent } from '@/lib/cookies'

export default function CookieConsent() {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const consent = getCookieConsent()
    if (!consent || !consent.accepted) {
      setShow(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      accepted: true,
      timestamp: Date.now(),
      necessary: true,
      analytics: true,
      marketing: true,
    }
    setCookieConsent(consent)
    setShow(false)
  }

  const handleAcceptNecessary = () => {
    const consent: CookieConsent = {
      accepted: true,
      timestamp: Date.now(),
      necessary: true,
      analytics: false,
      marketing: false,
    }
    setCookieConsent(consent)
    setShow(false)
  }

  if (!mounted || !show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <div className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍪</span>
              <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
              By clicking "Accept All", you consent to our use of cookies. You can also choose to accept only necessary cookies.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <div>
                <span className="font-semibold text-gray-400">Necessary:</span> Required for site functionality
              </div>
              <div>
                <span className="font-semibold text-gray-400">Analytics:</span> Help us improve our services
              </div>
              <div>
                <span className="font-semibold text-gray-400">Marketing:</span> Personalize your experience
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleAcceptNecessary}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm font-medium transition-all duration-300"
            >
              Necessary Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg text-white text-sm font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Accept All
            </button>
          </div>
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

