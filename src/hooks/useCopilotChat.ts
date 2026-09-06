import { useState } from "react";
import type { Message } from "../types";
import { streamReply } from "../agent/mockAgent";

let nextId = 1;
function makeId(): string {
  return "m" + nextId++;
}

export function useCopilotChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  function startStream(prompt: string, assistantId: string) {
    streamReply(prompt, {
      onToken: (token) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m))
        ),
      onDone: () =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
        ),
    });
  }

  function sendMessage(text: string) {
    const userMsg: Message = { id: makeId(), role: "user", content: text, streaming: false };
    const assistantMsg: Message = { id: makeId(), role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    startStream(text, assistantMsg.id);
  }

  function regenerate(assistantId: string) {
    const idx = messages.findIndex((m) => m.id === assistantId);
    if (idx === -1) return;
    const prompt = messages.slice(0, idx).reverse().find((m) => m.role === "user");
    if (!prompt) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, content: "", streaming: true } : m))
    );
    startStream(prompt.content, assistantId);
  }

  return { messages, sendMessage, regenerate };
}
