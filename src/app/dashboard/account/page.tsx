'use client'

import { useState, useEffect } from 'react'
import {
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
  LinkIcon,
  CheckCircleIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>([])
  const [linkedNames, setLinkedNames] = useState<Record<string, string>>({})
  const [generatedMergeCode, setGeneratedMergeCode] = useState<string | null>(null)
  const [mergeCodeInput, setMergeCodeInput] = useState('')
  const [generatingMergeCode, setGeneratingMergeCode] = useState(false)
  const [mergingWithCode, setMergingWithCode] = useState(false)
  const [mergeSuccess, setMergeSuccess] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const getPrimaryProvider = () => {
    // Prefer explicit metadata primary_provider; fallback to current session provider
    return (user?.user_metadata as any)?.primary_provider || (user?.app_metadata as any)?.provider || null
  }

  const getPrimaryProviderEmail = async (): Promise<string | null> => {
    try {
      const { data } = await supabase.auth.getUserIdentities()
      const identities = data?.identities || []
      const primary = getPrimaryProvider()
      const selected = identities.find((id: any) => id.provider === primary)
      const idData = selected?.identity_data || {}
      const providerEmail: string | null = idData.email || user?.email || null
      return providerEmail
    } catch {
      return user?.email || null
    }
  }

  useEffect(() => {
    setMounted(true)
    if (user) {
      setFormData({
        email: user.email || '',
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      loadLinkedAccounts()
    }
    
    const urlParams = new URLSearchParams(window.location.search)
    const linked = urlParams.get('linked')
    const error = urlParams.get('error')
    
    if (linked === 'true') {
      setMessage({ type: 'success', text: 'Account linked successfully!' })
      loadLinkedAccounts()
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [user])

  const loadLinkedAccounts = async () => {
    if (!user) return
    try {
      const { data } = await supabase.auth.getUserIdentities()
      const identities = data?.identities || []
      const providers = identities.map((identity: any) => identity.provider) || []
      setLinkedAccounts(providers)

      const names: Record<string, string> = {}
      identities.forEach((identity: any) => {
        const info = identity?.identity_data || {}
        const display =
          info.user_name ||
          info.username ||
          info.preferred_username ||
          info.full_name ||
          info.name ||
          info.login ||
          info.nickname ||
          info.email ||
          ''
        names[identity.provider] = display
      })
      setLinkedNames(names)
    } catch (error) {
      console.error('Error loading linked accounts:', error)
    }
  }

  const handleLinkAccount = async (provider: 'discord' | 'github') => {
    if (!user) return
    
    setLinking(provider)
    setMessage(null)

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?link=true`
      console.log('Attempting to link identity with redirect:', redirectUrl)
      
      const { data: linkResponse, error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      })
      
      if (error) {
        console.error('Link identity error:', error)

        if (error.message?.toLowerCase().includes('already linked')) {
          setMessage({
            type: 'error',
            text: `This ${provider} account is already linked to another user. Ask that account to generate a merge code from its settings, then enter the code here to merge the accounts.`,
          })
        } else {
          setMessage({
            type: 'error',
            text: error.message || `Failed to link ${provider} account. Make sure manual linking is enabled in Supabase settings.`,
          })
        }
        setLinking(null)
        return
      }
      
      console.log('Link response:', linkResponse)
      
      if (linkResponse?.url) {
        console.log('Redirecting to:', linkResponse.url)
        window.location.href = linkResponse.url
      } else {
        console.error('No URL in linkResponse:', linkResponse)
        setMessage({ type: 'error', text: 'No redirect URL received. Please check that manual linking is enabled in your Supabase project settings.' })
        setLinking(null)
      }
    } catch (err: any) {
      console.error('Error linking account:', err)
      setMessage({ type: 'error', text: err.message || `Failed to link ${provider} account. Please try again.` })
      setLinking(null)
    }
  }

  const handleUnlinkAccount = async (provider: 'discord' | 'github' | 'email') => {
    if (!user) return

    const { data: identitiesData } = await supabase.auth.getUserIdentities()
    const identities = identitiesData?.identities || []
    
    if (identities.length <= 1) {
      setMessage({ type: 'error', text: 'Cannot unlink your last account. You must have at least one linked account.' })
      return
    }

    if (!confirm(`Are you sure you want to unlink your ${provider} account? You will no longer be able to sign in with this method.`)) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const identityToUnlink = identities.find((id: any) => id.provider === provider)
      
      if (!identityToUnlink) {
        throw new Error(`${provider} account is not linked`)
      }

      const { error } = await supabase.auth.unlinkIdentity(identityToUnlink)
      
      if (error) throw error

      setMessage({ type: 'success', text: `${provider} account unlinked successfully` })
      loadLinkedAccounts()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || `Failed to unlink ${provider} account` })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMergeCode = async () => {
    if (!user) return

    setGeneratingMergeCode(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/merge-code', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate merge code')
      }

      setGeneratedMergeCode(data.code)
      setMessage({
        type: 'success',
        text: 'Merge code generated. Share this code with the account you want to merge into this one.'
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to generate merge code' })
    } finally {
      setGeneratingMergeCode(false)
    }
  }

  const handleCopyMergeCode = async () => {
    if (!generatedMergeCode) return

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(generatedMergeCode)
        setMessage({ type: 'success', text: 'Merge code copied to clipboard' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Unable to copy merge code' })
    }
  }

  const handleMergeWithCode = async () => {
    if (!mergeCodeInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a merge code' })
      return
    }

    setMergingWithCode(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/use-merge-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mergeCodeInput.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to merge accounts')
      }

      setMessage({
        type: 'success',
        text: `Accounts merged successfully! ${data.mergedUploads} uploads and ${data.mergedConversions} conversions transferred.`
      })
      setMergeCodeInput('')
      setGeneratedMergeCode(null)
      setMergeSuccess(true)

      await supabase.auth.refreshSession()
      // Briefly show success, then hard reload the page
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload()
      }, 1200)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to merge accounts' })
    } finally {
      setMergingWithCode(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const updates: any = {}
      
      if (formData.fullName && formData.fullName !== (user.user_metadata?.full_name || user.user_metadata?.name)) {
        updates.data = {
          ...user.user_metadata,
          full_name: formData.fullName,
          name: formData.fullName
        }
      }

      if (formData.email && formData.email !== user.email) {
        const { error } = await supabase.auth.updateUser({
          email: formData.email,
          ...updates
        })
        if (error) throw error
      } else if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates)
        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const isOAuthUser = (() => {
    const authProvider = user?.app_metadata?.provider || 'email'
    return authProvider === 'discord' || authProvider === 'github'
  })()

  const baseHasEmail = linkedAccounts.includes('email')
  const providerName = (() => {
    const p = user?.app_metadata?.provider
    if (p === 'discord') return 'Discord'
    if (p === 'github') return 'GitHub'
    return 'Email'
  })()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'Please enter a password' })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const providerEmail = await getPrimaryProviderEmail()
      const updates: any = { password: formData.newPassword }
      if (providerEmail && providerEmail !== user.email) {
        updates.email = providerEmail
      }

      const { error } = await supabase.auth.updateUser(updates)
      if (error) throw error

      const nowHasEmail = true
      setMessage({ type: 'success', text: baseHasEmail || nowHasEmail ? 'Password updated successfully!' : 'Password set successfully! You can now sign in with email/password.' })
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))

      await supabase.auth.refreshSession()
      await loadLinkedAccounts()
      setLinkedAccounts(prev => prev.includes('email') ? prev : [...prev, 'email'])

      if (updates.email) {
        setFormData(prev => ({ ...prev, email: updates.email }))
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to set password' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || !confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    if (!confirm('This will permanently delete all your data. This requires admin access. Please contact support.')) {
      return
    }

    setMessage({ type: 'error', text: 'Account deletion requires admin access. Please contact support for assistance.' })
  }

  if (!user) return null

  const hasDiscord = linkedAccounts.includes('discord')
  const hasGitHub = linkedAccounts.includes('github')
  const hasEmail = linkedAccounts.includes('email')
  
  const getEmailSource = () => {
    if (hasEmail && !isOAuthUser) return null
    if (hasDiscord && !hasEmail) return 'Discord'
    if (hasGitHub && !hasEmail) return 'GitHub'
    if (hasDiscord && hasEmail) return 'Discord'
    if (hasGitHub && hasEmail) return 'GitHub'
    return null
  }
  
  const emailSource = getEmailSource()

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className={`mb-6 sm:mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-400">Manage your account information and preferences</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserCircleIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Profile Information</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
                {emailSource && (
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (from {emailSource})
                  </span>
                )}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
              {emailSource && (
                <p className="mt-2 text-xs text-gray-500">
                  Setting a custom email will override the email from {emailSource}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Linked Accounts</h2>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5865F2] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">Discord</div>
                  <div className="text-sm text-gray-400">
                    {hasDiscord ? 'Linked' : 'Not linked'}
                  </div>
                  {hasDiscord && linkedNames.discord && (
                    <div className="text-xs text-gray-500">Discord - {linkedNames.discord}</div>
                  )}
                </div>
              </div>
              {hasDiscord ? (
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  {linkedAccounts.length > 1 && (
                    <button
                      onClick={() => handleUnlinkAccount('discord')}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Unlink
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleLinkAccount('discord')}
                  disabled={linking === 'discord'}
                  className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linking === 'discord' ? 'Linking...' : 'Link'}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">GitHub</div>
                  <div className="text-sm text-gray-400">
                    {hasGitHub ? 'Linked' : 'Not linked'}
                  </div>
                  {hasGitHub && linkedNames.github && (
                    <div className="text-xs text-gray-500">GitHub - {linkedNames.github}</div>
                  )}
                </div>
              </div>
              {hasGitHub ? (
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  {linkedAccounts.length > 1 && (
                    <button
                      onClick={() => handleUnlinkAccount('github')}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Unlink
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleLinkAccount('github')}
                  disabled={linking === 'github'}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linking === 'github' ? 'Linking...' : 'Link'}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-10 h-10 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Email</div>
                  <div className="text-sm text-gray-400">
                    {hasEmail ? 'Linked (password set)' : 'Not linked (optional)'}
                  </div>
                  {hasEmail && user?.email && (
                    <div className="text-xs text-gray-500">Email - {user.email}</div>
                  )}
                </div>
              </div>
              {hasEmail ? (
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              ) : (
                <span className="text-sm text-gray-500">Set password below to enable</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <KeyIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Set Password</h2>
          </div>
          {isOAuthUser && !hasEmail && (
            <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-purple-400">Optional:</span> Set a password to enable email/password login. 
                You can still sign in with <span className="font-semibold text-purple-400">{providerName}</span>.
              </p>
            </div>
          )}
          {isOAuthUser && hasEmail && (
            <div className="mb-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
              <p className="text-sm text-gray-300">
                You can sign in with either <span className="font-semibold text-purple-400">{providerName}</span> or email/password.
              </p>
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                {hasEmail ? 'New Password' : 'Set Password'}
                {isOAuthUser && !hasEmail && (
                  <span className="ml-2 text-xs text-gray-500 font-normal">(optional)</span>
                )}
              </label>
              <input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={hasEmail ? "Enter new password" : "Set password to enable email login (optional)"}
                minLength={6}
              />
            </div>
            {formData.newPassword && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Confirm password"
                  minLength={6}
                />
              </div>
            )}
            {formData.newPassword && (
              <button
                type="submit"
                disabled={loading || !formData.newPassword || !formData.confirmPassword}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting...' : hasEmail ? 'Update Password' : 'Set Password'}
              </button>
            )}
          </form>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <CodeBracketIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Account Merge Codes</h2>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Generate a merge code on the account you plan to retire, then enter it below on the account you want to keep. The other account will be deleted and all uploads and conversions will be moved here.
          </p>
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Your merge code</div>
                  <div className="text-lg font-mono text-white">
                    {generatedMergeCode ? generatedMergeCode : 'Generate a code'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateMergeCode}
                    disabled={generatingMergeCode}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingMergeCode ? 'Generating...' : 'Generate Code'}
                  </button>
                  <button
                    onClick={handleCopyMergeCode}
                    disabled={!generatedMergeCode}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Share this code with the account you want to merge into this one. Generating a new code will invalidate the previous one.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <label htmlFor="mergeCodeInput" className="block text-sm font-medium text-gray-300 mb-2">
                Enter merge code from another account
              </label>
              <input
                id="mergeCodeInput"
                type="text"
                value={mergeCodeInput}
                onChange={(e) => setMergeCodeInput(e.target.value.toUpperCase())}
                placeholder="XXXXXX-XXXXXX"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
              />
              <button
                onClick={handleMergeWithCode}
                disabled={mergingWithCode || mergeSuccess}
                className={`mt-3 w-full px-4 py-3 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${mergeSuccess ? 'bg-green-600 hover:bg-green-500' : 'bg-purple-600 hover:bg-purple-500'}`}
              >
                {mergeSuccess ? 'Merged!' : (mergingWithCode ? 'Merging...' : 'Merge Account Into This One')}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrashIcon className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Danger Zone</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

