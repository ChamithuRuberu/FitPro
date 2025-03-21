'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthCheck } from '@/components/dashboard/trainer/hooks/useAuthCheck';
import DashboardHeader from '@/components/dashboard/trainer/DashboardHeader';
import OverviewTab from '@/components/dashboard/trainer/OverviewTab';
import ClientsTab from '@/components/dashboard/trainer/ClientsTab';
import ClientPlanModal from '@/components/dashboard/trainer/ClientPlanModal';
import { getTrainerClients } from '@/lib/api';
import toast from 'react-hot-toast';

interface ClientSummary {
  id: string;
  name: string;
  email: string;
  progress: number;
  nextSession: string;
  program: string;
  status?: string;
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

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weight: string;
  notes?: string;
}

interface ClientWorkoutPlan {
  id: string;
  type: keyof typeof workoutExercises;
  exercises: WorkoutExercise[];
  day: string;
  startTime: string;
  duration: number; // in minutes
  notes?: string;
}

interface MealPlan {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  time: string;
  items: {
    name: string;
    portion: string;
    calories: number;
  }[];
  category?: string;
}

const workoutExercises = {
  Legs: ['Squat', 'Leg Press', 'Leg Extension', 'Leg Curls', 'Calf Raises'],
  Back: ['Pull-ups', 'Deadlifts', 'Bent Over Rows', 'Lat Pulldowns', 'Face Pulls'],
  Chest: ['Bench Press', 'Incline Press', 'Chest Flyes', 'Push-ups', 'Dips'],
  Arms: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Skull Crushers', 'Preacher Curls'],
  Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises', 'Reverse Flyes', 'Shrugs'],
  Core: ['Planks', 'Crunches', 'Russian Twists', 'Leg Raises', 'Wood Chops']
};

export default function TrainerDashboard() {
  const { loading, trainerData } = useAuthCheck();
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'nutrition' | 'progress'>('overview');
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  
  const [trainerStats, setTrainerStats] = useState({
    totalClients: 12,
    activeWorkouts: 8,
    completedSessions: 45,
    monthlyRevenue: 2500,
    rating: 4.8
  });
  
  const [clients, setClients] = useState<ClientSummary[]>([
    {
      id: '1',
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      progress: 75,
      nextSession: '2024-03-20 10:00 AM',
      program: 'Weight Loss',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      progress: 60,
      nextSession: '2024-03-21 11:00 AM',
      program: 'Muscle Gain',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Sarah Davis',
      email: 'sarah.d@example.com',
      progress: 45,
      nextSession: '2024-03-22 09:00 AM',
      program: 'General Fitness',
      status: 'Active'
    }
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
  
  const [upcomingPayments] = useState([
    {
      id: '1',
      clientName: 'Emma Wilson',
      amount: 120,
      dueDate: '2024-03-18',
      packageType: 'Monthly Subscription',
      status: 'pending'
    },
    {
      id: '2',
      clientName: 'Michael Brown',
      amount: 65,
      dueDate: '2024-03-20',
      packageType: 'Personal Training',
      status: 'pending'
    },
    {
      id: '3',
      clientName: 'Sarah Davis',
      amount: 250,
      dueDate: '2024-03-15',
      packageType: 'Quarterly Plan',
      status: 'overdue'
    }
  ]);
  
  const [clientSegments] = useState<ClientSegment[]>([
    { type: 'Weight Loss', count: 5, percentage: 42, trend: 'up', change: 8 },
    { type: 'Muscle Gain', count: 4, percentage: 33, trend: 'up', change: 5 },
    { type: 'General Fitness', count: 2, percentage: 17, trend: 'down', change: 2 },
    { type: 'Sports Training', count: 1, percentage: 8, trend: 'up', change: 1 }
  ]);
  
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [clientWorkouts, setClientWorkouts] = useState<ClientWorkoutPlan[]>([]);
  const [clientMeals, setClientMeals] = useState<MealPlan[]>([]);

  // Fetch clients when component mounts or trainerId changes
  useEffect(() => {
    async function fetchClients() {
      if (!trainerData.trainerId) return;
      
      setIsLoadingClients(true);
      try {
        const result = await getTrainerClients();
        
        if (result.success && result.data && result.data.clients) {
          // Map API data to ClientSummary format - clients are nested under data.clients
          const formattedClients = result.data.clients.map((client: any) => ({
            id: client.id?.toString() || client.govId?.toString(),
            name: client.fullName || client.username,
            email: client.email,
            nextSession: 'Not scheduled',
            program: 'General Fitness',
            status: client.status === 'ACTIVE' ? 'Active' : 'Inactive'
          }));
          
          setClients(formattedClients);
          
          // Update stats
          if (formattedClients.length > 0) {
            setTrainerStats(prev => ({
              ...prev,
              totalClients: formattedClients.length
            }));
          }
        } else {
          // Keep sample data if API call fails
          console.error('Failed to fetch clients:', result.message);
          toast.error('Failed to load clients. Using sample data.');
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Error loading clients. Using sample data.');
      } finally {
        setIsLoadingClients(false);
      }
    }
    
    fetchClients();
  }, [trainerData.trainerId]);

  const handleClientSelect = (client: ClientSummary) => {
    setSelectedClient(client);
    setShowPlanModal(true);
    
    // Load sample workout data based on client
    const sampleWorkouts: ClientWorkoutPlan[] = [
      {
        id: '1',
        type: 'Legs',
        exercises: [
          {
            name: 'Squat',
            sets: 4,
            reps: 12,
            weight: '60',
            notes: 'Focus on form'
          },
          {
            name: 'Leg Press',
            sets: 3,
            reps: 15,
            weight: '100'
          }
        ],
        day: 'Monday',
        startTime: '09:00',
        duration: 60,
        notes: 'Start with light warmup'
      },
      {
        id: '2',
        type: 'Chest',
        exercises: [
          {
            name: 'Bench Press',
            sets: 4,
            reps: 10,
            weight: '50'
          },
          {
            name: 'Push-ups',
            sets: 3,
            reps: 15,
            weight: 'Body weight'
          }
        ],
        day: 'Wednesday',
        startTime: '10:00',
        duration: 45
      },
      {
        id: '3',
        type: 'Back',
        exercises: [
          {
            name: 'Deadlifts',
            sets: 4,
            reps: 8,
            weight: '80'
          },
          {
            name: 'Lat Pulldowns',
            sets: 3,
            reps: 12,
            weight: '45'
          }
        ],
        day: 'Friday',
        startTime: '11:00',
        duration: 50
      }
    ];

    setClientWorkouts(sampleWorkouts);
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

      {/* Custom scrollbar styles */}
      <style jsx global>{`
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

      {/* Dashboard Header */}
      <DashboardHeader 
        trainerData={trainerData} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <OverviewTab 
            trainerStats={trainerStats}
            upcomingSessions={upcomingSessions}
            upcomingPayments={upcomingPayments}
            clientSegments={clientSegments}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab 
            clients={clients} 
            onClientSelect={handleClientSelect}
            setClients={setClients}
            isLoading={isLoadingClients}
          />
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

      {/* Client Plan Modal */}
      <ClientPlanModal
        selectedClient={selectedClient}
        showPlanModal={showPlanModal}
        setShowPlanModal={setShowPlanModal}
        clientWorkouts={clientWorkouts}
        setClientWorkouts={setClientWorkouts}
        clientMeals={clientMeals}
        setClientMeals={setClientMeals}
      />
    </div>
  );
}
