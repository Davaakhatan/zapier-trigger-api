"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Inbox, BookOpen } from "lucide-react"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "docs", label: "API Docs", icon: BookOpen },
  ]

  return (
    <nav className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-none border-b-2 border-transparent transition-all duration-200 ${
                  isActive
                    ? "border-primary text-foreground bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                )}
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

