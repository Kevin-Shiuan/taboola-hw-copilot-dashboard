import type { Message } from "../types";
import { useChatActions, useMessages } from "../chat/ChatProvider";

interface ItemProps {
  message: Message;
}

export function MessageItem({ message }: ItemProps) {
  const { regenerate } = useChatActions();

  return (
    <div className={"msg msg-" + message.role}>
      <div className="msg-content">
        {message.content}
        {message.streaming && <span className="cursor">▍</span>}
      </div>
      {message.role === "assistant" && !message.streaming && (
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
  );
}

export function MessageList() {
  const messages = useMessages();

  return (
    <div className="messages">
      {messages.length === 0 && (
        <div className="empty-chat">Ask the copilot about your tickets.</div>
      )}
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
    </div>
  );
}
