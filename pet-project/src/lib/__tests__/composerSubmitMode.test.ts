import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  shouldSubmit,
  loadComposerSubmitMode,
  saveComposerSubmitMode,
  type ComposerSubmitMode,
} from '../composerSubmitMode'

// shouldSubmit принимает KeyboardEvent-подобный объект; собираем минимальный
// стаб с нужными модификаторами.
function key(
  k: string,
  mods: Partial<Pick<KeyboardEvent, 'shiftKey' | 'ctrlKey' | 'metaKey' | 'altKey'>> = {},
): KeyboardEvent {
  return {
    key: k,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...mods,
  } as KeyboardEvent
}

describe('shouldSubmit — режим enter', () => {
  const mode: ComposerSubmitMode = 'enter'

  it('голый Enter отправляет', () => {
    expect(shouldSubmit(key('Enter'), mode)).toBe(true)
  })

  it('Shift+Enter переносит строку (не отправляет)', () => {
    expect(shouldSubmit(key('Enter', { shiftKey: true }), mode)).toBe(false)
  })

  it('Ctrl+Enter и Cmd+Enter не отправляют в режиме enter', () => {
    expect(shouldSubmit(key('Enter', { ctrlKey: true }), mode)).toBe(false)
    expect(shouldSubmit(key('Enter', { metaKey: true }), mode)).toBe(false)
  })

  it('Alt+Enter не отправляет', () => {
    expect(shouldSubmit(key('Enter', { altKey: true }), mode)).toBe(false)
  })

  it('не-Enter клавиша никогда не отправляет', () => {
    expect(shouldSubmit(key('a'), mode)).toBe(false)
    expect(shouldSubmit(key(' '), mode)).toBe(false)
  })
})

describe('shouldSubmit — режим ctrl-enter', () => {
  const mode: ComposerSubmitMode = 'ctrl-enter'

  it('голый Enter переносит строку (не отправляет)', () => {
    expect(shouldSubmit(key('Enter'), mode)).toBe(false)
  })

  it('Ctrl+Enter отправляет', () => {
    expect(shouldSubmit(key('Enter', { ctrlKey: true }), mode)).toBe(true)
  })

  it('Cmd+Enter (metaKey) отправляет — mac', () => {
    expect(shouldSubmit(key('Enter', { metaKey: true }), mode)).toBe(true)
  })

  it('Ctrl+Shift+Enter не отправляет', () => {
    expect(shouldSubmit(key('Enter', { ctrlKey: true, shiftKey: true }), mode)).toBe(false)
  })

  it('Ctrl+Alt+Enter не отправляет', () => {
    expect(shouldSubmit(key('Enter', { ctrlKey: true, altKey: true }), mode)).toBe(false)
  })
})

describe('load/save composer submit mode', () => {
  beforeEach(() => localStorage.clear())

  it('дефолт — enter, если ничего не сохранено', () => {
    expect(loadComposerSubmitMode()).toBe('enter')
  })

  it('round-trip ctrl-enter', () => {
    saveComposerSubmitMode('ctrl-enter')
    expect(loadComposerSubmitMode()).toBe('ctrl-enter')
  })

  it('мусорное значение в localStorage → дефолт enter', () => {
    localStorage.setItem('webchatDemoSubmitMode', 'garbage')
    expect(loadComposerSubmitMode()).toBe('enter')
  })

  it('load не падает при недоступном localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(loadComposerSubmitMode()).toBe('enter')
    spy.mockRestore()
  })
})
