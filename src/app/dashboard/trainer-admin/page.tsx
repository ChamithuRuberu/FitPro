'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiActivity, FiTrendingUp, FiPackage, FiDollarSign, FiUser, FiPlus, FiLogOut, FiClock, FiBarChart2, FiUsers, FiCheckCircle, FiAward } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { getSession, checkTrainerAuth, logoutTrainer } from '@/actions';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

interface TrainerData {
  email: string;
  fullName: string;
  city: string;
  status: string;
  trainerId: string;
  servicePeriod: string;
  weight: string;
  height: string;
  profile: string;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  status: string;
  lastWorkout: string;
  progress: number;
  programType: string;
}

interface NutritionItem {
  id: string;
  name: string;
  timing: string;
  dosage: string;
  benefits: string[];
}

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

export default function TrainerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'workouts' | 'nutrition' | 'progress'>('overview');
  const [trainerData, setTrainerData] = useState<TrainerData | null>(null);
  const [trainerStats, setTrainerStats] = useState<TrainerStats>({
    totalClients: 12,
    activeWorkouts: 8,
    completedSessions: 45,
    monthlyRevenue: 2500,
    rating: 4.8
  });
  const [clients, setClients] = useState<ClientData[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'Active',
      lastWorkout: '2024-03-10',
      progress: 75,
      programType: 'Weight Loss'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'Active',
      lastWorkout: '2024-03-09',
      progress: 60,
      programType: 'Muscle Gain'
    }
  ]);
  const [nutritionItems, setNutritionItems] = useState<NutritionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientSegments] = useState<ClientSegment[]>([
    { type: 'Weight Loss', count: 5, percentage: 42, trend: 'up', change: 8 },
    { type: 'Muscle Gain', count: 4, percentage: 33, trend: 'up', change: 5 },
    { type: 'General Fitness', count: 2, percentage: 17, trend: 'down', change: 2 },
    { type: 'Sports Training', count: 1, percentage: 8, trend: 'up', change: 1 }
  ]);
  const [upcomingSessions] = useState<WorkoutSession[]>([
    {
      id: '1',
      clientName: 'John Doe',
      type: 'Strength Training',
      date: '2024-03-15',
      time: '09:00 AM',
      duration: '60 min',
      status: 'upcoming'
    },
    {
      id: '2',
      clientName: 'Sarah Wilson',
      type: 'HIIT',
      date: '2024-03-15',
      time: '11:00 AM',
      duration: '45 min',
      status: 'upcoming'
    },
    {
      id: '3',
      clientName: 'Mike Johnson',
      type: 'Cardio',
      date: '2024-03-14',
      time: '02:00 PM',
      duration: '30 min',
      status: 'completed'
    }
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log('Checking trainer dashboard auth...');
        
        const session = await getSession();
        console.log('Dashboard session:', session);

        if (!session.success || !session.data) {
          console.log('No session found');
          toast.error('Please log in to access the dashboard');
          router.push('/login');
          return;
        }

        // Check if we have the necessary session data
        if (!session.data.token || !session.data.role || session.data.role !== 'ROLE_TRAINER') {
          console.log('Invalid session data:', session.data);
          toast.error('Invalid session data');
          router.push('/login');
          return;
        }

        const trainerAuth = await checkTrainerAuth();
        console.log('Trainer auth result:', trainerAuth);

        if (!trainerAuth.success) {
          console.log('Trainer auth failed');
          toast.error('Unauthorized access');
          router.push('/login');
          return;
        }

        // Set trainer data from auth response
        const trainerData = {
          email: session.data.email || '',
          fullName: session.data.fullName || session.data.username || '',
          city: session.data.city || '',
          status: session.data.status || 'Active',
          trainerId: session.data.trainerId || session.data.userId || '',
          servicePeriod: session.data.servicePeriod || '0',
          weight: session.data.weight || '',
          height: session.data.height || '',
          profile: session.data.profile || ''
        };

        console.log('Setting trainer data:', trainerData);
        setTrainerData(trainerData);

        // Fetch additional data based on active tab
        await fetchTabData(activeTab);
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Failed to load dashboard data');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, activeTab]);

  const fetchTabData = async (tab: string) => {
    try {
      switch (tab) {
        case 'clients':
          // Fetch clients data
          break;
        case 'workouts':
          // Fetch workouts data
          break;
        case 'nutrition':
          // Fetch nutrition data
          break;
        case 'progress':
          // Fetch progress data
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
      toast.error(`Failed to load ${tab} data`);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logoutTrainer();
      if (result.success) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Dashboard Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                {getGreeting()}, {trainerData?.fullName}
              </h1>
              <p className="text-blue-100 text-sm">
                Trainer ID: {trainerData?.trainerId} | {trainerData?.city}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-blue-100">Status</p>
                <span className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium">
                  {trainerData?.status}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-between items-center mt-8">
            <div className="flex space-x-2">
              {['overview', 'clients', 'workouts', 'nutrition', 'progress'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{trainerStats.totalClients}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm">↑ 12%</span>
                      <span className="text-gray-500 text-sm ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-full">
                    <FiUser className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Workouts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{trainerStats.activeWorkouts}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm">↑ 8%</span>
                      <span className="text-gray-500 text-sm ml-2">vs last week</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-full">
                    <FiActivity className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${trainerStats.monthlyRevenue}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm">↑ 15%</span>
                      <span className="text-gray-500 text-sm ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-full">
                    <FiDollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{trainerStats.rating}/5.0</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="text-gray-500 text-sm ml-2">{trainerStats.completedSessions} reviews</span>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-full">
                    <FiTrendingUp className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  View Full Calendar
                </button>
              </div>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        session.status === 'upcoming' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <FiClock className={`w-5 h-5 ${
                          session.status === 'upcoming' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{session.clientName}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            session.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
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
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center ${
                        segment.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
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

            {/* Trainer Profile */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Trainer Profile</h2>
                  <p className="text-gray-500 mt-1">Your professional information</p>
                </div>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                  <FiUser className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {trainerData?.fullName?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{trainerData?.fullName}</h3>
                      <p className="text-sm text-gray-500">{trainerData?.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{trainerData?.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Experience</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{trainerData?.servicePeriod} years</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Specializations</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Weight Training</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">HIIT</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Nutrition</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Certifications</p>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <FiAward className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">Certified Personal Trainer (CPT)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiAward className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">Nutrition Specialist</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Profile Description</p>
                    <p className="text-gray-700 mt-1">{trainerData?.profile || 'Dedicated fitness professional with expertise in strength training and nutrition coaching.'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm font-medium text-gray-700">{trainerData?.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Physical Stats</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Height</p>
                        <p className="text-sm font-medium text-gray-900">{trainerData?.height} cm</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Weight</p>
                        <p className="text-sm font-medium text-gray-900">{trainerData?.weight} kg</p>
                      </div>
                    </div>
                  </div>
                </div>
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
        )}

        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Clients</h2>
                <p className="text-gray-500 mt-1">Manage and track your clients' progress</p>
              </div>
              <button className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                <FiPlus className="w-5 h-5 mr-2" />
                Add New Client
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-semibold text-blue-600">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Program</p>
                          <p className="text-sm font-semibold text-gray-900">{client.programType}</p>
                        </div>
                        <div className="w-48">
                          <p className="text-sm font-medium text-gray-500 mb-2">Progress</p>
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                  {client.progress}%
                                </span>
                              </div>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                              <div
                                style={{ width: `${client.progress}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                              />
                            </div>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          client.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FiUser className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No clients assigned yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start by adding your first client</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Workout Programs</h2>
                <p className="text-gray-500 mt-1">Manage your training programs</p>
              </div>
              <button className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                <FiPlus className="w-5 h-5 mr-2" />
                Create Program
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Weight Loss Elite',
                    type: 'Weight Loss',
                    duration: '12 weeks',
                    sessions: 36,
                    intensity: 'High',
                    equipment: ['Dumbbells', 'Resistance Bands', 'Treadmill'],
                    activeClients: 8
                  },
                  {
                    name: 'Strength Builder Pro',
                    type: 'Muscle Gain',
                    duration: '16 weeks',
                    sessions: 48,
                    intensity: 'High',
                    equipment: ['Barbells', 'Power Rack', 'Free Weights'],
                    activeClients: 6
                  },
                  {
                    name: 'HIIT Transformation',
                    type: 'Fat Loss',
                    duration: '8 weeks',
                    sessions: 24,
                    intensity: 'Very High',
                    equipment: ['Kettlebells', 'Jump Rope', 'Body Weight'],
                    activeClients: 10
                  }
                ].map((program, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {program.type}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">{program.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sessions</p>
                          <p className="font-medium text-gray-900">{program.sessions}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Equipment</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {program.equipment.map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Active Clients</span>
                          <span className="font-medium text-gray-900">{program.activeClients}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Nutrition Plans</h2>
              <p className="text-gray-500 mt-1">Manage client nutrition and supplements</p>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                Nutrition management coming soon
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
              <p className="text-gray-500 mt-1">Monitor client achievements and milestones</p>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                Progress tracking features coming soon
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
