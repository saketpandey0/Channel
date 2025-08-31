import { Search, Bell, Star } from "lucide-react"
import { Button, Input } from "../Shad"
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { PiSidebar } from "react-icons/pi";
import { AiOutlineSun } from "react-icons/ai";


interface TopNavigationProps {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  onToggleLeftSidebar: () => void
  onToggleRightSidebar: () => void
}


export function TopNavigation({ onToggleLeftSidebar, onToggleRightSidebar }: TopNavigationProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onToggleLeftSidebar} className="mr-2" title="Open sidebar">
            <PiSidebar className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Dashboards</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm font-medium">Default</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search" className="pl-10 w-64 bg-gray-50 border-0" />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘/</span>
          </div>

          <div className="flex items-center">
            <Button variant="ghost" size="sm">
              <AiOutlineSun className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <PiClockCounterClockwiseBold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={onToggleRightSidebar} className="mr-2" title="Open sidebar">
            <PiSidebar className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
