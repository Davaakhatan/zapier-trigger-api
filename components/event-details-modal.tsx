"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Copy, Check, CheckCircle2, RefreshCw, Clock } from "lucide-react"
import { EventItem } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

interface EventDetailsModalProps {
  event: EventItem | null
  onClose: () => void
  onAcknowledge?: (eventId: string) => Promise<void>
  acknowledging?: string | null
}

export default function EventDetailsModal({
  event,
  onClose,
  onAcknowledge,
  acknowledging,
}: EventDetailsModalProps) {
  const [copied, setCopied] = useState(false)

  if (!event) return null

  const copyToClipboard = (text: any) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-card border-border/50 shadow-2xl">
        <CardContent className="p-6 overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Event Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Event Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1.5">Event ID</p>
              <p className="text-sm font-semibold text-foreground font-mono break-all">
                {event.id}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1.5">Status</p>
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
            {event.source && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1.5">Source</p>
                <Badge variant="outline" className="text-xs">
                  {event.source}
                </Badge>
              </div>
            )}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1.5">Timestamp</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payload */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Event Payload</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(event.payload)}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
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

          {/* Actions */}
          {event.status === "pending" && onAcknowledge && (
            <div className="flex gap-2 pt-4 border-t border-border/50">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAcknowledge(event.id)}
                disabled={acknowledging === event.id}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
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
        </CardContent>
      </Card>
    </div>
  )
}

