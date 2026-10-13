import { describe, it, expect } from 'vitest'
import type { Attachment } from '../types'
import { formatBytes, ulidToDate, attachmentPreviewText } from './format'

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
// Независимый кодировщик timestamp в первые 10 символов ULID (для round-trip).
function encodeTime(ms: number): string {
  let out = ''
  let n = ms
  for (let i = 0; i < 10; i++) {
    out = CROCKFORD[n % 32] + out
    n = Math.floor(n / 32)
  }
  return out
}

describe('formatBytes', () => {
  it('байты ниже 1 КБ — целое число с «Б»', () => {
    expect(formatBytes(0)).toBe('0 Б')
    expect(formatBytes(1)).toBe('1 Б')
    expect(formatBytes(1023)).toBe('1023 Б')
  })

  it('граница 1024 → КБ', () => {
    expect(formatBytes(1024)).toBe('1.0 КБ')
    expect(formatBytes(1536)).toBe('1.5 КБ')
    expect(formatBytes(1024 * 1024 - 1)).toBe('1024.0 КБ')
  })

  it('граница 1 МБ → МБ', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 МБ')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 МБ')
  })

  it('граница 1 ГБ → ГБ', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 ГБ')
    expect(formatBytes(3.5 * 1024 * 1024 * 1024)).toBe('3.5 ГБ')
  })
})

describe('ulidToDate', () => {
  it('нулевой timestamp → эпоха 1970', () => {
    expect(ulidToDate('0000000000ABCDEFGHJKMNPQRS').getTime()).toBe(0)
  })

  it('round-trip: декодирует закодированный timestamp', () => {
    for (const ms of [0, 1, 1700000000000, 1469918176385]) {
      const id = encodeTime(ms) + '0000000000000000'
      expect(ulidToDate(id).getTime()).toBe(ms)
    }
  })

  it('регистронезависим (lowercase ULID)', () => {
    const ms = 1700000000000
    const id = (encodeTime(ms) + '0000000000000000').toLowerCase()
    expect(ulidToDate(id).getTime()).toBe(ms)
  })

  it('использует только первые 10 символов', () => {
    const prefix = encodeTime(1700000000000)
    expect(ulidToDate(prefix + 'ZZZZZZZZZZZZZZZZ').getTime()).toBe(1700000000000)
    expect(ulidToDate(prefix + '0000000000000000').getTime()).toBe(1700000000000)
  })
})

describe('attachmentPreviewText', () => {
  const make = (content_type: string): Attachment => ({
    _id: 'x', tag: 'attachments', filename: 'f', content_type,
  })

  it('image/* → «Изображение»', () => {
    expect(attachmentPreviewText(make('image/png'))).toBe('Изображение')
    expect(attachmentPreviewText(make('image/gif'))).toBe('Изображение')
  })

  it('video/* → «Видео»', () => {
    expect(attachmentPreviewText(make('video/mp4'))).toBe('Видео')
  })

  it('прочее → «Файл»', () => {
    expect(attachmentPreviewText(make('application/pdf'))).toBe('Файл')
    expect(attachmentPreviewText(make('text/plain'))).toBe('Файл')
  })
})
