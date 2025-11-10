"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Clock, CheckCircle2, Activity } from "lucide-react"
import { api, APIError } from "@/lib/api"

export default function QuickStats() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    pendingEvents: 0,
    acknowledgedEvents: 0,
    apiStatus: "unknown",
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use inbox endpoint directly (stats endpoint has issues)
        const inbox = await api.getInbox({ limit: 100 })
        const pending = inbox.events.filter((e) => e.status === "pending").length
        
        setStats({
          totalEvents: inbox.total || pending,
          pendingEvents: pending,
          acknowledgedEvents: 0, // Inbox only shows pending events
          apiStatus: "healthy",
        })
      } catch (err) {
        setStats((prev) => ({ ...prev, apiStatus: "error" }))
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents.toLocaleString(),
      icon: Zap,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      title: "Pending Events",
      value: stats.pendingEvents.toLocaleString(),
      icon: Clock,
      color: "text-yellow-500 dark:text-yellow-400",
    },
    {
      title: "Acknowledged",
      value: stats.acknowledgedEvents.toLocaleString(),
      icon: CheckCircle2,
      color: "text-green-500 dark:text-green-400",
    },
    {
      title: "API Status",
      value: stats.apiStatus === "healthy" ? "Healthy" : "Error",
      icon: Activity,
      color: stats.apiStatus === "healthy" ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg bg-background`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

