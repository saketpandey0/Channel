// src/admin/components/analytics/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Download, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import StatCard from '../common/StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { AnalyticsService } from '../../services';
import { Analytics, AdvancedAnalytics } from '../../types';

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeframeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last year', value: '1y' },
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [basicResult, advancedResult] = await Promise.all([
        AnalyticsService.getAnalytics(),
        AnalyticsService.getAdvancedAnalytics(timeframe)
      ]);

      if (basicResult.success && basicResult.data) {
        setAnalytics(basicResult.data);
      }

      if (advancedResult.success && advancedResult.data) {
        setAdvancedAnalytics(advancedResult.data);
      }

      if (!basicResult.success) {
        setError(basicResult.error || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      setError(err.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const handleExportReport = async () => {
    try {
      const blob = await AnalyticsService.exportAnalyticsReport(timeframe, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert('Failed to export report');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchAnalytics}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex space-x-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button 
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={analytics.users.total}
            icon={BarChart3}
            color="blue"
          />
          <StatCard 
            title="Total Stories" 
            value={analytics.stories.total}
            icon={BarChart3}
            color="green"
          />
          <StatCard 
            title="Total Views" 
            value={analytics.stories.totalViews}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard 
            title="Total Claps" 
            value={analytics.stories.totalClaps}
            icon={TrendingUp}
            color="red"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Chart visualization would be implemented here</p>
                <p className="text-sm">Consider using recharts or Chart.js</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Content</h3>
            {advancedAnalytics?.topStories ? (
              <div className="space-y-3">
                {advancedAnalytics.topStories.slice(0, 3).map((story, index) => (
                  <div key={story.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {index + 1}. {story.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        by @{story.author.username}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {story.viewCount.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p>No data available</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Metrics</h3>
            {analytics?.engagement ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active readers</span>
                  <span className="text-sm font-medium">{analytics.engagement.active_readers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. reading time</span>
                  <span className="text-sm font-medium">{Math.round(analytics.engagement.avg_reading_time)} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. progress</span>
                  <span className="text-sm font-medium">{Math.round(analytics.engagement.avg_progress * 100)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <p>No engagement data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;