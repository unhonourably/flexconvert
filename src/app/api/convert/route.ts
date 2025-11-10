import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { validateConversion } from '@/lib/conversion-validation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversionId, uploadId, targetFormat } = await request.json()

    if (!conversionId || !uploadId || !targetFormat) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const { data: upload, error: uploadFetchError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single()

    if (uploadFetchError || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(upload.storage_path)

    if (downloadError || !fileData) {
      await supabase
        .from('conversions')
        .update({ status: 'failed', error_message: 'Failed to download original file' })
        .eq('id', conversionId)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const fileExt = upload.original_filename.split('.').pop()?.toLowerCase() || ''
    
    // Validate conversion
    const validation = validateConversion(fileExt, targetFormat)
    if (!validation.isValid) {
      await supabase
        .from('conversions')
        .update({ status: 'failed', error_message: validation.error || 'Invalid conversion' })
        .eq('id', conversionId)
      return NextResponse.json({ error: validation.error || 'Invalid conversion' }, { status: 400 })
    }
    
    let convertedBuffer: Buffer | null = null
    let outputMime = 'application/octet-stream'

    // Image to Image conversions (using Sharp)
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'avif', 'heif', 'ico']
    
    if (imageFormats.includes(fileExt) && imageFormats.includes(targetFormat)) {
      try {
        let image = sharp(buffer)

        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
          convertedBuffer = await image.jpeg({ quality: 90 }).toBuffer()
          outputMime = 'image/jpeg'
        } else if (targetFormat === 'png') {
          convertedBuffer = await image.png().toBuffer()
          outputMime = 'image/png'
        } else if (targetFormat === 'webp') {
          convertedBuffer = await image.webp({ quality: 90 }).toBuffer()
          outputMime = 'image/webp'
        } else if (targetFormat === 'gif') {
          const metadata = await image.metadata()
          if (metadata.pages && metadata.pages > 1) {
            convertedBuffer = await image.gif().toBuffer()
          } else {
            convertedBuffer = await image.png().toBuffer()
          }
          outputMime = 'image/gif'
        } else if (targetFormat === 'tiff') {
          convertedBuffer = await image.tiff({ compression: 'lzw' }).toBuffer()
          outputMime = 'image/tiff'
        } else if (targetFormat === 'avif') {
          convertedBuffer = await image.avif({ quality: 90 }).toBuffer()
          outputMime = 'image/avif'
        } else if (targetFormat === 'heif') {
          convertedBuffer = await image.heif({ quality: 90 }).toBuffer()
          outputMime = 'image/heif'
        } else if (targetFormat === 'ico') {
          // ICO files are typically multi-size, but we'll create a single size
          convertedBuffer = await image.png().resize(256, 256, { fit: 'contain' }).toBuffer()
          outputMime = 'image/x-icon'
        } else if (targetFormat === 'bmp') {
          convertedBuffer = await image.png().toBuffer()
          outputMime = 'image/bmp'
        } else {
          throw new Error('Unsupported target format')
        }
      } catch (error: any) {
        console.error('Image conversion error:', error)
        await supabase
          .from('conversions')
          .update({ status: 'failed', error_message: error.message || 'Image conversion failed' })
          .eq('id', conversionId)
        return NextResponse.json({ error: error.message || 'Conversion failed' }, { status: 500 })
      }
    } else {
      // For non-image conversions, we'll need additional libraries
      // For now, return a helpful error message
      await supabase
        .from('conversions')
        .update({ 
          status: 'failed', 
          error_message: `Conversion from ${fileExt} to ${targetFormat} requires additional processing libraries. This feature is coming soon!` 
        })
        .eq('id', conversionId)
      return NextResponse.json({ 
        error: `Conversion from ${fileExt} to ${targetFormat} requires additional processing libraries. This feature is coming soon!` 
      }, { status: 400 })
    }

    if (!convertedBuffer) {
      await supabase
        .from('conversions')
        .update({ status: 'failed', error_message: 'Conversion produced no output' })
        .eq('id', conversionId)
      return NextResponse.json({ error: 'Conversion failed' }, { status: 500 })
    }

    const outputPath = `${user.id}/converted/${Date.now()}.${targetFormat}`
    const { error: storageUploadError } = await supabase.storage
      .from('uploads')
      .upload(outputPath, convertedBuffer, {
        contentType: outputMime,
        upsert: false
      })

    if (storageUploadError) {
      await supabase
        .from('conversions')
        .update({ status: 'failed', error_message: 'Failed to upload converted file' })
        .eq('id', conversionId)
      return NextResponse.json({ error: 'Failed to save converted file' }, { status: 500 })
    }

    await supabase
      .from('conversions')
      .update({
        status: 'completed',
        output_path: outputPath,
        output_size: convertedBuffer.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', conversionId)

    return NextResponse.json({ 
      success: true, 
      outputPath,
      outputSize: convertedBuffer.length 
    })
  } catch (error: any) {
    console.error('Conversion error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

