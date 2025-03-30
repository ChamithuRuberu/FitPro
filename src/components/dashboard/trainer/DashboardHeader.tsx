import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { removeCookie } from '@/lib/api';
import toast from 'react-hot-toast';

interface TrainerData {
  fullName: string;
  trainerId: string;
  city: string;
  status: string;
}

interface DashboardHeaderProps {
  trainerData: TrainerData;
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'clients' | 'nutrition' | 'progress') => void;
}

export default function DashboardHeader({ 
  trainerData, 
  activeTab, 
  setActiveTab 
}: DashboardHeaderProps) {
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  const handleLogout = () => {
    try {
      // Clear all cookies
      removeCookie('token');
      removeCookie('refresh_token');
      removeCookie('trainerId');
      removeCookie('fullName');
      removeCookie('email');
      removeCookie('city');
      removeCookie('status');
      
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
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
            {['overview', 'clients', 'nutrition', 'progress'].map((tab) => (
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
  );
} 