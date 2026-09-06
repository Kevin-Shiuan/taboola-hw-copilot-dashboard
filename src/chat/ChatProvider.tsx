import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type { Message } from "../types";
import { streamReply } from "../agent/mockAgent";
import { makeId } from "../utils/makeId";

export interface ChatActions {
  sendMessage: (text: string) => void;
  regenerate: (assistantId: string) => void;
}

enum MessageUpdateType {
  AppendTurn = "APPEND_TURN",
  AppendToken = "APPEND_TOKEN",
  FinishStreaming = "FINISH_STREAMING",
  RestartStreaming = "RESTART_STREAMING",
}

type MessageUpdate =
  | { type: MessageUpdateType.AppendTurn; userId: string; assistantId: string; text: string }
  | { type: MessageUpdateType.AppendToken; assistantId: string; token: string }
  | { type: MessageUpdateType.FinishStreaming; assistantId: string }
  | { type: MessageUpdateType.RestartStreaming; assistantId: string };

// Every update that touches an existing message is keyed by id, so replies
// that overlap in time can never leak into each other's bubble.
function messagesReducer(messages: Message[], update: MessageUpdate): Message[] {
  switch (update.type) {
    case MessageUpdateType.AppendTurn:
      return [
        ...messages,
        { id: update.userId, role: "user", content: update.text, streaming: false },
        { id: update.assistantId, role: "assistant", content: "", streaming: true },
      ];
    case MessageUpdateType.AppendToken:
      return messages.map((m) =>
        m.id === update.assistantId ? { ...m, content: m.content + update.token } : m
      );
    case MessageUpdateType.FinishStreaming:
      return messages.map((m) => (m.id === update.assistantId ? { ...m, streaming: false } : m));
    case MessageUpdateType.RestartStreaming:
      return messages.map((m) =>
        m.id === update.assistantId ? { ...m, content: "", streaming: true } : m
      );
  }
}

// Messages and actions live in separate contexts so components that only
// send messages do not re-render on every streamed token.
const MessagesContext = createContext<Message[] | null>(null);
const ChatActionsContext = createContext<ChatActions | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, dispatch] = useReducer(messagesReducer, []);

  // Actions are created once, so they read the latest messages through a ref
  // instead of closing over a stale render.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const actions = useMemo<ChatActions>(() => {
    function startStream(prompt: string, assistantId: string) {
      streamReply(prompt, {
        onToken: (token) => dispatch({ type: MessageUpdateType.AppendToken, assistantId, token }),
        onDone: () => dispatch({ type: MessageUpdateType.FinishStreaming, assistantId }),
      });
    }

    function sendMessage(text: string) {
      const assistantId = makeId();
      dispatch({ type: MessageUpdateType.AppendTurn, userId: makeId(), assistantId, text });
      startStream(text, assistantId);
    }

    // Re-asks the user prompt that precedes the given assistant message and
    // streams the new answer into that same message.
    function regenerate(assistantId: string) {
      const current = messagesRef.current;
      const idx = current.findIndex((m) => m.id === assistantId);
      if (idx === -1) return;
      const prompt = current.slice(0, idx).reverse().find((m) => m.role === "user");
      if (!prompt) return;

      dispatch({ type: MessageUpdateType.RestartStreaming, assistantId });
      startStream(prompt.content, assistantId);
    }

    return { sendMessage, regenerate };
  }, []);

  return (
    <ChatActionsContext.Provider value={actions}>
      <MessagesContext.Provider value={messages}>{children}</MessagesContext.Provider>
    </ChatActionsContext.Provider>
  );
}

export function useMessages(): Message[] {
  const messages = useContext(MessagesContext);
  if (messages === null) throw new Error("useMessages must be used within <ChatProvider>");
  return messages;
}

export function useChatActions(): ChatActions {
  const actions = useContext(ChatActionsContext);
  if (actions === null) throw new Error("useChatActions must be used within <ChatProvider>");
  return actions;
}
