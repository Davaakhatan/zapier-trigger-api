"use client"

import { Button } from "@/components/ui/button"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            onClick={() => setActiveTab("dashboard")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === "inbox" ? "default" : "ghost"}
            onClick={() => setActiveTab("inbox")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Inbox
          </Button>
          <Button
            variant={activeTab === "docs" ? "default" : "ghost"}
            onClick={() => setActiveTab("docs")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            API Docs
          </Button>
        </div>
      </div>
    </nav>
  )
}

