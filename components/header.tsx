"use client"

import { Zap } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Zapier Triggers API
              </h1>
              <p className="text-xs text-muted-foreground">Event Management Dashboard</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

