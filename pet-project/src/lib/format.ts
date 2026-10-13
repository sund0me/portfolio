import type { Attachment } from '../types'

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} Б`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} МБ`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} ГБ`
}

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

// Извлекает встроенный timestamp из ULID (первые 10 символов = ms с 1970).
export function ulidToDate(id: string): Date {
  let ms = 0
  for (const c of id.slice(0, 10).toUpperCase()) ms = ms * 32 + CROCKFORD.indexOf(c)
  return new Date(ms)
}

// Текст для reply-preview / сидeбарных уведомлений когда есть только attachment.
export function attachmentPreviewText(a: Attachment): string {
  if (a.content_type.startsWith('image/')) return 'Изображение'
  if (a.content_type.startsWith('video/')) return 'Видео'
  return 'Файл'
}
