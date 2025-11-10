"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, ExternalLink, TrendingUp, Activity } from "lucide-react"
import { EventItem } from "@/lib/api"
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns"
import { Button } from "@/components/ui/button"

interface EventTimelineProps {
  events: EventItem[]
  onEventClick?: (event: EventItem) => void
}

export default function EventTimeline({ events, onEventClick }: EventTimelineProps) {
  const [acknowledgedEvents, setAcknowledgedEvents] = useState<EventItem[]>([])

  // Load acknowledged events from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('acknowledgedEvents')
      if (stored) {
        const parsed = JSON.parse(stored)
        setAcknowledgedEvents(Array.isArray(parsed) ? parsed : [])
      }
    } catch (err) {
      console.error('Error loading acknowledged events:', err)
    }
  }, [])

  // Combine pending and acknowledged events, sort by timestamp (newest first)
  const allEvents = [...events, ...acknowledgedEvents].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Group events by time period (Today, Yesterday, This Week, This Month, Older)
  const groupedEvents = allEvents.reduce((acc, event) => {
    const eventDate = new Date(event.timestamp)
    let groupKey: string

    if (isToday(eventDate)) {
      groupKey = 'Today'
    } else if (isYesterday(eventDate)) {
      groupKey = 'Yesterday'
    } else if (isThisWeek(eventDate)) {
      groupKey = 'This Week'
    } else if (isThisMonth(eventDate)) {
      groupKey = 'This Month'
    } else {
      groupKey = format(eventDate, 'MMMM yyyy')
    }

    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(event)
    return acc
  }, {} as Record<string, EventItem[]>)

  // Sort groups: Today, Yesterday, This Week, This Month, then by date
  const sortedGroups = Object.keys(groupedEvents).sort((a, b) => {
    const order = ['Today', 'Yesterday', 'This Week', 'This Month']
    const aIndex = order.indexOf(a)
    const bIndex = order.indexOf(b)
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    return new Date(b).getTime() - new Date(a).getTime()
  })

  // Calculate stats for this timeline
  const stats = {
    total: allEvents.length,
    pending: allEvents.filter(e => e.status === 'pending').length,
    acknowledged: allEvents.filter(e => e.status === 'acknowledged').length,
  }

  return (
    <div className="space-y-8">
      {/* Timeline Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold text-foreground">{stats.acknowledged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Groups */}
      {sortedGroups.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="pt-12 text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Events Yet</h3>
            <p className="text-sm text-muted-foreground">Events will appear here as they are created and acknowledged.</p>
          </CardContent>
        </Card>
      ) : (
        sortedGroups.map((groupKey) => (
          <div key={groupKey} className="relative">
            {/* Time Period Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-3 mb-6 border-b-2 border-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{groupKey}</h3>
                <Badge variant="outline" className="text-xs">
                  {groupedEvents[groupKey].length} event{groupedEvents[groupKey].length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-8 space-y-6">
              {/* Timeline line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />

              {groupedEvents[groupKey].map((event, idx) => {
                const isPending = event.status === 'pending'
                return (
                  <div
                    key={event.id}
                    className="relative cursor-pointer group"
                    onClick={() => onEventClick?.(event)}
                  >
                    {/* Timeline dot with status color */}
                    <div className={`absolute -left-9 top-3 w-5 h-5 rounded-full border-2 border-background shadow-lg group-hover:scale-125 transition-all ${
                      isPending 
                        ? 'bg-yellow-500 animate-pulse' 
                        : 'bg-green-500'
                    }`} />
                    
                    {/* Connection line to next event */}
                    {idx < groupedEvents[groupKey].length - 1 && (
                      <div className="absolute -left-7 top-8 w-0.5 h-6 bg-border/50" />
                    )}

                    <Card className={`bg-card border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-200 ${
                      isPending ? 'ring-1 ring-yellow-500/20' : ''
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-mono text-xs text-muted-foreground font-semibold">
                                {event.id.substring(0, 8)}...
                              </span>
                              {event.source && (
                                <Badge variant="outline" className="text-xs font-medium">
                                  {event.source}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium ${
                                  isPending
                                    ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                                    : "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                                }`}
                              >
                                {isPending ? (
                                  <Clock className="w-3 h-3 mr-1" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                )}
                                {event.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{format(new Date(event.timestamp), 'PPp')}</span>
                              <span className="text-muted-foreground/60">•</span>
                              <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                            </div>
                            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">Payload Preview</p>
                              <p className="text-sm text-foreground/80 font-mono line-clamp-2">
                                {JSON.stringify(event.payload).substring(0, 120)}
                                {JSON.stringify(event.payload).length > 120 ? '...' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEventClick?.(event)
                              }}
                              className="gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

