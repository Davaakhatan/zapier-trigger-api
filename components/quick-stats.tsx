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
        // Try stats endpoint first
        const stats = await api.getStats()
        
        setStats({
          totalEvents: stats.total,
          pendingEvents: stats.pending,
          acknowledgedEvents: stats.acknowledged,
          apiStatus: "healthy",
        })
      } catch (err) {
        // Fallback: use inbox and calculate acknowledged from localStorage
        try {
          const inbox = await api.getInbox({ limit: 100 })
          const pending = inbox.events.filter((e) => e.status === "pending").length
          
          // Get acknowledged count from localStorage (tracked when events are acknowledged)
          const acknowledgedCount = parseInt(localStorage.getItem('acknowledgedCount') || '0', 10)
          
          setStats({
            totalEvents: inbox.total || pending,
            pendingEvents: pending,
            acknowledgedEvents: acknowledgedCount,
            apiStatus: "healthy",
          })
        } catch (fallbackErr) {
          setStats((prev) => ({ ...prev, apiStatus: "error" }))
        }
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    
    // Listen for event acknowledgments to update count immediately
    const handleAcknowledged = () => {
      fetchStats()
    }
    window.addEventListener('eventAcknowledged', handleAcknowledged)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('eventAcknowledged', handleAcknowledged)
    }
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon
        const isHealthy = stat.title === "API Status" && stats.apiStatus === "healthy"
        return (
          <Card
            key={idx}
            className="group relative overflow-hidden bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="pt-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-1 transition-transform duration-200 group-hover:scale-105">
                    {stat.value}
                  </p>
                  {stat.title === "API Status" && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isHealthy ? "bg-green-500 animate-pulse" : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {isHealthy ? "All systems operational" : "Service unavailable"}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`${stat.color} p-3 rounded-xl bg-gradient-to-br from-background to-background/50 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

