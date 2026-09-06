import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { ChatProvider, useChatActions, useMessages } from './ChatProvider'

const OPEN_REPLY_START = 'There are currently'
const BILLING_REPLY_START = 'Two billing-related'

function renderChat() {
  return renderHook(() => ({ messages: useMessages(), ...useChatActions() }), {
    wrapper: ChatProvider,
  })
}

async function flushStreams() {
  await act(async () => {
    await vi.runAllTimersAsync()
  })
}

describe('ChatProvider', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('keeps overlapping replies in their own bubbles', async () => {
    const { result } = renderChat()

    act(() => result.current.sendMessage('open'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    const midStream = result.current.messages[1]
    expect(midStream.streaming).toBe(true)
    expect(midStream.content.length).toBeGreaterThan(0)

    act(() => result.current.sendMessage('billing'))
    await flushStreams()

    const assistants = result.current.messages.filter((m) => m.role === 'assistant')
    expect(assistants).toHaveLength(2)
    expect(assistants[0].content.startsWith(OPEN_REPLY_START)).toBe(true)
    expect(assistants[0].content).not.toContain(BILLING_REPLY_START)
    expect(assistants[1].content.startsWith(BILLING_REPLY_START)).toBe(true)
    expect(assistants[1].content).not.toContain(OPEN_REPLY_START)
    expect(assistants.every((m) => m.streaming === false)).toBe(true)
  })

  it('regenerate streams a fresh answer to its own prompt into the same bubble', async () => {
    const { result } = renderChat()

    act(() => result.current.sendMessage('open'))
    await flushStreams()
    act(() => result.current.sendMessage('billing'))
    await flushStreams()

    const firstAssistant = result.current.messages[1]
    act(() => result.current.regenerate(firstAssistant.id))
    await flushStreams()

    expect(result.current.messages).toHaveLength(4)
    const regenerated = result.current.messages[1]
    expect(regenerated.id).toBe(firstAssistant.id)
    // The mock is deterministic per prompt, so an exact match proves the
    // bubble was cleared before the new reply streamed in (not appended).
    expect(regenerated.content).toBe(firstAssistant.content)
    expect(regenerated.content.startsWith(OPEN_REPLY_START)).toBe(true)
    expect(regenerated.streaming).toBe(false)
  })

  it('does not re-render components that only use actions while a reply streams', async () => {
    let actionsOnlyRenders = 0
    function ActionsOnly() {
      useChatActions()
      actionsOnlyRenders++
      return null
    }
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <ChatProvider>
          <ActionsOnly />
          {children}
        </ChatProvider>
      )
    }
    const { result } = renderHook(() => useChatActions(), { wrapper: Wrapper })
    const rendersBeforeSend = actionsOnlyRenders

    act(() => result.current.sendMessage('open'))
    await flushStreams()

    expect(actionsOnlyRenders).toBe(rendersBeforeSend)
  })

  it('keeps the same actions object across message updates', async () => {
    const { result } = renderChat()
    const before = {
      sendMessage: result.current.sendMessage,
      regenerate: result.current.regenerate,
    }

    act(() => result.current.sendMessage('open'))
    await flushStreams()

    expect(result.current.sendMessage).toBe(before.sendMessage)
    expect(result.current.regenerate).toBe(before.regenerate)
  })
})
