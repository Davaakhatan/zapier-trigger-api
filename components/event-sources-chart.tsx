"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { api } from "@/lib/api"

interface SourceData {
  name: string
  value: number
  percentage: number
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(45, 93%, 47%)",
  "hsl(142, 76%, 36%)",
  "hsl(262, 83%, 58%)",
  "hsl(0, 72%, 51%)",
]

export default function EventSourcesChart() {
  const [data, setData] = useState<SourceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSourceData = async () => {
      try {
        const inbox = await api.getInbox({ limit: 100 })
        
        // Count events by source
        const sourceCounts: Record<string, number> = {}
        inbox.events.forEach((event) => {
          const source = event.source || "unknown"
          sourceCounts[source] = (sourceCounts[source] || 0) + 1
        })
        
        // Convert to array and calculate percentages
        const total = inbox.events.length || 1
        const sourceData: SourceData[] = Object.entries(sourceCounts)
          .map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value / total) * 100),
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5) // Top 5 sources
        
        setData(sourceData)
      } catch (err) {
        console.error("Error fetching source data:", err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchSourceData()
    const interval = setInterval(fetchSourceData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Events by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Events by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No source data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          Events by Source
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="flex flex-col justify-center space-y-3">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.value}</Badge>
                  <span className="text-muted-foreground text-xs">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

