import type { Message } from "../types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface Props {
  messages: Message[];
  onSend: (text: string) => void;
  onRegenerate: (assistantId: string) => void;
}

export function CopilotSidebar({ messages, onSend, onRegenerate }: Props) {
  return (
    <div className="copilot">
      <div className="copilot-header">
        <span className="copilot-title">Support Copilot</span>
      </div>
      <MessageList messages={messages} onRegenerate={onRegenerate} />
      <ChatInput onSend={onSend} />
    </div>
  );
}
