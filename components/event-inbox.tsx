"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, AlertCircle, CheckCircle2, Clock, Search, Filter, Copy, Check, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { api, EventItem, APIError } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

export default function EventInbox() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acknowledging, setAcknowledging] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getInbox({ limit: 100 })
      setEvents(response.events)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError("Failed to load events")
      }
      console.error("Error fetching events:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleAcknowledge = async (eventId: string) => {
    try {
      setAcknowledging(eventId)
      await api.acknowledgeEvent(eventId)
      setEvents(events.filter((e) => e.id !== eventId))
      setSelectedEvent(null)
      
      // Track acknowledged count in localStorage
      const currentCount = parseInt(localStorage.getItem('acknowledgedCount') || '0', 10)
      localStorage.setItem('acknowledgedCount', String(currentCount + 1))
      
      // Trigger stats refresh by dispatching custom event
      window.dispatchEvent(new CustomEvent('eventAcknowledged'))
    } catch (err) {
      if (err instanceof APIError) {
        alert(`Failed to acknowledge event: ${err.message}`)
      } else {
        alert("Failed to acknowledge event")
      }
      console.error("Error acknowledging event:", err)
    } finally {
      setAcknowledging(null)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return timestamp
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      (event.source?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      JSON.stringify(event.payload).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || event.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const copyToClipboard = (text: any, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "acknowledged":
        return <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "acknowledged":
        return "bg-green-500/20 text-green-700 dark:text-green-400"
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
      default:
        return ""
    }
  }

  if (loading && events.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6 text-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading events...</p>
        </CardContent>
      </Card>
    )
  }

  if (error && events.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6 text-center py-8">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchEvents} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by source or payload..."
            className="pl-10 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setFilterStatus(null)}
          >
            <Filter className="w-4 h-4" />
            All
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(filterStatus === "pending" ? null : "pending")}
            className={filterStatus === "pending" ? getStatusBadge("pending") : ""}
          >
            <span className="capitalize text-xs">Pending</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-mono text-sm font-semibold text-foreground">
                        {event.id.substring(0, 8)}...
                      </h3>
                      {event.source && (
                        <Badge variant="outline" className="text-xs">
                          {event.source}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 ml-auto">
                        {getStatusIcon(event.status)}
                        <span className={`text-xs capitalize px-2 py-1 rounded ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatTimestamp(event.timestamp)}</span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      selectedEvent === event.id ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {selectedEvent === event.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">Event Payload</p>
                      <div className="relative">
                        <div className="bg-background rounded p-3 font-mono text-xs text-muted-foreground overflow-x-auto">
                          <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 gap-2 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(event.payload, event.id)
                          }}
                        >
                          {copied === event.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-background">
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-semibold text-foreground capitalize">{event.status}</p>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <p className="text-muted-foreground">Event ID</p>
                        <p className="font-semibold text-foreground font-mono text-xs">{event.id}</p>
                      </div>
                    </div>

                    {event.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAcknowledge(event.id)
                          }}
                          disabled={acknowledging === event.id}
                        >
                          {acknowledging === event.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Acknowledging...
                            </>
                          ) : (
                            "Acknowledge"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="pt-6 text-center py-8">
              <p className="text-muted-foreground">
                {events.length === 0
                  ? "No events in inbox. Events will appear here when they are created."
                  : "No events found matching your filters"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

