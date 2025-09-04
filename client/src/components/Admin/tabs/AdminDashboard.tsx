import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Activity, FileText, AlertTriangle } from 'lucide-react';
import StatCard from '../StatCard';
import LoadingSpinner from '../LoadingSkeleton';
import { getAdminDashboard } from '../../../services/adminservice';  
import type { DashboardStats } from '../../../types/admin';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAdminDashboard();
      if (result.success && result.data) {
        setStats(result.data);
        setLastRefresh(new Date());
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      setError(err.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading && !stats) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            change={12} 
            icon={Users}
            color="blue"
            loading={loading}
          />
          <StatCard 
            title="Active Users" 
            value={stats.activeUsers} 
            change={8} 
            icon={Activity}
            color="green"
            loading={loading}
          />
          <StatCard 
            title="Published Stories" 
            value={stats.publishedStories} 
            change={15} 
            icon={FileText}
            color="purple"
            loading={loading}
          />
          <StatCard 
            title="Pending Reports" 
            value={stats.pendingReports} 
            change={-5} 
            icon={AlertTriangle}
            color="red"
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;