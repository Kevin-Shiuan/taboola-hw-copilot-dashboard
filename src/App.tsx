import { TICKETS } from "./data/tickets";
import { useCopilotChat } from "./hooks/useCopilotChat";
import { TicketsPanel } from "./components/TicketsPanel";
import { CopilotSidebar } from "./components/CopilotSidebar";

export default function App() {
  const { messages, sendMessage, regenerate } = useCopilotChat();

  // Header stat: total words the copilot has produced so far.
  // Recomputed on every render by scanning every message.
  let assistantWords = 0;
  for (const m of messages) {
    if (m.role === "assistant") {
      assistantWords += m.content.split(" ").filter((w) => w.length > 0).length;
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Support Copilot</h1>
        <span className="stat">{assistantWords} words generated</span>
      </header>
      <div className="layout">
        <TicketsPanel tickets={TICKETS} onPick={(text) => sendMessage(text)} />
        <CopilotSidebar
          messages={messages}
          onSend={sendMessage}
          onRegenerate={regenerate}
        />
      </div>
    </div>
  );
}
