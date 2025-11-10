import { createClient } from './client'
import type { Upload, Conversion } from '@/types/database'

export async function getUserUploads(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Upload[]
}

export async function getUserConversions(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversions')
    .select('*, uploads(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Conversion[]
}

export async function getStorageStats(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('uploads')
    .select('file_size')
    .eq('user_id', userId)
  
  if (error) throw error
  
  const totalSize = data.reduce((sum, upload) => sum + (upload.file_size || 0), 0)
  const fileCount = data.length
  
  const { data: conversions } = await supabase
    .from('conversions')
    .select('output_size')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('output_size', 'is', null)
  
  const conversionSize = conversions?.reduce((sum, conv) => sum + (conv.output_size || 0), 0) || 0
  
  return {
    totalSize: totalSize + conversionSize,
    fileCount,
    conversionCount: conversions?.length || 0
  }
}

export async function createUpload(upload: Omit<Upload, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('uploads')
    .insert(upload)
    .select()
    .single()
  
  if (error) throw error
  return data as Upload
}

export async function createConversion(conversion: Omit<Conversion, 'id' | 'created_at' | 'completed_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversions')
    .insert(conversion)
    .select()
    .single()
  
  if (error) throw error
  return data as Conversion
}

export async function updateConversion(id: string, updates: Partial<Conversion>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Conversion
}

export async function updateUpload(id: string, userId: string, updates: Partial<Upload>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('uploads')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Upload
}

export async function deleteUpload(id: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('uploads')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw error
}

