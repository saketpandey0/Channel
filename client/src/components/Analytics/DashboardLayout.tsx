import type React from "react"
import { useState } from "react"
import { TopNavigation } from "./Topbar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50 overflow-y-auto">

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
          onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
          />
        <main className="flex-1 overflow-auto no-scrollbar">
          <div className="flex">
            <div className="flex-1">{children}</div>
          </div>
        </main>
      </div>

    </div>
  )
}
