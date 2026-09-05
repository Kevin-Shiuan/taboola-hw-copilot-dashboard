import type { Message } from "../types";

interface ItemProps {
  message: Message;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
}

export function MessageItem({ message, onCopy, onRegenerate }: ItemProps) {
  return (
    <div className={"msg msg-" + message.role}>
      <div className="msg-content">
        {message.content}
        {message.streaming && <span className="cursor">▍</span>}
      </div>
      {message.role === "assistant" && !message.streaming && (
        <div className="msg-actions">
          <span className="icon-btn" onClick={() => onCopy(message.content)}>
            ⧉
          </span>
          <span className="icon-btn" onClick={onRegenerate}>
            ↻
          </span>
        </div>
      )}
    </div>
  );
}

interface ListProps {
  messages: Message[];
  onRegenerate: () => void;
}

export function MessageList({ messages, onRegenerate }: ListProps) {
  return (
    <div className="messages">
      {messages.length === 0 && (
        <div className="empty-chat">Ask the copilot about your tickets.</div>
      )}
      {messages.map((m) => (
        <MessageItem
          key={m.id}
          message={m}
          onCopy={(text) => navigator.clipboard.writeText(text)}
          onRegenerate={onRegenerate}
        />
      ))}
    </div>
  );
}
