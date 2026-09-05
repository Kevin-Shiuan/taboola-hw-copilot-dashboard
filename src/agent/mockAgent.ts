import { TICKETS } from "../data/tickets";

// ---------------------------------------------------------------------------
// This is a LOCAL MOCK that stands in for the CopilotKit runtime + agent.
// In a real app this work happens server-side (the Copilot Runtime talks to an
// LLM). Here we fake it so the project runs offline with no backend / API key.
// The streaming shape (token-by-token, cancellable) mirrors the real thing.
// ---------------------------------------------------------------------------

function pickResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("open")) {
    const open = TICKETS.filter((t) => t.status === "open").length;
    return `There are currently ${open} open tickets. The most urgent looks like the login and SSO issues from amy@acme.com. Want me to draft a reply?`;
  }
  if (p.includes("summary") || p.includes("summarize")) {
    return `Here is a quick summary: ${TICKETS.length} tickets total, spanning login, billing, and API problems. Several requesters have filed more than one ticket.`;
  }
  if (p.includes("billing") || p.includes("invoice")) {
    return `Two billing-related tickets stand out: a blank invoice PDF and a double charge. Both should probably go to the payments team.`;
  }
  return `Thanks for the question. Based on the current tickets, I'd start with the highest-priority open items and group the rest by team. Let me know if you'd like a breakdown.`;
}

export interface StreamOptions {
  onToken: (token: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}

// Streams the reply one word at a time with variable delay between tokens.
export function streamReply(prompt: string, opts: StreamOptions): void {
  const words = pickResponse(prompt).split(" ");
  let i = 0;

  function emitNext() {
    if (opts.signal?.aborted) return;
    if (i >= words.length) {
      opts.onDone();
      return;
    }
    opts.onToken((i === 0 ? "" : " ") + words[i]);
    i++;
    const delay = 40 + Math.floor(Math.random() * 160);
    setTimeout(emitNext, delay);
  }

  setTimeout(emitNext, 50 + Math.floor(Math.random() * 200));
}
