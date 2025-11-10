"use client"

import { useState } from "react"
import EventInbox from "@/components/event-inbox"
import APIDocumentation from "@/components/api-documentation"
import QuickStats from "@/components/quick-stats"
import Header from "@/components/header"
import Navigation from "@/components/navigation"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-auto">
        {activeTab === "dashboard" && (
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Triggers API Dashboard</h1>
              <p className="text-muted-foreground">Real-time event ingestion and workflow management</p>
            </div>

            <QuickStats />
          </div>
        )}

        {activeTab === "inbox" && (
          <div className="p-8 max-w-7xl mx-auto">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold text-foreground">Event Inbox</h1>
              <p className="text-muted-foreground">View and manage incoming events</p>
            </div>
            <EventInbox />
          </div>
        )}

        {activeTab === "docs" && (
          <div className="p-8 max-w-4xl mx-auto">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
              <p className="text-muted-foreground">Integration guide and reference</p>
            </div>
            <APIDocumentation />
          </div>
        )}
      </main>
    </div>
  )
}

