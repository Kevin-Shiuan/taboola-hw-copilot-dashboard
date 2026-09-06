export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
  streaming: boolean
}

export type TicketStatus = 'open' | 'pending' | 'closed'

export interface Ticket {
  id: number
  subject: string
  requesterEmail: string
  status: TicketStatus
}
