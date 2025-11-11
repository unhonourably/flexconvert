'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, CheckIcon, BoltIcon, ShieldCheckIcon, CloudIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [userCount, setUserCount] = useState<number | null>(null)
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
    fetchUserCount()
  }, [])

  useEffect(() => {
    const loadAvatar = async () => {
      if (!user) {
        setUserAvatarUrl(null)
        return
      }
      try {
        const defaultAvatar = user.user_metadata?.avatar_url || null
        const primary = (user.user_metadata as any)?.primary_provider || (user.app_metadata as any)?.provider
        const supabase = (await import('@/lib/supabase/client')).createClient()
        const { data } = await supabase.auth.getUserIdentities()
        const identities = data?.identities || []
        const selected = identities.find((id: any) => id.provider === primary)
        const idData = selected?.identity_data || {}
        const providerAvatar: string | null = idData.avatar_url || idData.picture || idData.avatar || null
        setUserAvatarUrl(providerAvatar || defaultAvatar)
      } catch {
        setUserAvatarUrl(user.user_metadata?.avatar_url || null)
      }
    }
    loadAvatar()
  }, [user])

  const fetchUserCount = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setUserCount(data.userCount || 0)
    } catch (error) {
      console.error('Error fetching user count:', error)
      setUserCount(0)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className={`py-4 sm:py-8 flex items-center justify-between transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-purple-400">flexconvert</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-400 hover:text-white transition-colors duration-300">Features</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-300">Pricing</Link>
            {user ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {userAvatarUrl ? (
                  <img 
                    src={userAvatarUrl} 
                    alt={user.email || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="px-5 py-2 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Link>
            )}
          </nav>
        </header>

        <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-10 sm:py-20">
          <div className="max-w-6xl w-full">
            <div className={`mb-6 sm:mb-8 flex flex-wrap items-center gap-2 sm:gap-3 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/10 border border-purple-500/30 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-purple-300">Next-generation file conversion</span>
              </div>
              {userCount !== null && (
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/10 border border-purple-500/30 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-purple-300">{userCount.toLocaleString()} Registered Users</span>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
              <div className={`space-y-6 sm:space-y-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight">
                  <span className="block text-white">Transform</span>
                  <span className="block text-purple-400">Any File</span>
                  <span className="block text-white">Instantly</span>
                </h2>
                
                <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed max-w-lg">
                  Powerful conversion engine that handles documents, images, videos, and more. Lightning-fast processing with enterprise-grade security.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href={user ? "/dashboard" : "/login"} 
                    className="group px-8 py-4 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      {user ? (
                        <>
                          {userAvatarUrl ? (
                            <img 
                              src={userAvatarUrl} 
                              alt={user.email || 'User'} 
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.charAt(0) || 'U').toUpperCase()}
                            </div>
                          )}
                          Go to Dashboard
                          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        <>
                          Start Converting
                          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Link>
                </div>

                <div className="flex items-center gap-4 sm:gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
                    <div className="text-xs sm:text-sm text-gray-500">Secure</div>
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-gray-800"></div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">99.9%</div>
                    <div className="text-xs sm:text-sm text-gray-500">Uptime</div>
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-gray-800"></div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
                    <div className="text-xs sm:text-sm text-gray-500">Formats</div>
                  </div>
                </div>
              </div>

              <div className={`relative transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-xl"></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 space-y-6 animate-float shadow-lg shadow-purple-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">PDF to DOCX</div>
                        <div className="text-sm text-gray-400">2.3 MB • Completed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🖼️</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">PNG to JPG</div>
                        <div className="text-sm text-gray-400">1.1 MB • Completed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎬</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">MP4 to GIF</div>
                        <div className="text-sm text-gray-400">Processing...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </main>

        <section id="features" className="py-12 sm:py-16 md:py-24">
          <div className={`text-center mb-8 sm:mb-12 md:mb-16 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4 px-4">
              Powerful <span className="text-purple-400">Features</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Everything you need to convert files quickly and securely
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4">
            <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/30 group-hover:scale-110 transition-all duration-300">
                <BoltIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Convert files in seconds with our optimized processing engine</p>
            </div>

            <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/30 group-hover:scale-110 transition-all duration-300">
                <ShieldCheckIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Secure</h3>
              <p className="text-gray-400">Your files are encrypted and automatically deleted after processing</p>
            </div>

            <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '700ms' }}>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/30 group-hover:scale-110 transition-all duration-300">
                <DocumentTextIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">50+ Formats</h3>
              <p className="text-gray-400">Support for images, documents, videos, audio, and more</p>
            </div>

            <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '800ms' }}>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/30 group-hover:scale-110 transition-all duration-300">
                <CloudIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cloud Storage</h3>
              <p className="text-gray-400">Access your converted files from anywhere, anytime</p>
            </div>

            <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '900ms' }}>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/30 group-hover:scale-110 transition-all duration-300">
                <SparklesIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Easy to Use</h3>
              <p className="text-gray-400">Simple interface that makes file conversion effortless</p>
            </div>

            <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '1000ms' }}>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/30 group-hover:scale-110 transition-all duration-300">
                <BoltIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Watermarks</h3>
              <p className="text-gray-400">Clean, professional conversions without any branding</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-12 sm:py-16 md:py-24">
          <div className={`text-center mb-8 sm:mb-12 md:mb-16 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4 px-4">
              Simple <span className="text-purple-400">Pricing</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4">
            <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 transition-all duration-700 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-2xl font-bold text-white mb-2">Free Plan</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Limited Storage (5 GB)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">File Size Limit (100 MB)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Standard Conversion Speed</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Basic File Conversions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Unlimited Conversions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-500">Batch Conversions</span>
                </li>
              </ul>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="w-full block text-center px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-semibold transition-all duration-300"
              >
                Get Started
              </Link>
            </div>

            <div className={`bg-purple-600/20 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-8 relative overflow-hidden transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                RECOMMENDED
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Premium Plan</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$3</span>
                <span className="text-gray-400"> lifetime</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white">Unlimited Storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white">Higher File Size Limit (10 GB)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white">All File Conversions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white">Batch Conversions</span>
                </li>
              </ul>
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-700 rounded-xl text-gray-400 font-semibold cursor-not-allowed opacity-50"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-900 py-8 sm:py-12 mt-12 sm:mt-16 md:mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">flexconvert</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <Link 
                  href="/privacy" 
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/cookies" 
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Cookie Policy
                </Link>
              </div>
              
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} flexconvert. All rights reserved.
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-900 text-center">
              <p className="text-xs text-gray-500">
                This website is GDPR compliant. We respect your privacy and handle your data in accordance with the General Data Protection Regulation (GDPR).
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
