import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { existingUserId } = await request.json()
    
    if (!existingUserId) {
      return NextResponse.json({ error: 'Existing user ID is required' }, { status: 400 })
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

    const { data: existingUser } = await adminSupabase.auth.admin.getUserById(existingUserId)
    
    if (!existingUser?.user) {
      return NextResponse.json({ error: 'Existing user not found' }, { status: 404 })
    }

    const { data: uploads } = await adminSupabase
      .from('uploads')
      .select('storage_path')
      .eq('user_id', existingUserId)

    if (uploads && uploads.length > 0) {
      const pathsToDelete = uploads.map(u => u.storage_path).filter(Boolean)
      if (pathsToDelete.length > 0) {
        await adminSupabase.storage
          .from('uploads')
          .remove(pathsToDelete)
      }
    }

    const { data: conversions } = await adminSupabase
      .from('conversions')
      .select('output_path')
      .eq('user_id', existingUserId)

    if (conversions && conversions.length > 0) {
      const pathsToDelete = conversions
        .map(c => c.output_path)
        .filter(Boolean) as string[]
      
      if (pathsToDelete.length > 0) {
        await adminSupabase.storage
          .from('uploads')
          .remove(pathsToDelete)
      }
    }

    await adminSupabase.auth.admin.deleteUser(existingUserId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting existing account:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

