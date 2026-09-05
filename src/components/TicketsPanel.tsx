import type { Ticket } from "../types";

interface Props {
  tickets: Ticket[];
  onPick: (subject: string) => void;
}

export function TicketsPanel({ tickets, onPick }: Props) {
  // For each ticket, scan the whole list to see if this requester appears
  // more than once, so we can flag repeat requesters.
  function isRepeatRequester(ticket: Ticket): boolean {
    let count = 0;
    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].requesterEmail === ticket.requesterEmail) count++;
    }
    return count > 1;
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Tickets</h2>
      <div className="ticket-list">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="ticket-row"
            onClick={() => onPick("Summarize ticket: " + t.subject)}
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
