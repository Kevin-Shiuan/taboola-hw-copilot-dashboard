import { memo, useEffect, useRef } from 'react'
import type { Message } from '../types'
import { useChatActions, useMessages } from '../chat/ChatProvider'

interface ItemProps {
  message: Message
}

const MessageItemBase = ({ message }: ItemProps) => {
  const { regenerate } = useChatActions()

  return (
    <div className={'msg msg-' + message.role}>
      <div className="msg-content">
        {message.content}
        {message.streaming && <span className="cursor">▍</span>}
      </div>
      {message.role === 'assistant' && !message.streaming && (
        <div className="msg-actions">
          <span className="icon-btn" onClick={() => navigator.clipboard.writeText(message.content)}>
            ⧉
          </span>
          <span className="icon-btn" onClick={() => regenerate(message.id)}>
            ↻
          </span>
        </div>
      )}
    </div>
  )
}

const MessageItem = memo(MessageItemBase)

export function MessageList() {
  const messages = useMessages()
  const listRef = useRef<HTMLDivElement>(null)
  const previousCount = useRef(0)

  // Following a streaming reply is handled by CSS scroll anchoring (see
  // .scroll-anchor). JS only pulls the view down when a new turn is added,
  // since the anchor cannot do that while the user is scrolled up.
  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const newTurnAdded = messages.length > previousCount.current
    previousCount.current = messages.length
    if (newTurnAdded) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  return (
    <div className="messages" ref={listRef}>
      {messages.length === 0 && <div className="empty-chat">Ask the copilot about your tickets.</div>}
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
      <div className="scroll-anchor" aria-hidden />
    </div>
  )
}
