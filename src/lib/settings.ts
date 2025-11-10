export type UploadSettings = {
  downloadOnCompletion: boolean
  defaultOutputFormat: string | null
  autoDeleteOriginal: boolean
  maxFileSize: number | null
  notificationOnCompletion: boolean
  compressionQuality: number
  preserveMetadata: boolean
}

const DEFAULT_SETTINGS: UploadSettings = {
  downloadOnCompletion: false,
  defaultOutputFormat: null,
  autoDeleteOriginal: false,
  maxFileSize: null,
  notificationOnCompletion: true,
  compressionQuality: 90,
  preserveMetadata: true,
}

const SETTINGS_KEY = 'flexconvert_upload_settings'

export function getUploadSettings(): UploadSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
  
  return DEFAULT_SETTINGS
}

export function saveUploadSettings(settings: Partial<UploadSettings>) {
  if (typeof window === 'undefined') return
  
  try {
    const current = getUploadSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

export function resetUploadSettings() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(SETTINGS_KEY)
  } catch (error) {
    console.error('Error resetting settings:', error)
  }
}

