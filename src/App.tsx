import { ChatProvider } from "./chat/ChatProvider";
import { TicketsPanel } from "./components/TicketsPanel";
import { CopilotSidebar } from "./components/CopilotSidebar";
import { WordCountStat } from "./components/WordCountStat";

export default function App() {
  return (
    <div className="app">
      <ChatProvider>
        <header className="app-header">
          <h1>Support Copilot</h1>
          <WordCountStat />
        </header>
        <div className="layout">
          <TicketsPanel />
          <CopilotSidebar />
        </div>
      </ChatProvider>
    </div>
  );
}
