import { FILE_FORMATS, getFormatByExt } from './file-formats'

export type ConversionValidation = {
  isValid: boolean
  error?: string
}

const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'avif', 'heif']
const VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
const AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'wma']
const DOCUMENT_FORMATS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt']
const ARCHIVE_FORMATS = ['zip', 'rar', '7z', 'tar', 'gz']

export function validateConversion(sourceExt: string, targetExt: string): ConversionValidation {
  const sourceFormat = getFormatByExt(sourceExt)
  const targetFormat = getFormatByExt(targetExt)

  if (!sourceFormat || !targetFormat) {
    return {
      isValid: false,
      error: 'Invalid file format'
    }
  }

  // Same format
  if (sourceExt.toLowerCase() === targetExt.toLowerCase()) {
    return {
      isValid: false,
      error: 'Source and target formats are the same'
    }
  }

  // Image to Image - always valid
  if (IMAGE_FORMATS.includes(sourceExt.toLowerCase()) && IMAGE_FORMATS.includes(targetExt.toLowerCase())) {
    return { isValid: true }
  }

  // Video to GIF - allowed exception
  if (VIDEO_FORMATS.includes(sourceExt.toLowerCase()) && targetExt.toLowerCase() === 'gif') {
    return { isValid: true }
  }

  // GIF to Video - allowed exception
  if (sourceExt.toLowerCase() === 'gif' && VIDEO_FORMATS.includes(targetExt.toLowerCase())) {
    return { isValid: true }
  }

  // Video to Video - valid
  if (VIDEO_FORMATS.includes(sourceExt.toLowerCase()) && VIDEO_FORMATS.includes(targetExt.toLowerCase())) {
    return { isValid: true }
  }

  // Audio to Audio - valid
  if (AUDIO_FORMATS.includes(sourceExt.toLowerCase()) && AUDIO_FORMATS.includes(targetExt.toLowerCase())) {
    return { isValid: true }
  }

  // Document to Document - valid (some combinations)
  if (DOCUMENT_FORMATS.includes(sourceExt.toLowerCase()) && DOCUMENT_FORMATS.includes(targetExt.toLowerCase())) {
    // PDF can be converted from/to most document formats
    if (sourceExt.toLowerCase() === 'pdf' || targetExt.toLowerCase() === 'pdf') {
      return { isValid: true }
    }
    // Text-based formats can convert between each other
    if (['txt', 'rtf', 'odt'].includes(sourceExt.toLowerCase()) && 
        ['txt', 'rtf', 'odt'].includes(targetExt.toLowerCase())) {
      return { isValid: true }
    }
    // Office formats can convert between each other (same type)
    const officeTypes = {
      'doc': 'word',
      'docx': 'word',
      'xls': 'excel',
      'xlsx': 'excel',
      'ppt': 'powerpoint',
      'pptx': 'powerpoint'
    }
    const sourceType = officeTypes[sourceExt.toLowerCase() as keyof typeof officeTypes]
    const targetType = officeTypes[targetExt.toLowerCase() as keyof typeof officeTypes]
    if (sourceType && targetType && sourceType === targetType) {
      return { isValid: true }
    }
  }

  // Archive to Archive - not typically converted, but could be valid
  if (ARCHIVE_FORMATS.includes(sourceExt.toLowerCase()) && ARCHIVE_FORMATS.includes(targetExt.toLowerCase())) {
    return {
      isValid: false,
      error: 'Archive format conversion is not supported'
    }
  }

  // Invalid cross-category conversions
  return {
    isValid: false,
    error: `Cannot convert ${sourceFormat.category} files to ${targetFormat.category} format. ${getConversionHint(sourceExt, targetExt)}`
  }
}

function getConversionHint(sourceExt: string, targetExt: string): string {
  const sourceFormat = getFormatByExt(sourceExt)
  const targetFormat = getFormatByExt(targetExt)
  
  if (!sourceFormat || !targetFormat) return ''
  
  if (sourceFormat.category === 'video' && targetFormat.category === 'image') {
    return 'Note: Video to GIF conversion is supported.'
  }
  if (sourceFormat.category === 'image' && targetFormat.category === 'video') {
    return 'Note: GIF to video conversion is supported.'
  }
  
  return ''
}

export function getSupportedTargetFormats(sourceExt: string): string[] {
  const sourceFormat = getFormatByExt(sourceExt)
  if (!sourceFormat) return []

  const ext = sourceExt.toLowerCase()

  if (IMAGE_FORMATS.includes(ext)) {
    // All image formats except the source
    return IMAGE_FORMATS.filter(f => f !== ext)
  }

  if (VIDEO_FORMATS.includes(ext)) {
    // All video formats + GIF
    return [...VIDEO_FORMATS.filter(f => f !== ext), 'gif']
  }

  if (ext === 'gif') {
    // GIF can convert to all images and videos
    return [...IMAGE_FORMATS.filter(f => f !== 'gif'), ...VIDEO_FORMATS]
  }

  if (AUDIO_FORMATS.includes(ext)) {
    return AUDIO_FORMATS.filter(f => f !== ext)
  }

  if (DOCUMENT_FORMATS.includes(ext)) {
    // PDF and compatible formats
    if (ext === 'pdf') {
      return DOCUMENT_FORMATS.filter(f => f !== 'pdf')
    }
    // Text formats
    if (['txt', 'rtf', 'odt'].includes(ext)) {
      return ['txt', 'rtf', 'odt', 'pdf'].filter(f => f !== ext)
    }
    // Office formats - same type
    const officeMap: { [key: string]: string[] } = {
      'doc': ['docx', 'pdf', 'txt', 'rtf'],
      'docx': ['doc', 'pdf', 'txt', 'rtf'],
      'xls': ['xlsx', 'pdf', 'csv'],
      'xlsx': ['xls', 'pdf', 'csv'],
      'ppt': ['pptx', 'pdf'],
      'pptx': ['ppt', 'pdf']
    }
    return officeMap[ext] || []
  }

  return []
}

