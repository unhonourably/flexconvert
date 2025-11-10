export type Upload = {
  id: string
  user_id: string
  original_filename: string
  file_size: number
  file_type: string
  storage_path: string
  created_at: string
  updated_at: string
}

export type Conversion = {
  id: string
  upload_id: string
  user_id: string
  original_format: string
  target_format: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  output_path: string | null
  output_size: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

