import { useState } from "react";
import type { Message } from "../types";
import { streamReply } from "../agent/mockAgent";

let nextId = 1;
function makeId(): string {
  return "m" + nextId++;
}

export function useCopilotChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  function sendMessage(text: string) {
    const userMsg: Message = { id: makeId(), role: "user", content: text, streaming: false };
    const assistantMsg: Message = { id: makeId(), role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    streamReply(text, {
      onToken: (token) => {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + token };
          return copy;
        });
      },
      onDone: () => {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, streaming: false };
          return copy;
        });
      },
    });
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    const assistantMsg: Message = { id: makeId(), role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    streamReply(lastUser.content, {
      onToken: (token) => {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + token };
          return copy;
        });
      },
      onDone: () => {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, streaming: false };
          return copy;
        });
      },
    });
  }

  return { messages, sendMessage, regenerate };
}
