// Раскладка отправки сообщений в композере.
//   'enter'      — Enter отправляет, Shift+Enter переносит строку (default).
//   'ctrl-enter' — Enter переносит строку, Ctrl+Enter (или Cmd+Enter) отправляет.
// Применяется и к основному композеру, и к edit-textarea.

const KEY = 'webchatDemoSubmitMode'

export type ComposerSubmitMode = 'enter' | 'ctrl-enter'

export function loadComposerSubmitMode(): ComposerSubmitMode {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'ctrl-enter' || v === 'enter') return v
  } catch {}
  return 'enter'
}

export function saveComposerSubmitMode(mode: ComposerSubmitMode) {
  try { localStorage.setItem(KEY, mode) } catch {}
}

// Возвращает true, если данный keydown должен отправить сообщение.
// Если возвращает false — оставляем дефолтное поведение textarea (перенос строки).
export function shouldSubmit(e: KeyboardEvent | React.KeyboardEvent, mode: ComposerSubmitMode): boolean {
  if (e.key !== 'Enter') return false
  if (mode === 'enter') return !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey
  // ctrl-enter
  return (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey
}
