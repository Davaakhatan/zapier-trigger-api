"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { api } from "@/lib/api"

interface ActivityItem {
  id: string
  type: "acknowledged" | "received" | "warning" | "info"
  message: string
  timestamp: Date
  eventId?: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const inbox = await api.getInbox({ limit: 10 })
        
        // Convert recent events to activity items
        const activityItems: ActivityItem[] = inbox.events
          .slice(0, 5)
          .map((event) => ({
            id: event.id,
            type: "received" as const,
            message: `New event received from ${event.source || "unknown source"}`,
            timestamp: new Date(event.timestamp),
            eventId: event.id,
          }))
        
        // Add any acknowledged events from localStorage
        try {
          const acknowledgedEvents = JSON.parse(
            localStorage.getItem("acknowledgedEvents") || "[]"
          )
          acknowledgedEvents.slice(0, 3).forEach((event: any) => {
            activityItems.push({
              id: `ack-${event.id}`,
              type: "acknowledged",
              message: `Event acknowledged: ${event.id.substring(0, 8)}...`,
              timestamp: new Date(event.acknowledgedAt || Date.now()),
              eventId: event.id,
            })
          })
        } catch (e) {
          // Ignore localStorage errors
        }
        
        // Sort by timestamp (newest first) and limit to 5
        activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        setActivities(activityItems.slice(0, 5))
      } catch (err) {
        console.error("Error fetching activities:", err)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
    const interval = setInterval(fetchActivities, 30000) // Update every 30 seconds
    
    // Listen for new acknowledgments
    const handleAcknowledged = () => {
      fetchActivities()
    }
    window.addEventListener('eventAcknowledged', handleAcknowledged)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('eventAcknowledged', handleAcknowledged)
    }
  }, [])

  const getActivityColor = (type: string) => {
    switch (type) {
      case "acknowledged":
        return "bg-green-500"
      case "received":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No recent activity
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

