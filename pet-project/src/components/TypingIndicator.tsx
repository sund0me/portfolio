interface Props {
  typingIds: string[]
  currentUserId: string
  userIdMap: Record<string, string>
  colorMap: Record<string, string>
}

export default function TypingIndicator({ typingIds, currentUserId, userIdMap, colorMap }: Props) {
  const named = typingIds
    .filter(id => id !== currentUserId)
    .map(id => ({ id, name: userIdMap[id] }))
    .filter((x): x is { id: string; name: string } => !!x.name)
  if (named.length === 0) return null

  const nameSpan = (n: string, i: number) => (
    <span key={i} style={{ color: colorMap[n] ?? undefined, fontWeight: 500 }}>{n}</span>
  )

  let body: React.ReactNode
  let verb: string
  if (named.length === 1) {
    body = nameSpan(named[0].name, 0)
    verb = ' печатает'
  } else if (named.length === 2) {
    body = <>{nameSpan(named[0].name, 0)}<span> и </span>{nameSpan(named[1].name, 1)}</>
    verb = ' печатают'
  } else if (named.length === 3) {
    body = <>{nameSpan(named[0].name, 0)}<span>, </span>{nameSpan(named[1].name, 1)}<span> и </span>{nameSpan(named[2].name, 2)}</>
    verb = ' печатают'
  } else {
    body = <>{nameSpan(named[0].name, 0)}<span>, </span>{nameSpan(named[1].name, 1)}<span> и ещё {named.length - 2}</span></>
    verb = ' печатают'
  }

  return (
    <div className="typing">
      {body}
      {verb}
      <span className="typing-dots"><span /><span /><span /></span>
    </div>
  )
}
