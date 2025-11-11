"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle2, TrendingUp, Clock } from "lucide-react"
import { api } from "@/lib/api"

interface PerformanceMetrics {
  avgResponseTime: number
  successRate: number
  eventsPerMinute: number
}

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 0,
    successRate: 0,
    eventsPerMinute: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Calculate metrics from API calls
        const startTime = performance.now()
        await api.getStats()
        const endTime = performance.now()
        const responseTime = Math.round(endTime - startTime)
        
        // Get events to calculate rate
        const inbox = await api.getInbox({ limit: 100 })
        const eventsPerMinute = inbox.events.length > 0 ? Math.round((inbox.events.length / 60) * 10) / 10 : 0
        
        // Mock success rate (in production, this would come from backend analytics)
        const successRate = 99.9
        
        setMetrics({
          avgResponseTime: responseTime,
          successRate,
          eventsPerMinute,
        })
      } catch (err) {
        console.error("Error fetching metrics:", err)
        setMetrics({
          avgResponseTime: 0,
          successRate: 0,
          eventsPerMinute: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const metricsData = [
    {
      label: "Avg Response Time",
      value: `${metrics.avgResponseTime}ms`,
      target: 100,
      current: metrics.avgResponseTime,
      status: metrics.avgResponseTime < 100 ? "success" : "warning",
      icon: Clock,
      color: "green",
    },
    {
      label: "Success Rate",
      value: `${metrics.successRate}%`,
      target: 99.9,
      current: metrics.successRate,
      status: metrics.successRate >= 99.9 ? "success" : "warning",
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Events per Minute",
      value: metrics.eventsPerMinute.toFixed(1),
      target: 20,
      current: metrics.eventsPerMinute,
      status: "info",
      icon: TrendingUp,
      color: "blue",
    },
  ]

  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon
          const percentage = Math.min((metric.current / metric.target) * 100, 100)
          const isSuccess = metric.status === "success"
          
          return (
            <div
              key={index}
              className="p-4 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <Badge
                  className={
                    isSuccess
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : metric.status === "warning"
                      ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  }
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {metric.value}
                </Badge>
              </div>
              <div className="w-full bg-background rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full ${
                    isSuccess
                      ? "bg-green-500"
                      : metric.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: {metric.target}
                {metric.status === "success" ? " ✅" : ""}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

