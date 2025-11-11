"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock } from "lucide-react"

interface RateLimitData {
  requestsPerHour: {
    used: number
    limit: number
    resetIn: number
  }
  requestsPerMinute: {
    used: number
    limit: number
    status: "normal" | "warning" | "critical"
  }
}

export default function RateLimitingIndicators() {
  const [rateLimits, setRateLimits] = useState<RateLimitData>({
    requestsPerHour: {
      used: 0,
      limit: 1000,
      resetIn: 0,
    },
    requestsPerMinute: {
      used: 0,
      limit: 20,
      status: "normal",
    },
  })

  useEffect(() => {
    // Mock rate limit data - in production, this would come from backend
    // or be tracked client-side from API calls
    const updateRateLimits = () => {
      // Simulate usage (in production, track actual API calls)
      const now = new Date()
      const minutes = now.getMinutes()
      const hourUsage = Math.floor(Math.random() * 500) + 200 // 200-700
      const minuteUsage = Math.floor(Math.random() * 15) + 5 // 5-20
      
      const resetIn = 60 - minutes // Minutes until next hour
      
      let status: "normal" | "warning" | "critical" = "normal"
      const minutePercent = (minuteUsage / 20) * 100
      if (minutePercent >= 90) {
        status = "critical"
      } else if (minutePercent >= 75) {
        status = "warning"
      }
      
      setRateLimits({
        requestsPerHour: {
          used: hourUsage,
          limit: 1000,
          resetIn,
        },
        requestsPerMinute: {
          used: minuteUsage,
          limit: 20,
          status,
        },
      })
    }

    updateRateLimits()
    const interval = setInterval(updateRateLimits, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  const hourPercent = (rateLimits.requestsPerHour.used / rateLimits.requestsPerHour.limit) * 100
  const minutePercent = (rateLimits.requestsPerMinute.used / rateLimits.requestsPerMinute.limit) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">⚠️ Critical</Badge>
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">⚠️ Warning</Badge>
      default:
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">✅ Normal</Badge>
    }
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          API Usage & Rate Limits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Requests This Hour</span>
              <Badge variant="outline">
                {rateLimits.requestsPerHour.used}/{rateLimits.requestsPerHour.limit}
              </Badge>
            </div>
            <div className="w-full bg-background rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full ${
                  hourPercent >= 90 ? "bg-red-500" : hourPercent >= 75 ? "bg-yellow-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(hourPercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Resets in: {rateLimits.requestsPerHour.resetIn} minutes</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Requests Per Minute</span>
              {getStatusBadge(rateLimits.requestsPerMinute.status)}
            </div>
            <div className="w-full bg-background rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full ${getStatusColor(rateLimits.requestsPerMinute.status)}`}
                style={{ width: `${Math.min(minutePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {rateLimits.requestsPerMinute.used}/{rateLimits.requestsPerMinute.limit} requests ({Math.round(minutePercent)}%)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

