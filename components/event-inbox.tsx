"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, AlertCircle, CheckCircle2, Clock, Search, Filter, Copy, Check, RefreshCw, Inbox, Download, Trash2, CheckSquare, Square } from "lucide-react"
import { Input } from "@/components/ui/input"
import { api, EventItem, APIError } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

export default function EventInbox() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acknowledging, setAcknowledging] = useState<string | null>(null)
  const [bulkAcknowledging, setBulkAcknowledging] = useState(false)

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
      setSelectedEvents((prev) => {
        const next = new Set(prev)
        next.delete(eventId)
        return next
      })
      
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

  const handleBulkAcknowledge = async () => {
    if (selectedEvents.size === 0) return
    
    try {
      setBulkAcknowledging(true)
      const pendingEvents = Array.from(selectedEvents).filter(id => 
        events.find(e => e.id === id && e.status === 'pending')
      )
      
      // Acknowledge all selected pending events
      await Promise.all(pendingEvents.map(id => api.acknowledgeEvent(id)))
      
      // Update events and selected set
      setEvents(events.filter((e) => !selectedEvents.has(e.id)))
      setSelectedEvents(new Set())
      setSelectedEvent(null)
      
      // Track acknowledged count
      const currentCount = parseInt(localStorage.getItem('acknowledgedCount') || '0', 10)
      localStorage.setItem('acknowledgedCount', String(currentCount + pendingEvents.length))
      
      // Trigger stats refresh
      window.dispatchEvent(new CustomEvent('eventAcknowledged'))
    } catch (err) {
      if (err instanceof APIError) {
        alert(`Failed to acknowledge some events: ${err.message}`)
      } else {
        alert("Failed to acknowledge events")
      }
      console.error("Error acknowledging events:", err)
    } finally {
      setBulkAcknowledging(false)
    }
  }

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    setSelectedEvents((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(eventId)
      } else {
        next.delete(eventId)
      }
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredEvents.filter(e => e.status === 'pending').map(e => e.id)
      setSelectedEvents(new Set(pendingIds))
    } else {
      setSelectedEvents(new Set())
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    const dataToExport = filteredEvents.length > 0 ? filteredEvents : events
    
    if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `events-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Convert events to CSV
      const headers = ['ID', 'Timestamp', 'Source', 'Status', 'Payload']
      const rows = dataToExport.map(event => [
        event.id,
        event.timestamp,
        event.source || '',
        event.status,
        JSON.stringify(event.payload)
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `events-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
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
      <Card className="bg-card border-border/50 shadow-lg">
        <CardContent className="pt-12 text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">Loading events...</p>
          <p className="text-muted-foreground/70 text-sm mt-2">Please wait while we fetch your events</p>
        </CardContent>
      </Card>
    )
  }

  if (error && events.length === 0) {
    return (
      <Card className="bg-card border-border/50 shadow-lg">
        <CardContent className="pt-12 text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-500 mb-2 font-medium">{error}</p>
          <p className="text-muted-foreground text-sm mb-6">Unable to load events from the server</p>
          <Button onClick={fetchEvents} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
              placeholder="Search by source or payload..."
              className="pl-10 bg-card border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
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
              className={`gap-2 ${filterStatus === "pending" ? getStatusBadge("pending") : ""}`}
            >
              <Clock className="w-4 h-4" />
              <span className="capitalize text-xs">Pending</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              disabled={loading}
              className="gap-2 hover:bg-accent transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedEvents.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvents(new Set())}
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                Clear
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleBulkAcknowledge}
                disabled={bulkAcknowledging}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {bulkAcknowledging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Acknowledging...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Acknowledge All
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {filteredEvents.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('json')}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.length > 0 && (
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelectAll(selectedEvents.size < filteredEvents.filter(e => e.status === 'pending').length)}
              className="gap-2 h-8"
            >
              {selectedEvents.size === filteredEvents.filter(e => e.status === 'pending').length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="text-xs">Select All Pending</span>
            </Button>
          </div>
        )}

        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const isSelected = selectedEvents.has(event.id)
            const isPending = event.status === 'pending'
            
            return (
            <Card
              key={event.id}
                className={`group bg-card border-border/50 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden ${
                  isSelected ? 'border-primary/50 bg-primary/5' : ''
                }`}
                onClick={(e) => {
                  // Don't toggle selection if clicking checkbox
                  if ((e.target as HTMLElement).closest('button')) return
                  setSelectedEvent(selectedEvent === event.id ? null : event.id)
                }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {isPending && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectEvent(event.id, !isSelected)
                          }}
                          className="mt-1 flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                      )}
                  <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="font-mono text-sm font-semibold text-foreground">
                              {event.id.substring(0, 8)}...
                            </h3>
                          </div>
                          {event.source && (
                            <Badge variant="outline" className="text-xs font-medium border-primary/20">
                        {event.source}
                      </Badge>
                          )}
                          <div className="flex items-center gap-2 ml-auto">
                        {getStatusIcon(event.status)}
                            <span className={`text-xs font-medium capitalize px-2.5 py-1 rounded-full ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                      </div>
                  </div>
                  <ChevronRight
                      className={`w-5 h-5 text-muted-foreground transition-all duration-200 flex-shrink-0 group-hover:text-primary ${
                        selectedEvent === event.id ? "rotate-90 text-primary" : ""
                    }`}
                  />
                </div>

                {selectedEvent === event.id && (
                  <div className="mt-6 pt-6 border-t border-border/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground">Event Payload</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(event.payload, event.id)
                          }}
                        >
                          {copied === event.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="relative bg-muted/30 rounded-lg p-4 border border-border/50">
                        <pre className="font-mono text-xs text-foreground/90 overflow-x-auto">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1.5">Status</p>
                        <p className="text-sm font-semibold text-foreground capitalize">{event.status}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1.5">Event ID</p>
                        <p className="text-sm font-semibold text-foreground font-mono">{event.id}</p>
                      </div>
                    </div>

                    {event.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAcknowledge(event.id)
                          }}
                          disabled={acknowledging === event.id}
                        >
                          {acknowledging === event.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Acknowledging...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Acknowledge Event
                            </>
                          )}
                      </Button>
                    </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            )
          })
        ) : (
          <Card className="bg-card border-border/50 shadow-lg">
            <CardContent className="pt-12 text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-2">
                {events.length === 0 ? "No events in inbox" : "No matching events"}
              </p>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {events.length === 0
                  ? "Events will appear here when they are created via the API."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

