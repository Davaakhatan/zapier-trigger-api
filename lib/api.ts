/**
 * API client for Zapier Triggers API
 * Connects to Python FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface EventRequest {
  payload: Record<string, any>
  source?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface EventResponse {
  event_id: string
  status: string
  timestamp: string
  message: string
}

export interface EventItem {
  id: string
  timestamp: string
  payload: Record<string, any>
  source?: string
  status: string
}

export interface InboxResponse {
  events: EventItem[]
  total: number
  limit: number
  offset: number
}

export interface AcknowledgeResponse {
  event_id: string
  status: string
  message: string
}

export interface StatsResponse {
  pending: number
  acknowledged: number
  total: number
}

export interface ErrorResponse {
  error: string
  message: string
  details?: Record<string, any>
}

class APIError extends Error {
  constructor(
    public status: number,
    public error: ErrorResponse
  ) {
    super(error.message)
    this.name = 'APIError'
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new APIError(response.status, data as ErrorResponse)
  }

  return data as T
}

export const api = {
  /**
   * Create a new event
   */
  async createEvent(event: EventRequest): Promise<EventResponse> {
    return fetchAPI<EventResponse>('/v1/events', {
      method: 'POST',
      body: JSON.stringify(event),
    })
  },

  /**
   * Get pending events from inbox
   */
  async getInbox(params?: {
    limit?: number
    offset?: number
    source?: string
    since?: string
  }): Promise<InboxResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.source) searchParams.set('source', params.source)
    if (params?.since) searchParams.set('since', params.since)

    const query = searchParams.toString()
    return fetchAPI<InboxResponse>(`/v1/events/inbox${query ? `?${query}` : ''}`)
  },

  /**
   * Acknowledge an event
   */
  async acknowledgeEvent(eventId: string): Promise<AcknowledgeResponse> {
    return fetchAPI<AcknowledgeResponse>(`/v1/events/${eventId}/ack`, {
      method: 'POST',
    })
  },

  /**
   * Get event statistics
   */
  async getStats(): Promise<StatsResponse> {
    return fetchAPI<StatsResponse>('/v1/events/stats')
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    return fetchAPI('/health')
  },
}

export { APIError }

