"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { api } from "@/lib/api"
import { format, subHours } from "date-fns"

interface TrendDataPoint {
  time: string
  total: number
  pending: number
  acknowledged: number
}

export default function EventTrendsChart() {
  const [data, setData] = useState<TrendDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        // For now, we'll generate mock data based on current stats
        // In production, this would come from a backend analytics endpoint
        const stats = await api.getStats()
        const inbox = await api.getInbox({ limit: 100 })
        
        // Generate 24-hour trend data (mock for now)
        const now = new Date()
        const trendData: TrendDataPoint[] = []
        
        for (let i = 23; i >= 0; i--) {
          const hour = subHours(now, i)
          // Simulate data with some variation
          const baseTotal = stats.total / 24
          const basePending = stats.pending / 24
          const baseAcknowledged = stats.acknowledged / 24
          
          // Add some realistic variation
          const variation = 0.7 + Math.random() * 0.6 // 0.7 to 1.3
          
          trendData.push({
            time: format(hour, "HH:mm"),
            total: Math.round(baseTotal * variation),
            pending: Math.round(basePending * variation),
            acknowledged: Math.round(baseAcknowledged * variation),
          })
        }
        
        setData(trendData)
      } catch (err) {
        console.error("Error fetching trend data:", err)
        // Generate empty data on error
        const now = new Date()
        const emptyData: TrendDataPoint[] = []
        for (let i = 23; i >= 0; i--) {
          const hour = subHours(now, i)
          emptyData.push({
            time: format(hour, "HH:mm"),
            total: 0,
            pending: 0,
            acknowledged: 0,
          })
        }
        setData(emptyData)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
    const interval = setInterval(fetchTrendData, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Event Trends (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Event Trends (Last 24 Hours)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Total Events"
            />
            <Line 
              type="monotone" 
              dataKey="pending" 
              stroke="hsl(45, 93%, 47%)" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Pending"
            />
            <Line 
              type="monotone" 
              dataKey="acknowledged" 
              stroke="hsl(142, 76%, 36%)" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Acknowledged"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

