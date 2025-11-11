import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Merge code is required' }, { status: 400 })
    }

    const trimmedCode = code.trim()
    if (!trimmedCode) {
      return NextResponse.json({ error: 'Merge code cannot be empty' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const codeHash = createHash('sha256').update(trimmedCode).digest('hex')

    const { data: tokenRecord, error: tokenError } = await adminSupabase
      .from('account_merge_tokens')
      .select('id, user_id')
      .eq('code_hash', codeHash)
      .single()

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired merge code' }, { status: 404 })
    }

    const sourceUserId = tokenRecord.user_id

    if (sourceUserId === user.id) {
      return NextResponse.json({ error: 'You cannot use your own merge code' }, { status: 400 })
    }

    const { data: sourceUser } = await adminSupabase.auth.admin.getUserById(sourceUserId)

    if (!sourceUser?.user) {
      await adminSupabase.from('account_merge_tokens').delete().eq('id', tokenRecord.id)
      return NextResponse.json({ error: 'The account associated with this merge code no longer exists' }, { status: 404 })
    }

    const targetUserId = user.id

    const { data: sourceUploads, error: uploadsError } = await adminSupabase
      .from('uploads')
      .select('*')
      .eq('user_id', sourceUserId)

    if (uploadsError) {
      console.error('Error fetching source uploads:', uploadsError)
      return NextResponse.json({ error: 'Failed to access source uploads' }, { status: 500 })
    }

    const { data: sourceConversions, error: conversionsError } = await adminSupabase
      .from('conversions')
      .select('*')
      .eq('user_id', sourceUserId)

    if (conversionsError) {
      console.error('Error fetching source conversions:', conversionsError)
      return NextResponse.json({ error: 'Failed to access source conversions' }, { status: 500 })
    }

    let mergedUploads = 0
    let mergedConversions = 0

    if (sourceUploads && sourceUploads.length > 0) {
      for (const upload of sourceUploads) {
        const oldPath: string | null = upload.storage_path
        let newPath: string | null = null

        if (oldPath) {
          newPath = oldPath.replace(sourceUserId, targetUserId)

          if (newPath !== oldPath) {
            const { data: fileData, error: downloadError } = await adminSupabase.storage
              .from('uploads')
              .download(oldPath)

            if (!downloadError && fileData) {
              const uploadPath = newPath || oldPath
              const { error: uploadError } = await adminSupabase.storage
                .from('uploads')
                .upload(uploadPath, fileData, { upsert: true })

              if (!uploadError) {
                await adminSupabase.storage
                  .from('uploads')
                  .remove([oldPath])
              } else {
                console.error('Error uploading migrated file:', uploadError)
              }
            } else if (downloadError) {
              console.error('Error downloading source file:', downloadError)
            }
          } else {
            newPath = oldPath
          }
        }

        const { error: updateUploadError } = await adminSupabase
          .from('uploads')
          .update({ user_id: targetUserId, storage_path: newPath ?? oldPath })
          .eq('id', upload.id)

        if (updateUploadError) {
          console.error('Error reassigning upload:', updateUploadError)
        } else {
          mergedUploads += 1
        }
      }
    }

    if (sourceConversions && sourceConversions.length > 0) {
      for (const conversion of sourceConversions) {
        let newPath: string | null = conversion.output_path

        if (conversion.output_path) {
          const oldPath = conversion.output_path
          newPath = oldPath.replace(sourceUserId, targetUserId)

          if (newPath !== oldPath) {
            const { data: fileData, error: downloadError } = await adminSupabase.storage
              .from('uploads')
              .download(oldPath)

            if (!downloadError && fileData) {
              const uploadPath = newPath || oldPath
              const { error: uploadError } = await adminSupabase.storage
                .from('uploads')
                .upload(uploadPath, fileData, { upsert: true })

              if (!uploadError) {
                await adminSupabase.storage
                  .from('uploads')
                  .remove([oldPath])
              } else {
                console.error('Error uploading migrated conversion file:', uploadError)
              }
            } else if (downloadError) {
              console.error('Error downloading conversion file:', downloadError)
            }
          } else {
            newPath = oldPath
          }
        }

        const { error: updateConversionError } = await adminSupabase
          .from('conversions')
          .update({ user_id: targetUserId, output_path: newPath ?? conversion.output_path })
          .eq('id', conversion.id)

        if (updateConversionError) {
          console.error('Error reassigning conversion:', updateConversionError)
        } else {
          mergedConversions += 1
        }
      }
    }

    await adminSupabase.from('account_merge_tokens').delete().eq('user_id', sourceUserId)
    await adminSupabase.from('account_merge_tokens').delete().eq('user_id', targetUserId)
    await adminSupabase.from('account_merge_tokens').delete().eq('code_hash', codeHash)

    await adminSupabase.auth.admin.deleteUser(sourceUserId)

    return NextResponse.json({
      success: true,
      mergedUploads,
      mergedConversions
    })
  } catch (error: any) {
    console.error('Error using merge code:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
