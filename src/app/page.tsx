'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0"></div>
      
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className={`py-8 flex items-center justify-between transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-purple-400">flexconvert</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-400 hover:text-white transition-colors duration-300">Features</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-300">Pricing</Link>
            {user ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
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

        <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-20">
          <div className="max-w-6xl w-full">
            <div className={`mb-8 inline-block transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-300">Next-generation file conversion</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className={`space-y-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <h2 className="text-7xl md:text-8xl font-extrabold leading-tight">
                  <span className="block text-white">Transform</span>
                  <span className="block text-purple-400">Any File</span>
                  <span className="block text-white">Instantly</span>
                </h2>
                
                <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                  Powerful conversion engine that handles documents, images, videos, and more. Lightning-fast processing with enterprise-grade security.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href={user ? "/dashboard" : "/login"} 
                    className="group px-8 py-4 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                  >
                    {user ? (
                      <>
                        {user.user_metadata?.avatar_url ? (
                          <img 
                            src={user.user_metadata.avatar_url} 
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
                  </Link>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">100%</div>
                    <div className="text-sm text-gray-500">Secure</div>
                  </div>
                  <div className="w-px h-12 bg-gray-800"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">99.9%</div>
                    <div className="text-sm text-gray-500">Uptime</div>
                  </div>
                  <div className="w-px h-12 bg-gray-800"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">50+</div>
                    <div className="text-sm text-gray-500">Formats</div>
                  </div>
                </div>
              </div>

              <div className={`relative transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-2xl transform rotate-6"></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 space-y-6 animate-float">
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
      </div>
    </div>
  )
}
