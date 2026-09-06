import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCopilotChat } from "./useCopilotChat";

const OPEN_REPLY_START = "There are currently";
const BILLING_REPLY_START = "Two billing-related";

async function flushStreams() {
  await act(async () => {
    await vi.runAllTimersAsync();
  });
}

describe("useCopilotChat", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("keeps overlapping replies in their own bubbles", async () => {
    const { result } = renderHook(() => useCopilotChat());

    act(() => result.current.sendMessage("open"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    act(() => result.current.sendMessage("billing"));
    await flushStreams();

    const assistants = result.current.messages.filter((m) => m.role === "assistant");
    expect(assistants).toHaveLength(2);
    expect(assistants[0].content.startsWith(OPEN_REPLY_START)).toBe(true);
    expect(assistants[0].content).not.toContain(BILLING_REPLY_START);
    expect(assistants[1].content.startsWith(BILLING_REPLY_START)).toBe(true);
    expect(assistants[1].content).not.toContain(OPEN_REPLY_START);
    expect(assistants.every((m) => m.streaming === false)).toBe(true);
  });

  it("regenerate streams into the clicked bubble using its own prompt", async () => {
    const { result } = renderHook(() => useCopilotChat());

    act(() => result.current.sendMessage("open"));
    await flushStreams();
    act(() => result.current.sendMessage("billing"));
    await flushStreams();

    const firstAssistant = result.current.messages[1];
    act(() => result.current.regenerate(firstAssistant.id));
    await flushStreams();

    expect(result.current.messages).toHaveLength(4);
    const regenerated = result.current.messages[1];
    expect(regenerated.id).toBe(firstAssistant.id);
    expect(regenerated.content.startsWith(OPEN_REPLY_START)).toBe(true);
    expect(regenerated.streaming).toBe(false);
  });
});
