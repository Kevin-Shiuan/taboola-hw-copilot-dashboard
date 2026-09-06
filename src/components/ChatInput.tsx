import { useRef } from 'react'
import { useChatActions } from '../chat/ChatProvider'

export function ChatInput() {
  const { sendMessage } = useChatActions()
  const ref = useRef<HTMLDivElement>(null)

  function submit() {
    const el = ref.current
    if (!el) {
      return
    }

    const text = el.innerText.trim()
    if (text.length === 0) {
      return
    }
    sendMessage(text)
    el.innerText = ''
  }

  return (
    <div className="chat-input">
      <div
        ref={ref}
        className="chat-input-box"
        contentEditable
        data-placeholder="Ask the copilot..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />
      <div className="send-btn" onClick={submit}>
        ➤
      </div>
    </div>
  )
}
