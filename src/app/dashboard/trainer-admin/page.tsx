'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiActivity, FiTrendingUp, FiPackage, FiDollarSign, FiUser, FiPlus, FiLogOut } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { getSession, checkTrainerAuth, logoutTrainer } from '@/actions';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

interface TrainerData {
  email: string;
  fullName: string;
  city: string;
  status: string;
  trainerId: string;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  status: string;
  lastWorkout: string;
}

interface NutritionItem {
  id: string;
  name: string;
  timing: string;
  dosage: string;
  benefits: string[];
}

export default function TrainerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'workouts' | 'nutrition' | 'progress'>('overview');
  const [trainerData, setTrainerData] = useState<TrainerData | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [nutritionItems, setNutritionItems] = useState<NutritionItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        const session = await getSession();
        if (!session.success || !session.data) {
          toast.error('Please log in to access the dashboard');
          router.push('/login');
          return;
        }

        const trainerAuth = await checkTrainerAuth();
        if (!trainerAuth.success) {
          toast.error('Unauthorized access');
          router.push('/login');
          return;
        }

        // Set trainer data from session
        setTrainerData({
          email: session.data.email,
          fullName: session.data.fullName || '',
          city: session.data.city || '',
          status: session.data.userStatus || 'Active',
          trainerId: session.data.trainerId || '',
        });

        // Fetch additional data based on active tab
        await fetchTabData(activeTab);
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Failed to load dashboard data');
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
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {getGreeting()}, {trainerData?.fullName}
            </h1>
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-4">
              {['overview', 'clients', 'workouts', 'nutrition', 'progress'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === tab
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm font-medium">
                {trainerData?.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-lg font-semibold text-gray-900">{clients.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Workouts</p>
                    <p className="text-lg font-semibold text-gray-900">0</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <FiActivity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{trainerData?.city}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <FiPackage className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Clients</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <div key={client.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm font-medium">
                          {client.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          Last Workout: {client.lastWorkout}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No clients assigned yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Workout Programs</h2>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                Workout management coming soon
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Nutrition Plans</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {nutritionItems.length > 0 ? (
                nutritionItems.map((item) => (
                  <div key={item.id} className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Timing</p>
                        <p className="font-medium">{item.timing}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dosage</p>
                        <p className="font-medium">{item.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Benefits</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.benefits.map((benefit, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-500">
                  No nutrition plans available yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="text-center text-gray-500 p-6">
            Progress tracking coming soon
          </div>
        )}
      </main>
    </div>
  );
}
