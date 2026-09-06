# NOTES

## 1.1 What the app does

Support Copilot is a supportive internal tool that helps us manage our tickets. It can make summary of selected tickets and suggest next steps.

## 1.2 Concerns

### React rendering

**Every state change re-renders the whole `<App />` tree.**

`<App />` use `useCopilotChat()` hooks, so it re-renders on every token received and update to `messages`. Besides that, inline arrow functions (`onPick`, `onSend`, `onRegenerate`) are passed to child component, so `<TicketsPanel />`, `<CopilotSidebar />` are also re-render per token update.

_Idea:_ move `messages` and stable actions into two different contexts with provider respectively, one for `messages` and one for stable actions. By this way, a component that only need action like `sendMessage()` never affected by `messages` updates. 


**`isRepeatRequester` in `<TicketsPanel />` is O(n²) inside the map.**

When mapping `tickets` to render each row, it runs `isRepeatRequester()` on mapping loop, causing the map runs O(n²) on every rerender.

_Idea:_ use useMemo to store process the array once and store the info of repeated emails, then simply map the processed array to render each row.


**`assistantWords` counter in `<App />` recomputes on every message update.**

The `assistantWords` counter scan through all the `messages` and count the total words, and the function runs on every message update and on every rerender of `<App />`.

_Idea:_ Introduce a mechanism to add the number of word when a token is successfully received, instead of re-computing base on the whole `messages` array. 


**Chat input should use `<input />` or `<textArea />`.**

Maybe this is just a preference, I feels like we should use native elements if possible, I don't see any reason to use `contentEditable` div.


### UX

**No auto-scroll in `<MessageList />`.** 
When there is new message, the `<MessageList />` should scroll to the bottom.

**Copy message button has UI but no implemented.** 
When the user clicks the button, the message is copied to the clipboard, but there is not visual feedback to let user know the copy is done successfully.


**Enter submits during IME composition regarding  half-composed text.**
`onKeyDown` submits on any Enter. With CJK input method, before confirming the text, pressing Enter will send the half-composed text.

_Idea:_ early return when `e.nativeEvent.isComposing` is true.


**No keyboard navigation.**
Pressing Tab or Shift+Tab will not focus the next or previous interactive element.

_Idea:_ use `aria-label` for icon-only buttons.


## 2. Fixing reported bug

**Two replies stream get mixed**
Replies from copilot will stream into the same new message when it try to reply a second message before the first one finishes.
Clicking regenerate on an a reply when it is still streaming will also cause the same issue.

**Steps to reproduce**
1. Send a message and wait for the first assistant reply.
2. Send another message before the first reply finishes.

**Assumptions**
We should wait for the first reply to finish before sending the second user message.

**Root cause**

The stream callbacks in `useCopilotChat` do not handle which stream belong to which message.
When there is a new assistant message, it will stream and update the last assistant message.

`regenerate` has the same code and therefore the same bug. Clicking regenerate mid-stream
appends a new assistant bubble, which becomes "last", and the still-running stream leaks
into it.

Contributing factors:

- Nothing cancels an in-flight stream. `mockAgent.ts` accepts an `AbortSignal`, but the
  hook never passes one, and `emitNext` only checks `aborted` on the next tick without
  clearing the timer or notifying the UI.
- The input stays enabled while a reply is streaming, so the race is trivial to hit.
- `sendMessage` and `regenerate` duplicate the same stream-wiring code, so the bug exists
  in two places.


### The Fix

Give every stream an id. When a stream starts it captures the id of the assistant message it belongs to, and every update targets that id instead of "the last message":

`sendMessage` and `regenerate` both call `startStream`, which also removes the duplicated code. Overlapping replies are now safe by construction: each stream can only ever write to its own message, and each `onDone` closes its message.

`regenerate` was changed to take the id of the clicked message. It looks up the user prompt that produce that assistant message, resets the message's content, and streams the new answer into the
same id. I think a better solution is to save the id of the user prompt that assistant message replied to, so that we can use the id to find & get the actual user prompt instead of assuming the last user prompt before the assistant message is the one that this assistant message replied to. 
Besides that, this fix also change the behavior of `regenerate` that used to generate a new message in the chat, but this fix the bug that it might possible stream into wrong new message. 


### Testing

Added `src/chat/ChatProvider.test.tsx` (vitest + jsdom + `@testing-library/react`'s
`renderHook`, both added as dev dependencies) with fake timers:

Both tests fail against the original hook (interleaved content / an extra bubble) and pass
after the fix.


## 3. Refactor chosen

**Area: chat state ownership.** replace `useCopilotChat` with `ChatProvider`

Multiple child components from `<App />` need the state and actions from original `useCopilotChat`, and the messages should only have one truth of source, so to allow us to optimize the render, refactor to a provider will allow child components to only import the context when they need it, instead of passing from parent to child.

Two contexts are created instead of one, because messages will update frequently and actions barely change, so we can avoid re-rendering the actions object on every message update.

What changed as part of the refactor:

- `messagesRef` is introduced: `regenerate()` needs the latest `messages` state to find the prompt, simply adding `messages` to the dependency array of `useMemo()` will cause it to re-render on every token. So it's a hack to use ref here so that `regenerate()` could always use get the latest `messages` state when it needs it. And the ref is  always up to date because we use another `useEffect` to keep it updated.
- `MessageItem` calls `regenerate(message.id)` from context directly.
- Consumers read from context directly: `CopilotSidebar`, `MessageList`, `ChatInput` and
  `TicketsPanel` have no props. `App` is now the provider plus static layout.

Extra changes made alongside, not strictly part of the refactor:

- `src/utils/makeId.ts`: the id counter moved out of the provider for cleaner code.
- `src/components/WordCountStat.tsx`: the header word counter became its own component so
  it can subscribe to messages without causing `App` into every re-render.
- `TicketsPanel` now imports `TICKETS` and calls `sendMessage` itself instead of receiving
  `tickets` / `onPick` props. 
