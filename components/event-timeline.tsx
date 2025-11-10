"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2 } from "lucide-react"
import { EventItem } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

interface EventTimelineProps {
  events: EventItem[]
  onEventClick?: (event: EventItem) => void
}

export default function EventTimeline({ events, onEventClick }: EventTimelineProps) {
  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.timestamp).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, EventItem[]>)

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date} className="relative">
          {/* Date Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 mb-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">{date}</h3>
          </div>

          {/* Timeline */}
          <div className="relative pl-6 space-y-4">
            {/* Timeline line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />

            {groupedEvents[date].map((event, idx) => (
              <div
                key={event.id}
                className="relative cursor-pointer group"
                onClick={() => onEventClick?.(event)}
              >
                {/* Timeline dot */}
                <div className="absolute -left-7 top-2 w-4 h-4 rounded-full border-2 border-background bg-primary shadow-sm group-hover:scale-125 transition-transform" />

                <Card className="bg-card border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {event.id.substring(0, 8)}...
                          </span>
                          {event.source && (
                            <Badge variant="outline" className="text-xs">
                              {event.source}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              event.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                                : "bg-green-500/20 text-green-700 dark:text-green-400"
                            }`}
                          >
                            {event.status === "pending" ? (
                              <Clock className="w-3 h-3 mr-1" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            )}
                            {event.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </div>
                        <div className="mt-2 text-sm text-foreground/80 line-clamp-2">
                          {JSON.stringify(event.payload).substring(0, 100)}...
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

