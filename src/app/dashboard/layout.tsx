'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  DocumentIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const userDisplayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userInitial = userDisplayName.charAt(0).toUpperCase()
  const userAvatar = user.user_metadata?.avatar_url

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-black flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <aside className={`w-64 bg-black border-r border-gray-900 flex flex-col fixed left-0 top-0 bottom-0 z-50 transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 md:p-6 border-b border-gray-900 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div>
              <div className="text-white font-bold text-lg">flexconvert</div>
              <div className="text-xs text-gray-500">/dashboard</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link 
            href="/dashboard"
            prefetch={true}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive('/dashboard')
                ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </Link>
          
          <div className="pt-6">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-3">Content</div>
            <Link 
              href="/dashboard/uploads"
              prefetch={true}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive('/dashboard/uploads')
                  ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`}
            >
              <DocumentIcon className="w-5 h-5" />
              <span>My Uploads</span>
            </Link>
            <Link 
              href="/dashboard/analytics"
              prefetch={true}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive('/dashboard/analytics')
                  ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
            <Link 
              href="/dashboard/settings"
              prefetch={true}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive('/dashboard/settings')
                  ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`}
            >
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Upload Settings</span>
            </Link>
          </div>

          <div className="pt-6">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-3">Account</div>
            <Link 
              href="/dashboard/account" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive('/dashboard/account')
                  ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`}
            >
              <UserCircleIcon className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <Link 
              href="/dashboard/premium" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive('/dashboard/premium')
                  ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center text-xs">★</span>
              <span>Premium</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 space-y-4 border-t border-gray-900">
          <div className="flex items-center gap-3 px-3 py-3 bg-gray-900/50 rounded-xl border border-gray-800">
            {userAvatar ? (
              <img src={userAvatar} alt={userDisplayName} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {userInitial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">{userDisplayName}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-xl text-gray-400 hover:text-white font-medium transition-all duration-300"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 overflow-y-auto bg-black">
        <div className="md:hidden p-4 border-b border-gray-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}

