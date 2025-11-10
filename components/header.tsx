"use client"

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Zapier Triggers API</h1>
            <p className="text-sm text-muted-foreground">Event Management Dashboard</p>
          </div>
        </div>
      </div>
    </header>
  )
}

