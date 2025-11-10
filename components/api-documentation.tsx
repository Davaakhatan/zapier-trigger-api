"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, ChevronDown } from "lucide-react"

export default function APIDocumentation() {
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedExample, setExpandedExample] = useState<string>("post-events")

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const endpoints = [
    {
      id: "post-events",
      method: "POST",
      path: "/v1/events",
      description: "Submit an event to trigger workflows",
      example: `curl -X POST http://localhost:8000/v1/events \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": {
      "orderId": "12345",
      "amount": 299.99,
      "customer": "John Doe"
    },
    "source": "payment-system",
    "tags": ["order", "payment"]
  }'`,
      pythonExample: `import requests

response = requests.post(
    "http://localhost:8000/v1/events",
    json={
        "payload": {
            "orderId": "12345",
            "amount": 299.99,
            "customer": "John Doe"
        },
        "source": "payment-system",
        "tags": ["order", "payment"]
    }
)
print(response.json())`,
      jsExample: `const response = await fetch("http://localhost:8000/v1/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    payload: {
      orderId: "12345",
      amount: 299.99,
      customer: "John Doe"
    },
    source: "payment-system",
    tags: ["order", "payment"]
  })
});
const data = await response.json();`,
      response: `{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "created",
  "timestamp": "2025-01-27T12:00:00Z",
  "message": "Event ingested successfully"
}`,
    },
    {
      id: "get-inbox",
      method: "GET",
      path: "/v1/events/inbox",
      description: "Retrieve undelivered events from your inbox",
      example: `curl -X GET "http://localhost:8000/v1/events/inbox?limit=10"`,
      pythonExample: `import requests

response = requests.get(
    "http://localhost:8000/v1/events/inbox",
    params={"limit": 10}
)
events = response.json()`,
      jsExample: `const response = await fetch("http://localhost:8000/v1/events/inbox?limit=10");
const events = await response.json();`,
      response: `{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-01-27T12:00:00Z",
      "payload": { ... },
      "source": "payment-system",
      "status": "pending"
    }
  ],
  "total": 12,
  "limit": 10,
  "offset": 0
}`,
    },
    {
      id: "ack-event",
      method: "POST",
      path: "/v1/events/{id}/ack",
      description: "Acknowledge receipt of an event",
      example: `curl -X POST "http://localhost:8000/v1/events/550e8400-e29b-41d4-a716-446655440000/ack"`,
      pythonExample: `import requests

response = requests.post(
    "http://localhost:8000/v1/events/550e8400-e29b-41d4-a716-446655440000/ack"
)
print(response.json())`,
      jsExample: `const response = await fetch(
  "http://localhost:8000/v1/events/550e8400-e29b-41d4-a716-446655440000/ack",
  { method: "POST" }
);
const data = await response.json();`,
      response: `{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "acknowledged",
  "message": "Event acknowledged successfully"
}`,
    },
  ]

  const errorCodes = [
    { code: 400, message: "Bad Request", description: "Invalid request parameters or malformed JSON" },
    { code: 401, message: "Unauthorized", description: "Missing or invalid API key" },
    { code: 404, message: "Not Found", description: "Event not found" },
    { code: 429, message: "Too Many Requests", description: "Rate limit exceeded" },
    { code: 500, message: "Internal Server Error", description: "Server error, retry with exponential backoff" },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Integrate the Triggers API in 3 steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 1: API Endpoint</h4>
              <p className="text-sm text-muted-foreground">
                The API is available at <code className="text-xs">http://localhost:8000</code> (or your deployed URL).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 2: Send Events</h4>
              <p className="text-sm text-muted-foreground">
                Send event data to the <code className="text-xs">/v1/events</code> endpoint with your application context.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 3: Monitor & Manage</h4>
              <p className="text-sm text-muted-foreground">
                Track delivery status and manage events from your dashboard or via the API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id} className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm text-primary font-mono">{endpoint.path}</code>
                  </div>
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedExample(expandedExample === endpoint.id ? "" : endpoint.id)}
                  className="gap-2"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedExample === endpoint.id ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>
            </CardHeader>

            {expandedExample === endpoint.id && (
              <CardContent className="space-y-4 pt-4 border-t border-border">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">cURL Example</h4>
                  <div className="relative">
                    <pre className="bg-background rounded p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
                      {endpoint.example}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 gap-2 bg-transparent"
                      onClick={() => copyToClipboard(endpoint.example, `${endpoint.id}-curl`)}
                    >
                      {copied === `${endpoint.id}-curl` ? (
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
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Python Example</h4>
                  <div className="relative">
                    <pre className="bg-background rounded p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
                      {endpoint.pythonExample}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 gap-2 bg-transparent"
                      onClick={() => copyToClipboard(endpoint.pythonExample, `${endpoint.id}-py`)}
                    >
                      {copied === `${endpoint.id}-py` ? (
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
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">JavaScript Example</h4>
                  <div className="relative">
                    <pre className="bg-background rounded p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
                      {endpoint.jsExample}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 gap-2 bg-transparent"
                      onClick={() => copyToClipboard(endpoint.jsExample, `${endpoint.id}-js`)}
                    >
                      {copied === `${endpoint.id}-js` ? (
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
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Response</h4>
                  <pre className="bg-background rounded p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
                    {endpoint.response}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
          <CardDescription>Common HTTP status codes and troubleshooting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {errorCodes.map((error) => (
              <div key={error.code} className="flex gap-4 pb-3 last:pb-0 border-b border-border last:border-0">
                <div className="min-w-fit">
                  <Badge variant="outline" className="font-mono">
                    {error.code}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{error.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{error.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

