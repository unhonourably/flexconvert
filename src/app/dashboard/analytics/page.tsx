'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { getUserUploads, getUserConversions } from '@/lib/supabase/database'

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [uploadData, setUploadData] = useState<any[]>([])
  const [conversionData, setConversionData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return
    setLoading(true)
    try {
      const uploads = await getUserUploads(user.id)
      const conversions = await getUserConversions(user.id)

      const now = new Date()
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
          name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          uploads: 0,
          conversions: 0
        })
      }

      uploads.forEach(upload => {
        const uploadDate = new Date(upload.created_at)
        const monthIndex = months.findIndex(m => {
          const monthDate = new Date(m.name)
          return monthDate.getMonth() === uploadDate.getMonth() && 
                 monthDate.getFullYear() === uploadDate.getFullYear()
        })
        if (monthIndex !== -1) {
          months[monthIndex].uploads++
        }
      })

      conversions.forEach(conversion => {
        const convDate = new Date(conversion.created_at)
        const monthIndex = months.findIndex(m => {
          const monthDate = new Date(m.name)
          return monthDate.getMonth() === convDate.getMonth() && 
                 monthDate.getFullYear() === convDate.getFullYear()
        })
        if (monthIndex !== -1) {
          months[monthIndex].conversions++
        }
      })

      setUploadData(months)

      const statusCounts = conversions.reduce((acc: any, conv: any) => {
        acc[conv.status] = (acc[conv.status] || 0) + 1
        return acc
      }, {})

      setConversionData([
        { name: 'Completed', value: statusCounts.completed || 0 },
        { name: 'Processing', value: statusCounts.processing || 0 },
        { name: 'Pending', value: statusCounts.pending || 0 },
        { name: 'Failed', value: statusCounts.failed || 0 },
      ])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <h1 className="text-5xl font-extrabold text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-gray-400">Track your upload and conversion statistics</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-purple-400" />
              Uploads Over Time
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uploadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="uploads" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-cyan-400" />
              Conversion Status
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="value" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Activity Timeline</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={uploadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Line type="monotone" dataKey="uploads" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

