import { useMessages } from '../chat/ChatProvider'

// Header stat: total words the copilot has produced so far.
export function WordCountStat() {
  const messages = useMessages()
  let assistantWords = 0
  for (const m of messages) {
    if (m.role === 'assistant') {
      assistantWords += m.content.split(' ').filter((w) => w.length > 0).length
    }
  }
  return <span className="stat">{assistantWords} words generated</span>
}
