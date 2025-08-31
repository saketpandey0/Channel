// src/admin/components/layout/AdminLayout.tsx
import React, { useEffect, useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { getAdminDashboard, getCurrentAdmin } from '../../api/adminservice';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
    const [pendingReportsCount, setPendingReportsCount] = useState(0);

    const [adminUser, setAdminUser] = useState({
        name: 'Admin User',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    });

  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        const profile = await getCurrentAdmin();
        setAdminUser(profile.data);
        const result = await getAdminDashboard();
        if (result.success && result.data) {
          setPendingReportsCount(result.data.pendingReports);
        }
      } catch (error) {
        console.error('Failed to fetch pending reports count:', error);
      }
    };

    fetchPendingReports();
    
    const interval = setInterval(fetchPendingReports, 30000); 
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        adminUser={adminUser}
        onLogout={handleLogout}
        notificationCount={pendingReportsCount}
      />
      
      <div className="flex">
        <AdminSidebar 
          activeTab={activeTab}
          onTabChange={onTabChange}
          pendingReportsCount={pendingReportsCount}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;