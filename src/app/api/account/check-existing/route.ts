import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { provider, email } = await request.json()
    
    if (!provider || !email) {
      return NextResponse.json({ error: 'Provider and email are required' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers()
    
    if (listError) {
      return NextResponse.json({ error: 'Failed to check for existing accounts' }, { status: 500 })
    }

    const existingUser = users?.find(u => {
      if (u.id === user.id) return false
      const identities = u.identities || []
      const hasProvider = identities.some((id: any) => id.provider === provider)
      const providerIdentity = identities.find((id: any) => id.provider === provider)
      const providerEmail = providerIdentity?.identity_data?.email || u.email
      return hasProvider && providerEmail === email
    })

    if (existingUser) {
      const { data: uploads } = await adminSupabase
        .from('uploads')
        .select('id, original_filename, file_size')
        .eq('user_id', existingUser.id)
      
      const { data: conversions } = await adminSupabase
        .from('conversions')
        .select('id')
        .eq('user_id', existingUser.id)

      return NextResponse.json({
        exists: true,
        existingUserId: existingUser.id,
        existingUserEmail: existingUser.email,
        uploadCount: uploads?.length || 0,
        conversionCount: conversions?.length || 0,
        existingUserCreatedAt: existingUser.created_at,
        currentUserCreatedAt: user.created_at
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error: any) {
    console.error('Error checking for existing account:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

