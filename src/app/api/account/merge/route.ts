import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { existingUserId, keepEmail } = await request.json()
    
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

    const targetUserId = user.id
    const sourceUserId = existingUserId

    const { data: sourceUploads } = await adminSupabase
      .from('uploads')
      .select('*')
      .eq('user_id', sourceUserId)

    const { data: sourceConversions } = await adminSupabase
      .from('conversions')
      .select('*')
      .eq('user_id', sourceUserId)

    if (sourceUploads && sourceUploads.length > 0) {
      for (const upload of sourceUploads) {
        const oldPath = upload.storage_path
        const newPath = oldPath.replace(sourceUserId, targetUserId)
        
        const { data: fileData, error: downloadError } = await adminSupabase.storage
          .from('uploads')
          .download(oldPath)

        if (!downloadError && fileData) {
          const { error: uploadError } = await adminSupabase.storage
            .from('uploads')
            .upload(newPath, fileData, { upsert: true })

          if (!uploadError) {
            await adminSupabase.storage
              .from('uploads')
              .remove([oldPath])
          }
        }

        await adminSupabase
          .from('uploads')
          .update({ user_id: targetUserId, storage_path: newPath })
          .eq('id', upload.id)
      }
    }

    if (sourceConversions && sourceConversions.length > 0) {
      for (const conversion of sourceConversions) {
        if (conversion.output_path) {
          const oldPath = conversion.output_path
          const newPath = oldPath.replace(sourceUserId, targetUserId)
          
          const { data: fileData, error: downloadError } = await adminSupabase.storage
            .from('uploads')
            .download(oldPath)

          if (!downloadError && fileData) {
            const { error: uploadError } = await adminSupabase.storage
              .from('uploads')
              .upload(newPath, fileData, { upsert: true })

            if (!uploadError) {
              await adminSupabase.storage
                .from('uploads')
                .remove([oldPath])
            }
          }

          await adminSupabase
            .from('conversions')
            .update({ 
              user_id: targetUserId, 
              output_path: newPath 
            })
            .eq('id', conversion.id)
        } else {
          await adminSupabase
            .from('conversions')
            .update({ user_id: targetUserId })
            .eq('id', conversion.id)
        }
      }
    }

    if (keepEmail && existingUser.user.email) {
      await supabase.auth.updateUser({
        email: keepEmail
      })
    }

    await adminSupabase.auth.admin.deleteUser(existingUserId)

    return NextResponse.json({ 
      success: true,
      mergedUploads: sourceUploads?.length || 0,
      mergedConversions: sourceConversions?.length || 0
    })
  } catch (error: any) {
    console.error('Error merging accounts:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

