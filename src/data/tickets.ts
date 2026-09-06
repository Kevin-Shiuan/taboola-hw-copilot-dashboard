import type { Ticket } from '../types'

export const TICKETS: Ticket[] = [
  { id: 1, subject: 'Cannot log in after password reset', requesterEmail: 'amy@acme.com', status: 'open' },
  { id: 2, subject: 'Invoice PDF is blank', requesterEmail: 'ben@globex.com', status: 'pending' },
  { id: 3, subject: 'Feature request: dark mode', requesterEmail: 'carol@initech.com', status: 'open' },
  { id: 4, subject: 'Export to CSV times out', requesterEmail: 'amy@acme.com', status: 'open' },
  { id: 5, subject: 'Mobile layout broken on iOS', requesterEmail: 'dan@hooli.com', status: 'closed' },
  { id: 6, subject: 'Billing charged twice', requesterEmail: 'erin@umbrella.com', status: 'pending' },
  { id: 7, subject: 'How do I invite teammates?', requesterEmail: 'frank@stark.com', status: 'closed' },
  { id: 8, subject: 'API returns 500 on bulk update', requesterEmail: 'ben@globex.com', status: 'open' },
  { id: 9, subject: 'Notifications arrive twice', requesterEmail: 'grace@wayne.com', status: 'pending' },
  { id: 10, subject: 'SSO redirect loops forever', requesterEmail: 'amy@acme.com', status: 'open' },
  { id: 11, subject: 'Search ignores accented characters', requesterEmail: 'iris@oscorp.com', status: 'open' },
  { id: 12, subject: 'Webhook signature mismatch', requesterEmail: 'jack@tyrell.com', status: 'pending' },
]
