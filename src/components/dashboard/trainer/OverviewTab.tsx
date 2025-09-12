import { FiUser, FiActivity, FiDollarSign, FiTrendingUp, FiCalendar, FiBarChart2, FiClock, FiUsers } from 'react-icons/fi';
import StatsCard from './StatsCard';

interface TrainerStats {
  totalClients: number;
  activeWorkouts: number;
  completedSessions: number;
  monthlyRevenue: number;
  rating: number;
}

interface WorkoutSession {
  id: string;
  clientName: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface ClientSegment {
  type: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down';
  change: number;
}

interface Payment {
  id: number;
  trainerId: number;
  userEmail: string;
  month: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  amount: number;
}

interface OverviewTabProps {
  trainerStats: TrainerStats;
  upcomingSessions: WorkoutSession[];
  upcomingPayments: Payment[];
  clientSegments: ClientSegment[];
}

export default function OverviewTab({
  trainerStats,
  upcomingSessions,
  upcomingPayments,
  clientSegments
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Clients"
          value={trainerStats.totalClients}
          trend={{ value: "12%", isPositive: true }}
          trendLabel="vs last month"
          icon={<FiUser className="w-8 h-8 text-blue-600" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        
        <StatsCard
          title="Active Workouts"
          value={trainerStats.activeWorkouts}
          trend={{ value: "8%", isPositive: true }}
          trendLabel="vs last week"
          icon={<FiActivity className="w-8 h-8 text-green-600" />}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
          delay={0.1}
        />
        
        <StatsCard
          title="Monthly Revenue"
          value={`LKR ${trainerStats.monthlyRevenue.toLocaleString()}`}
          trend={{ value: "15%", isPositive: true }}
          trendLabel="vs last month"
          icon={<FiDollarSign className="w-8 h-8 text-purple-600" />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          delay={0.2}
        />
        
        <StatsCard
          title="Rating"
          value={`${trainerStats.rating}/5.0`}
          trendLabel={`${trainerStats.completedSessions} reviews`}
          icon={<FiTrendingUp className="w-8 h-8 text-yellow-600" />}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-600"
          delay={0.3}
        />
      </div>

      {/* Today's Schedule and Upcoming Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              <FiCalendar className="w-4 h-4 mr-2" />
              View Full Calendar
            </button>
          </div>
          <div className="h-80 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${session.status === 'upcoming' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      <FiClock className={`w-5 h-5 ${session.status === 'upcoming' ? 'text-blue-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{session.clientName}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${session.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{session.type} • {session.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{session.time}</p>
                    <p className="text-sm text-gray-500">{session.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Payments</h2>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              <FiDollarSign className="w-4 h-4 mr-2" />
              View All Transactions
            </button>
          </div>
          <div className="h-80 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-yellow-100">
                      <FiDollarSign className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{payment.userEmail}</p>
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                          Month {payment.month}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Last Payment: {new Date(payment.lastPaymentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">LKR {payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Due: {new Date(payment.nextPaymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Client Segments */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Client Segments</h2>
            <p className="text-gray-500 mt-1">Distribution of your client base</p>
          </div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
            <FiBarChart2 className="w-4 h-4 mr-2" />
            Detailed Analytics
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clientSegments.map((segment, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`px-2 py-1 text-xs rounded-full flex items-center ${segment.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {segment.trend === 'up' ? '↑' : '↓'} {segment.change}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{segment.type}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Clients</span>
                  <span className="font-medium text-gray-900">{segment.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${segment.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{segment.percentage}% of total</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <FiUser className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">New Client Registration</p>
                <p className="text-sm text-gray-500">John Doe started their fitness journey</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <FiActivity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Workout Completed</p>
                <p className="text-sm text-gray-500">Sarah completed her strength training session</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">5 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
} 