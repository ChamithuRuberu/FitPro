'use client';

import { useState, useEffect } from 'react';
import { FiActivity, FiUser, FiCheckCircle, FiDollarSign, FiTarget, FiCalendar, FiUsers, FiSettings, FiShield, FiBuilding } from 'react-icons/fi';
import { getActivityAudit, ActivityAuditItem } from '@/lib/api';

interface ActivitySectionProps {
  title?: string;
  showViewAllButton?: boolean;
  maxItems?: number;
  adminType?: 'trainer' | 'super-admin' | 'gym-admin';
}

export default function ActivitySection({ 
  title = "Recent Activity", 
  showViewAllButton = true,
  maxItems = 5,
  adminType = 'trainer'
}: ActivitySectionProps) {
  const [recentActivities, setRecentActivities] = useState<ActivityAuditItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      console.log(`📊 ===== FETCHING ACTIVITIES FOR ${adminType.toUpperCase()} =====`);
      setIsLoadingActivities(true);
      
      try {
        const result = await getActivityAudit(7); // Fetch last 7 days
        console.log(`📊 ${adminType} activity audit result:`, result);
        
        if (result.success && result.data) {
          const activities = result.data.activities || [];
          console.log(`📊 ${adminType} processed activities:`, activities);
          setRecentActivities(activities);
        } else {
          console.error(`📊 ❌ Failed to fetch ${adminType} activities:`, result.error);
          setRecentActivities([]);
        }
      } catch (error) {
        console.error(`📊 ❌ Error fetching ${adminType} activities:`, error);
        setRecentActivities([]);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchRecentActivities();
  }, [adminType]);

  // Helper function to get activity icon and color
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'client_registration':
        return { icon: FiUser, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'workout_completed':
        return { icon: FiCheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'payment_received':
        return { icon: FiDollarSign, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'program_created':
        return { icon: FiActivity, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'session_scheduled':
        return { icon: FiCalendar, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
      case 'goal_achieved':
        return { icon: FiTarget, color: 'text-pink-600', bgColor: 'bg-pink-100' };
      case 'client_action':
        return { icon: FiUsers, color: 'text-cyan-600', bgColor: 'bg-cyan-100' };
      case 'gym_registration':
        return { icon: FiBuilding, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      case 'admin_action':
        return { icon: FiShield, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'system_action':
        return { icon: FiSettings, color: 'text-gray-600', bgColor: 'bg-gray-100' };
      case 'api_request':
        return { icon: FiActivity, color: 'text-gray-600', bgColor: 'bg-gray-100' };
      default:
        return { icon: FiActivity, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Helper function to format timestamp
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes} minutes ago` : 'Just now';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #bcbcbc;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }
      `}</style>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {showViewAllButton && (
          <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
            <FiActivity className="w-4 h-4 mr-2" />
            View All Activity
          </button>
        )}
      </div>
      
      {isLoadingActivities ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500">Loading activities...</span>
        </div>
      ) : (
        <div className="h-80 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.slice(0, 7).map((activity) => {
                const { icon: IconComponent, color, bgColor } = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${bgColor}`}>
                        <IconComponent className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                          {activity.actorName && ` by ${activity.actorName}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FiActivity className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No recent activity</p>
                <p className="text-sm">Activity will appear here as users interact with the platform</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
