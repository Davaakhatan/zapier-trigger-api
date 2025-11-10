"use client"

import { useState } from "react"
import EventInbox from "@/components/event-inbox"
import APIDocumentation from "@/components/api-documentation"
import QuickStats from "@/components/quick-stats"
import Header from "@/components/header"
import Navigation from "@/components/navigation"
import EventTimeline from "@/components/event-timeline"
import EventDetailsModal from "@/components/event-details-modal"
import { api, EventItem, APIError } from "@/lib/api"
import { useEffect } from "react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [timelineEvents, setTimelineEvents] = useState<EventItem[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [acknowledging, setAcknowledging] = useState<string | null>(null)

  // Fetch events for timeline view - get both pending and load acknowledged from localStorage
  useEffect(() => {
    if (activeTab === "timeline") {
      const fetchTimelineEvents = async () => {
        try {
          // Get pending events
          const response = await api.getInbox({ limit: 100 })
          setTimelineEvents(response.events)
          
          // Store acknowledged events in localStorage when they're acknowledged
          // This is handled in the acknowledge handler below
        } catch (err) {
          console.error("Error fetching timeline events:", err)
        }
      }
      fetchTimelineEvents()
      const interval = setInterval(fetchTimelineEvents, 30000)
      return () => clearInterval(interval)
    }
  }, [activeTab])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-muted/20">
        {activeTab === "dashboard" && (
          <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                Triggers API Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">Real-time event ingestion and workflow management</p>
            </div>

            <QuickStats />
          </div>
        )}

        {activeTab === "inbox" && (
          <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in-50 duration-500">
            <div className="space-y-3 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                Event Inbox
              </h1>
              <p className="text-muted-foreground text-lg">View and manage incoming events</p>
            </div>
            <EventInbox />
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in-50 duration-500">
            <div className="space-y-3 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                Event Timeline
              </h1>
              <p className="text-muted-foreground text-lg">Visual timeline of all events</p>
            </div>
            <EventTimeline 
              events={timelineEvents} 
              onEventClick={(event) => setSelectedEvent(event)}
            />
            <EventDetailsModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onAcknowledge={async (eventId) => {
                try {
                  setAcknowledging(eventId)
                  await api.acknowledgeEvent(eventId)
                  
                  // Find the event that was acknowledged
                  const acknowledgedEvent = timelineEvents.find(e => e.id === eventId)
                  if (acknowledgedEvent) {
                    // Update the event status
                    const updatedEvent = { ...acknowledgedEvent, status: 'acknowledged' }
                    
                    // Remove from pending list
                    setTimelineEvents(timelineEvents.filter(e => e.id !== eventId))
                    
                    // Store in localStorage for timeline view
                    try {
                      const stored = localStorage.getItem('acknowledgedEvents')
                      const existing = stored ? JSON.parse(stored) : []
                      const updated = [...existing, updatedEvent]
                      // Keep only last 1000 acknowledged events
                      localStorage.setItem('acknowledgedEvents', JSON.stringify(updated.slice(-1000)))
                    } catch (err) {
                      console.error('Error storing acknowledged event:', err)
                    }
                  }
                  
                  setSelectedEvent(null)
                  
                  // Track acknowledged count
                  const currentCount = parseInt(localStorage.getItem('acknowledgedCount') || '0', 10)
                  localStorage.setItem('acknowledgedCount', String(currentCount + 1))
                  window.dispatchEvent(new CustomEvent('eventAcknowledged'))
                } catch (err) {
                  if (err instanceof APIError) {
                    alert(`Failed to acknowledge event: ${err.message}`)
                  } else {
                    alert("Failed to acknowledge event")
                  }
                } finally {
                  setAcknowledging(null)
                }
              }}
              acknowledging={acknowledging}
            />
          </div>
        )}

        {activeTab === "docs" && (
          <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto animate-in fade-in-50 duration-500">
            <div className="space-y-3 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                API Documentation
              </h1>
              <p className="text-muted-foreground text-lg">Integration guide and reference</p>
            </div>
            <APIDocumentation />
          </div>
        )}
      </main>
    </div>
  )
}

