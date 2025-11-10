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

      <main className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-muted/20">
        {activeTab === "dashboard" && (
          <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                Triggers API Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">Real-time event ingestion and workflow management</p>
            </div>

            <QuickStats />
          </div>
        )}

        {activeTab === "inbox" && (
          <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in-50 duration-500">
            <div className="space-y-3 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                Event Inbox
              </h1>
              <p className="text-muted-foreground text-lg">View and manage incoming events</p>
            </div>
            <EventInbox />
          </div>
        )}

        {activeTab === "docs" && (
          <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto animate-in fade-in-50 duration-500">
            <div className="space-y-3 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                API Documentation
              </h1>
              <p className="text-muted-foreground text-lg">Integration guide and reference</p>
            </div>
            <APIDocumentation />
          </div>
        )}
      </main>
    </div>
  )
}

