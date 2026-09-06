import type { Ticket } from "../types";
import { TICKETS } from "../data/tickets";
import { useChatActions } from "../chat/ChatProvider";

export function TicketsPanel() {
  const { sendMessage } = useChatActions();

  // For each ticket, scan the whole list to see if this requester appears
  // more than once, so we can flag repeat requesters.
  function isRepeatRequester(ticket: Ticket): boolean {
    let count = 0;
    for (let i = 0; i < TICKETS.length; i++) {
      if (TICKETS[i].requesterEmail === ticket.requesterEmail) count++;
    }
    return count > 1;
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Tickets</h2>
      <div className="ticket-list">
        {TICKETS.map((t) => (
          <div
            key={t.id}
            className="ticket-row"
            onClick={() => sendMessage("Summarize ticket: " + t.subject)}
          >
            <div className="ticket-subject">{t.subject}</div>
            <div className="ticket-meta">
              {t.requesterEmail}
              {isRepeatRequester(t) && <span className="repeat">repeat</span>}
              <span className={"chip chip-" + t.status}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
