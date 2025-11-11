"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Copy, Trash2, Eye, EyeOff, Plus, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface APIKey {
  id: string
  name: string
  key: string
  prefix: string
  created: Date
  lastUsed?: Date
  type: "production" | "test"
}

export default function APIKeyManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    // Load API keys from localStorage (in production, this would come from backend)
    const loadKeys = () => {
      try {
        const stored = localStorage.getItem("apiKeys")
        if (stored) {
          const keys = JSON.parse(stored).map((k: any) => ({
            ...k,
            created: new Date(k.created),
            lastUsed: k.lastUsed ? new Date(k.lastUsed) : undefined,
          }))
          setApiKeys(keys)
        } else {
          // Create a default demo key
          const defaultKey: APIKey = {
            id: "1",
            name: "Production Key",
            key: "sk_live_" + Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join(""),
            prefix: "sk_live",
            created: new Date(),
            type: "production",
          }
          setApiKeys([defaultKey])
          localStorage.setItem("apiKeys", JSON.stringify([defaultKey]))
        }
      } catch (err) {
        console.error("Error loading API keys:", err)
      }
    }

    loadKeys()
  }, [])

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(keyId)) {
        next.delete(keyId)
      } else {
        next.add(keyId)
      }
      return next
    })
  }

  const copyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const createNewKey = () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: `Test Key ${apiKeys.filter((k) => k.type === "test").length + 1}`,
      key: "sk_test_" + Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join(""),
      prefix: "sk_test",
      created: new Date(),
      type: "test",
    }
    const updated = [...apiKeys, newKey]
    setApiKeys(updated)
    localStorage.setItem("apiKeys", JSON.stringify(updated))
  }

  const revokeKey = (keyId: string) => {
    if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      const updated = apiKeys.filter((k) => k.id !== keyId)
      setApiKeys(updated)
      localStorage.setItem("apiKeys", JSON.stringify(updated))
    }
  }

  const maskKey = (key: string) => {
    const prefix = key.substring(0, key.indexOf("_") + 1)
    return prefix + "•".repeat(32)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground mt-1">Manage your API keys for authentication</p>
        </div>
        <Button onClick={createNewKey} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Key
        </Button>
      </div>

      {/* Rate Limits Info */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm font-medium mb-1">Requests per Hour</p>
              <p className="text-2xl font-bold">1,000</p>
              <p className="text-xs text-muted-foreground mt-1">Resets every hour</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm font-medium mb-1">Requests per Minute</p>
              <p className="text-2xl font-bold">20</p>
              <p className="text-xs text-muted-foreground mt-1">Per API key</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card className="bg-card border-border/50">
            <CardContent className="py-12 text-center">
              <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No API keys yet. Create your first key to get started.</p>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={apiKey.type === "production" ? "default" : "outline"}>
                          {apiKey.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {formatDistanceToNow(apiKey.created, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="gap-2"
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Show
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyKey(apiKey.key, apiKey.id)}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedKey === apiKey.id ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeKey(apiKey.id)}
                      className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50 font-mono text-sm">
                  {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                </div>
                {apiKey.lastUsed && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last used: {formatDistanceToNow(apiKey.lastUsed, { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Usage Instructions */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>How to Use API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Include your API key in the <code className="px-1.5 py-0.5 bg-muted rounded">Authorization</code> header:
          </p>
          <pre className="p-4 rounded-lg bg-muted/30 border border-border/50 overflow-x-auto">
            <code>Authorization: Bearer sk_live_your_key_here</code>
          </pre>
          <p className="pt-2">
            <strong className="text-foreground">Security Note:</strong> Never share your API keys publicly or commit
            them to version control. Keep production keys secure.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

