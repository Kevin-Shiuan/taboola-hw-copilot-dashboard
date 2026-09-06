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


**Enter submits during IME composition regarding  half-composed text.**
`onKeyDown` submits on any Enter. With CJK input method, before confirming the text, pressing Enter will send the half-composed text.

_Idea:_ early return when `e.nativeEvent.isComposing` is true.


**No keyboard navigation.**
Pressing Tab or Shift+Tab will not focus the next or previous interactive element.

_Idea:_ use `aria-label` for icon-only buttons.


### Incomplete features

**Copy message button has UI but no implemented.** 

**Regenerate message will send new message rather than replacing the one clicked.**

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
