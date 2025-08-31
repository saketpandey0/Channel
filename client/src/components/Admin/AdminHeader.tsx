import React from 'react';
import { Settings, Bell, User, LogOut } from 'lucide-react';
import {motion} from "motion/react";
import { Link } from 'react-router-dom';

interface HeaderProps {
  adminUser?: {
    name: string;
    avatar?: string;
    role: string;
  };
  onLogout?: () => void;
  notificationCount?: number;
}

const AdminHeader: React.FC<HeaderProps> = ({ 
  adminUser = { name: 'Admin User', role: 'ADMIN' },
  onLogout,
  notificationCount = 0
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            <Link to={"/"} className="flex cursor-pointer items-center gap-1">
                <motion.img
                    whileHover={{
                    rotate: [0, -5, 5, -5, 5, 0],
                    transition: {
                        duration: 1,
                        ease: "easeInOut",
                        repeat: 5,
                        repeatType: "reverse",
                    },
                    }}
                    src={
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4k8aHy_xQjnU20kJs4iZnrM3hfjP6-ZzczGkrNzlvIzpGPC__Z831DTw&s"
                    }
                    alt="Logo"
                    width={300}
                    height={200}
                    className="size-10 rounded-full"
                />
                <span className="text-foreground font-Bodoni hidden text-lg font-bold tracking-tight text-shadow-lg hover:text-shadow-lg/20 md:block md:text-2xl">
                    Channel
                </span>
            </Link>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="h-5 w-5" />
            </button>

            <div className="relative flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                {adminUser.avatar ? (
                  <img 
                    src={adminUser.avatar} 
                    alt={adminUser.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-700">{adminUser.name}</div>
                  <div className="text-xs text-gray-500">{adminUser.role}</div>
                </div>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;