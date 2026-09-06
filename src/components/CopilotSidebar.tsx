import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function CopilotSidebar() {
  return (
    <div className="copilot">
      <div className="copilot-header">
        <span className="copilot-title">Support Copilot</span>
      </div>
      <MessageList />
      <ChatInput />
    </div>
  );
}
