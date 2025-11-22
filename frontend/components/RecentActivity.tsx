'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: 'api_call' | 'top_up' | 'agent_deploy';
  description: string;
  amount?: number;
  timestamp: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock activities - replace with actual API call
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'api_call',
        description: 'Called Weather API',
        amount: 0.0001,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: '2',
        type: 'api_call',
        description: 'Called Crypto Price Data',
        amount: 0.0001,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '3',
        type: 'top_up',
        description: 'Topped up wallet',
        amount: 10,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'api_call':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'top_up':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'agent_deploy':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'api_call':
        return 'border-[#0d6efd]';
      case 'top_up':
        return 'border-[#198754]';
      case 'agent_deploy':
        return 'border-[#ffc107]';
      default:
        return 'border-[#e9ecef]';
    }
  };

  if (loading) {
    return (
      <div className="retro-card rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-[#212529] mb-4 sm:mb-6">Recent Activity</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 sm:h-20 retro-card rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="retro-card rounded-lg p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-[#212529]">Recent Activity</h3>
        <button className="text-xs sm:text-sm text-[#0d6efd] hover:text-[#0b5ed7] font-semibold underline">
          View All
        </button>
      </div>
      {activities.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-[#6c757d] text-sm sm:text-base">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 sm:p-4 retro-card rounded-lg hover:shadow-sm transition-all duration-200">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center retro-card border ${getColor(activity.type)} flex-shrink-0`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[#212529] truncate">{activity.description}</p>
                <p className="text-xs text-[#6c757d] mt-0.5">{formatTime(activity.timestamp)}</p>
              </div>
              {activity.amount && (
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs sm:text-sm font-semibold ${activity.type === 'top_up' ? 'text-[#198754]' : 'text-red-600'}`}>
                    {activity.type === 'top_up' ? '+' : '-'}${activity.amount.toFixed(4)}
                  </p>
                  <p className="text-xs text-[#6c757d]">USDC</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

