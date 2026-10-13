import { useState } from 'react'
import { getChannelGroups } from './lib/channelOrder'
import { loadComposerSubmitMode, saveComposerSubmitMode, shouldSubmit, type ComposerSubmitMode } from './lib/composerSubmitMode'
import TypingIndicator from './components/TypingIndicator'

const channels = [
  { id: 'demo-general', name: 'Общий' },
  { id: 'demo-development', name: 'Разработка' },
  { id: 'demo-ideas', name: 'Идеи' },
]
const groups = getChannelGroups(channels.map(channel => channel.id), [
  { id: 'demo-category', title: 'Проект', channels: ['demo-development', 'demo-ideas'] },
])
interface DemoMessage { id: string; author: string; text: string }
const initialMessages: Record<string, DemoMessage[]> = {
  'demo-general': [{ id: 'demo-message-1', author: 'Участник 1', text: 'Добро пожаловать в локальную демонстрацию WebChat.' }],
  'demo-development': [{ id: 'demo-message-2', author: 'Участник 2', text: 'Здесь можно проверить отправку сообщений и переключение каналов.' }],
  'demo-ideas': [],
}

export default function App() {
  const [active, setActive] = useState(channels[0].id)
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [submitMode, setSubmitMode] = useState<ComposerSubmitMode>(loadComposerSubmitMode)
  const [showTyping, setShowTyping] = useState(false)
  const activeChannel = channels.find(channel => channel.id === active)!

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMessages(current => ({ ...current, [active]: [
      ...current[active], { id: crypto.randomUUID(), author: 'Вы', text },
    ] }))
    setDraft('')
  }

  return <div className="chat-demo">
    <header className="demo-header">
      <strong>WebChat</strong><span>Локальная демонстрация</span>
      <p>Вымышленные данные. Сообщения остаются в памяти этой вкладки и исчезают при обновлении.</p>
    </header>
    <div className="chat-layout">
      <nav className="channels" aria-label="Каналы">
        {groups.map(group => <section key={group.id}>
          {group.title && <h2>{group.title}</h2>}
          {group.channelIds.map(id => <button key={id} type="button" aria-pressed={active === id}
            onClick={() => { setActive(id); setDraft('') }}>
            # {channels.find(channel => channel.id === id)!.name}
          </button>)}
        </section>)}
      </nav>
      <main className="conversation">
        <h1># {activeChannel.name}</h1>
        <div className="messages" role="log" aria-label="Сообщения" aria-live="polite">
          {messages[active].length === 0 && <p className="empty">В этом канале пока нет сообщений.</p>}
          {messages[active].map(message => <article className="message" key={message.id}>
            <strong>{message.author}</strong><p>{message.text}</p>
          </article>)}
        </div>
        <div className="typing-area">
          <TypingIndicator typingIds={showTyping ? ['demo-user'] : []} currentUserId="demo-current"
            userIdMap={{ 'demo-user': 'Участник 2' }} colorMap={{}} />
        </div>
        <form className="composer" onSubmit={event => { event.preventDefault(); send() }}>
          <label htmlFor="message">Сообщение</label>
          <textarea id="message" value={draft} onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (!event.nativeEvent.isComposing && shouldSubmit(event, submitMode)) {
                event.preventDefault(); send()
              }
            }} />
          <div className="composer-controls">
            <label>Отправка
              <select value={submitMode} onChange={event => {
                const mode = event.target.value as ComposerSubmitMode
                setSubmitMode(mode); saveComposerSubmitMode(mode)
              }}><option value="enter">Enter</option><option value="ctrl-enter">Ctrl / Cmd + Enter</option></select>
            </label>
            <button type="submit" disabled={!draft.trim()}>Отправить</button>
          </div>
          <label className="typing-toggle"><input type="checkbox" checked={showTyping}
            onChange={event => setShowTyping(event.target.checked)} />Показать демонстрационный индикатор набора</label>
        </form>
      </main>
    </div>
  </div>
}
