# Support Copilot

A small internal tool: a copilot chat next to a tickets panel. Ask the assistant about the
tickets and it streams a reply back word by word.

The assistant is a local mock (`src/agent/mockAgent.ts`), so the app runs offline with no
backend and no API key. The streaming shape mirrors a real agent.

## Documents

- [`docs/2026_Frontend_Engineer_Home_Assignment.pdf`](./docs/2026_Frontend_Engineer_Home_Assignment.pdf)
  — the original brief this repository answers.
- [`NOTES.md`](./NOTES.md) — my write-up: what the code does, what concerned me, the root
  cause of the reported bug, and the reasoning behind the refactor and the improvements.

## Setup

```bash
npm install
npm run dev
```

## Scripts

| Script                 | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the Vite dev server        |
| `npm run build`        | Type-check, then build           |
| `npm run typecheck`    | `tsc --noEmit`                   |
| `npm test`             | Run the vitest suite once        |
| `npm run format`       | Format the repo with Prettier    |
| `npm run format:check` | Check formatting without writing |

## Project structure

```
src/
  App.tsx                     Provider + static layout
  main.tsx                    Entry point
  types.ts                    Message and Ticket types
  agent/mockAgent.ts          Local mock agent, streams a canned reply word by word
  chat/ChatProvider.tsx       Chat state (useReducer) exposed through two contexts
  chat/ChatProvider.test.tsx  Tests for streaming, regenerate, and render isolation
  components/                 TicketsPanel, CopilotSidebar, MessageList, ChatInput, WordCountStat
  data/tickets.ts             Static ticket list
  utils/makeId.ts             Sequential id generator
```

Chat state lives in `ChatProvider`. Messages and actions are kept in separate contexts so
that components which only send messages do not re-render on every streamed token. The
reasoning is in [NOTES.md](./NOTES.md).
