export const FILE_FORMATS = [
  { ext: 'jpg', name: 'JPEG Image', category: 'image', mime: 'image/jpeg' },
  { ext: 'jpeg', name: 'JPEG Image', category: 'image', mime: 'image/jpeg' },
  { ext: 'png', name: 'PNG Image', category: 'image', mime: 'image/png' },
  { ext: 'gif', name: 'GIF Image', category: 'image', mime: 'image/gif' },
  { ext: 'webp', name: 'WebP Image', category: 'image', mime: 'image/webp' },
  { ext: 'svg', name: 'SVG Image', category: 'image', mime: 'image/svg+xml' },
  { ext: 'bmp', name: 'BMP Image', category: 'image', mime: 'image/bmp' },
  { ext: 'ico', name: 'ICO Image', category: 'image', mime: 'image/x-icon' },
  { ext: 'tiff', name: 'TIFF Image', category: 'image', mime: 'image/tiff' },
  { ext: 'pdf', name: 'PDF Document', category: 'document', mime: 'application/pdf' },
  { ext: 'doc', name: 'Word Document', category: 'document', mime: 'application/msword' },
  { ext: 'docx', name: 'Word Document', category: 'document', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { ext: 'xls', name: 'Excel Spreadsheet', category: 'document', mime: 'application/vnd.ms-excel' },
  { ext: 'xlsx', name: 'Excel Spreadsheet', category: 'document', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { ext: 'ppt', name: 'PowerPoint Presentation', category: 'document', mime: 'application/vnd.ms-powerpoint' },
  { ext: 'pptx', name: 'PowerPoint Presentation', category: 'document', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { ext: 'txt', name: 'Text File', category: 'document', mime: 'text/plain' },
  { ext: 'rtf', name: 'Rich Text Format', category: 'document', mime: 'application/rtf' },
  { ext: 'odt', name: 'OpenDocument Text', category: 'document', mime: 'application/vnd.oasis.opendocument.text' },
  { ext: 'mp4', name: 'MP4 Video', category: 'video', mime: 'video/mp4' },
  { ext: 'avi', name: 'AVI Video', category: 'video', mime: 'video/x-msvideo' },
  { ext: 'mov', name: 'QuickTime Video', category: 'video', mime: 'video/quicktime' },
  { ext: 'wmv', name: 'Windows Media Video', category: 'video', mime: 'video/x-ms-wmv' },
  { ext: 'flv', name: 'Flash Video', category: 'video', mime: 'video/x-flv' },
  { ext: 'webm', name: 'WebM Video', category: 'video', mime: 'video/webm' },
  { ext: 'mp3', name: 'MP3 Audio', category: 'audio', mime: 'audio/mpeg' },
  { ext: 'wav', name: 'WAV Audio', category: 'audio', mime: 'audio/wav' },
  { ext: 'ogg', name: 'OGG Audio', category: 'audio', mime: 'audio/ogg' },
  { ext: 'flac', name: 'FLAC Audio', category: 'audio', mime: 'audio/flac' },
  { ext: 'aac', name: 'AAC Audio', category: 'audio', mime: 'audio/aac' },
  { ext: 'zip', name: 'ZIP Archive', category: 'archive', mime: 'application/zip' },
  { ext: 'rar', name: 'RAR Archive', category: 'archive', mime: 'application/x-rar-compressed' },
  { ext: '7z', name: '7-Zip Archive', category: 'archive', mime: 'application/x-7z-compressed' },
  { ext: 'tar', name: 'TAR Archive', category: 'archive', mime: 'application/x-tar' },
  { ext: 'gz', name: 'GZIP Archive', category: 'archive', mime: 'application/gzip' },
]

export function getFormatByExt(ext: string) {
  return FILE_FORMATS.find(f => f.ext.toLowerCase() === ext.toLowerCase())
}

export function getFormatsByCategory(category: string) {
  return FILE_FORMATS.filter(f => f.category === category)
}

export function searchFormats(query: string) {
  const lowerQuery = query.toLowerCase()
  return FILE_FORMATS.filter(f => 
    f.ext.toLowerCase().includes(lowerQuery) || 
    f.name.toLowerCase().includes(lowerQuery)
  )
}

