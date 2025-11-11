import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      const { data: uniqueUsers, error: fallbackError } = await supabase
        .from('uploads')
        .select('user_id')
      
      if (fallbackError) {
        return NextResponse.json({ userCount: 0 }, { status: 200 })
      }

      const uniqueUserIds = new Set(uniqueUsers?.map(u => u.user_id) || [])
      const userCount = uniqueUserIds.size || 0
      return NextResponse.json({ userCount })
    }

    const userCount = data?.users?.length || 0
    return NextResponse.json({ userCount })
  } catch (error) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const { data: uniqueUsers, error: fallbackError } = await supabase
        .from('uploads')
        .select('user_id')
      
      if (fallbackError) {
        return NextResponse.json({ userCount: 0 }, { status: 200 })
      }

      const uniqueUserIds = new Set(uniqueUsers?.map(u => u.user_id) || [])
      const userCount = uniqueUserIds.size || 0
      return NextResponse.json({ userCount })
    } catch {
      return NextResponse.json({ userCount: 0 }, { status: 200 })
    }
  }
}

