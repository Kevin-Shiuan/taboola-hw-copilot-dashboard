import { useEffect, useRef } from "react";
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

// How close to the bottom (px) the user must be for new content to keep the
// list pinned to the bottom. Further up than this means they are reading
// history, and we leave their scroll position alone.
const STICK_TO_BOTTOM_THRESHOLD_PX = 32;

export function MessageList() {
  const messages = useMessages();
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const previousCount = useRef(0);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distanceFromBottom <= STICK_TO_BOTTOM_THRESHOLD_PX;
  }

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    // A new turn always jumps to the bottom, even if the user had scrolled up;
    // streamed tokens only follow if they were already at the bottom.
    const newTurnAdded = messages.length > previousCount.current;
    previousCount.current = messages.length;
    if (newTurnAdded) stickToBottom.current = true;
    if (stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="messages" ref={listRef} onScroll={handleScroll}>
      {messages.length === 0 && (
        <div className="empty-chat">Ask the copilot about your tickets.</div>
      )}
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
    </div>
  );
}
