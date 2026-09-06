import { useMemo } from "react";
import type { Ticket } from "../types";
import { TICKETS } from "../data/tickets";
import { useChatActions } from "../chat/ChatProvider";

interface TicketRow extends Ticket {
  isRepeated: boolean;
}

export function TicketsPanel() {
  const { sendMessage } = useChatActions();

  const processedTickets = useMemo<TicketRow[]>(() => {
    const seen = new Set<string>();
    const repeated = new Set<string>();
    for (const t of TICKETS) {
      if (seen.has(t.requesterEmail)) repeated.add(t.requesterEmail);
      seen.add(t.requesterEmail);
    }
    return TICKETS.map((t) => ({
      ...t,
      isRepeated: repeated.has(t.requesterEmail),
    }));
  }, []);

  return (
    <div className="panel">
      <h2 className="panel-title">Tickets</h2>
      <div className="ticket-list">
        {processedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="ticket-row"
            onClick={() => sendMessage("Summarize ticket: " + ticket.subject)}
          >
            <div className="ticket-subject">{ticket.subject}</div>
            <div className="ticket-meta">
              {ticket.requesterEmail}
              {ticket.isRepeated && <span className="repeat">repeat</span>}
              <span className={"chip chip-" + ticket.status}>
                {ticket.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
