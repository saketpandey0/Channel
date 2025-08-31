// src/admin/components/layout/Sidebar.tsx
import React from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Home,
  Flag
} from 'lucide-react';
import type { AdminTab } from '../../types/admin';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  pendingReportsCount?: number;
}

const AdminSidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  pendingReportsCount = 0 
}) => {
  const tabs: AdminTab[] = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
    { id: 'users', name: 'Users', icon: Users, path: '/admin/users' },
    { id: 'stories', name: 'Stories', icon: FileText, path: '/admin/stories' },
    { id: 'reports', name: 'Reports', icon: AlertTriangle, path: '/admin/reports' },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, path: '/admin/analytics' },
    { id: 'moderation', name: 'Moderation', icon: Flag, path: '/admin/moderation' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <nav className="w-64 bg-white shadow-sm h-screen sticky top-0 border-r border-gray-200">
      <div className="p-4">
        {/* Navigation Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-900">Admin Panel</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </div>
                
                {/* Show notification badge for reports */}
                {tab.id === 'reports' && pendingReportsCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {pendingReportsCount > 99 ? '99+' : pendingReportsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Admin Panel v1.0
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminSidebar;