import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const isLinking = requestUrl.searchParams.get('link') === 'true'
  const origin = requestUrl.origin

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
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
