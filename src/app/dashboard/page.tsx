'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  CloudIcon,
  CalendarIcon,
  PhotoIcon,
  HomeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { getStorageStats, getUserUploads, getUserConversions } from '@/lib/supabase/database'

export default function Dashboard() {
  const [showMotd, setShowMotd] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({ totalSize: 0, fileCount: 0, conversionCount: 0 })
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Tue', uploads: 0 },
    { day: 'Wed', uploads: 0 },
    { day: 'Thu', uploads: 0 },
    { day: 'Fri', uploads: 0 },
    { day: 'Sat', uploads: 0 },
    { day: 'Sun', uploads: 0 },
    { day: 'Mon', uploads: 0 },
  ])
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      loadStats()
      loadAvatar()
    }
  }, [user])

  const loadAvatar = async () => {
    try {
      const defaultAvatar = user?.user_metadata?.avatar_url || null
      const primary = (user?.user_metadata as any)?.primary_provider || (user?.app_metadata as any)?.provider
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const { data } = await supabase.auth.getUserIdentities()
      const identities = data?.identities || []
      const selected = identities.find((id: any) => id.provider === primary)
      const idData = selected?.identity_data || {}
      const providerAvatar: string | null = idData.avatar_url || idData.picture || idData.avatar || null
      setUserAvatarUrl(providerAvatar || defaultAvatar)
    } catch {
      setUserAvatarUrl(user?.user_metadata?.avatar_url || null)
    }
  }

  const loadStats = async () => {
    if (!user) return
    
    try {
      const storageStats = await getStorageStats(user.id)
      setStats(storageStats)

      const uploads = await getUserUploads(user.id)
      const conversions = await getUserConversions(user.id)
      
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const dayCounts: { [key: string]: number } = {}
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      
      uploads.forEach(upload => {
        const uploadDate = new Date(upload.created_at)
        if (uploadDate >= weekAgo) {
          const dayName = days[uploadDate.getDay()]
          dayCounts[dayName] = (dayCounts[dayName] || 0) + 1
        }
      })

      setWeeklyData(days.map(day => ({
        day,
        uploads: dayCounts[day] || 0
      })))
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userInitial = userDisplayName.charAt(0).toUpperCase()
  const userAvatar = userAvatarUrl
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB'
    const kb = bytes / 1024
    const gb = bytes / (1024 * 1024 * 1024)
    
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`
    } else {
      return `${kb.toFixed(2)} KB`
    }
  }

  const storagePercentage = (stats.totalSize / (5 * 1024 * 1024 * 1024)) * 100

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`mb-6 flex items-center gap-2 text-sm text-gray-500 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <HomeIcon className="w-4 h-4" />
        <span>dashboard</span>
      </div>

      <div className={`mb-8 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Dashboard</h1>
        <div className="flex items-center gap-3 text-gray-400">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userDisplayName} 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {userInitial}
            </div>
          )}
          <span>Welcome back, {userDisplayName}</span>
        </div>
      </div>

      {showMotd && (
        <div className={`mb-8 bg-purple-600/20 border border-purple-500/30 rounded-xl p-5 flex items-center justify-between backdrop-blur-sm transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-purple-300">What's New</div>
              <div className="text-sm text-gray-300">Enhanced conversion speeds and new format support!</div>
            </div>
          </div>
          <button onClick={() => setShowMotd(false)} className="text-gray-500 hover:text-white transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 transition-all duration-500 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhotoIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.fileCount}</div>
          <div className="text-sm text-gray-500">Total Uploads</div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <CloudIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{formatBytes(stats.totalSize)}</div>
          <div className="text-sm text-gray-500">of 5 GB</div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpTrayIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.conversionCount}</div>
          <div className="text-sm text-gray-500">Conversions</div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{weeklyData.reduce((sum, day) => sum + day.uploads, 0)}</div>
          <div className="text-sm text-gray-500">This Week</div>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 transition-all duration-500 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-2">Weekly Activity</h2>
          <div className="text-sm text-gray-500 mb-6">Uploads</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', padding: '12px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
            <div className="flex gap-2">
              {weeklyData.map((item, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 border border-gray-700">
                  {item.day}
                </div>
              ))}
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-500">Today: </span>
                <span className="text-white font-semibold ml-1">{weeklyData[new Date().getDay()]?.uploads || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Total: </span>
                <span className="text-white font-semibold ml-1">{weeklyData.reduce((sum, day) => sum + day.uploads, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3 mb-6">
            <a
              href="/dashboard/uploads"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-purple-600 rounded-xl text-white transition-all duration-300 transform hover:scale-105 group"
            >
              <ArrowUpTrayIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Upload Files</span>
            </a>
            <a
              href="/dashboard/uploads"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-purple-600 rounded-xl text-white transition-all duration-300 transform hover:scale-105 group"
            >
              <PhotoIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">View Uploads</span>
            </a>
            <a
              href="/dashboard/settings"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-purple-600 rounded-xl text-white transition-all duration-300 transform hover:scale-105 group"
            >
              <Cog6ToothIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Settings</span>
            </a>
          </div>
          <div className="pt-6 border-t border-gray-800">
            <div className="text-sm text-gray-500 mb-2">Storage</div>
            <div className="text-2xl font-bold text-white mb-2">{formatBytes(stats.totalSize)} / 5 GB</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
