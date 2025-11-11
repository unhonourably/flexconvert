import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const code = requestUrl.searchParams.get('code')
  const isLinking = requestUrl.searchParams.get('link') === 'true'
  const origin = requestUrl.origin

  if (errorParam || errorDescription) {
    const message = decodeURIComponent(errorDescription || errorParam || 'Authentication error')
    const target = isLinking ? '/dashboard/account' : '/login'
    return NextResponse.redirect(`${origin}${target}?error=${encodeURIComponent(message)}`)
  }

  if (code) {
    const supabase = await createClient()
    
    if (isLinking) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return NextResponse.redirect(`${origin}/dashboard/account?error=${encodeURIComponent('An account with this email already exists. Please use the merge option in account settings.')}`)
        }
        console.error('Error linking account:', error)
        return NextResponse.redirect(`${origin}/dashboard/account?error=${encodeURIComponent(error.message)}`)
      }

      if (data?.user) {
        const { data: identitiesData } = await supabase.auth.getUserIdentities()
        const identities = identitiesData?.identities || []
        const providerIdentity = identities.find((id: any) => 
          id.provider === 'discord' || id.provider === 'github'
        )
        
        if (providerIdentity) {
          const checkResponse = await fetch(`${origin}/api/account/check-existing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: providerIdentity.provider,
              email: providerIdentity.identity_data?.email || data.user.email
            })
          })

          const checkData = await checkResponse.json()
          
          if (checkData.exists && checkData.existingUserId !== data.user.id) {
            return NextResponse.redirect(`${origin}/dashboard/account?merge=${encodeURIComponent(JSON.stringify({
              provider: providerIdentity.provider,
              existingUserId: checkData.existingUserId,
              existingUserEmail: checkData.existingUserEmail,
              uploadCount: checkData.uploadCount,
              conversionCount: checkData.conversionCount
            }))}`)
          }
        }
      }
      
      return NextResponse.redirect(`${origin}/dashboard/account?linked=true`)
    } else {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('An account with this email already exists. Please sign in with your existing account or link this provider in account settings.')}`)
        }
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }
      
      if (data?.user) {
        const { data: identitiesData } = await supabase.auth.getUserIdentities()
        const identities = identitiesData?.identities || []
        const providerIdentity = identities.find((id: any) => 
          id.provider === 'discord' || id.provider === 'github'
        )
        
        // Set primary_provider once (on first login) if missing
        try {
          const currentPrimary = (data.user.user_metadata as any)?.primary_provider
          const candidate = (data.user.app_metadata as any)?.provider
          if (!currentPrimary && candidate) {
            await supabase.auth.updateUser({
              data: {
                ...(data.user.user_metadata || {}),
                primary_provider: candidate,
              }
            })
          }
        } catch (e) {
          console.error('Failed to set primary_provider:', e)
        }
        
        if (providerIdentity && data.user.email) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          const { createClient: createAdminClient } = await import('@supabase/supabase-js')
          
          const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          })

          const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers()
          
          if (!listError && users) {
            const existingUser = users.find(u => {
              if (u.id === data.user.id) return false
              const userIdentities = u.identities || []
              const hasProvider = userIdentities.some((id: any) => id.provider === providerIdentity.provider)
              const providerId = userIdentities.find((id: any) => id.provider === providerIdentity.provider)
              const providerEmail = providerId?.identity_data?.email || u.email
              return hasProvider && providerEmail === data.user.email
            })

            if (existingUser) {
              await adminSupabase.auth.admin.deleteUser(data.user.id)
              
              return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(`An account with this ${providerIdentity.provider} email already exists. Please sign in with your existing account.`)}`)
            }
          }
        }
        
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // If no code and no error, redirect to dashboard
  // This handles cases where the callback is accessed directly
  return NextResponse.redirect(`${origin}/dashboard`)
}
