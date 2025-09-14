'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthCheck } from '@/components/dashboard/trainer/hooks/useAuthCheck';
import DashboardHeader from '@/components/dashboard/trainer/DashboardHeader';
import OverviewTab from '@/components/dashboard/trainer/OverviewTab';
import ClientsTab from '@/components/dashboard/trainer/ClientsTab';
import ClientPlanModal from '@/components/dashboard/trainer/ClientPlanModal';
import { getTrainerClients, getUpcomingPayments, getUpcomingWorkouts } from '@/lib/api';
import toast from 'react-hot-toast';
import ActivitySection from '@/components/dashboard/shared/ActivitySection';

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

interface Payment {
  id: number;
  trainerId: number;
  userEmail: string;
  month: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  amount: number;
}

const workoutExercises = {
  Legs: ['Squat', 'Leg Press', 'Leg Extension', 'Leg Curls', 'Calf Raises'],
  Back: ['Pull-ups', 'Deadlifts', 'Bent Over Rows', 'Lat Pulldowns', 'Face Pulls'],
  Chest: ['Bench Press', 'Incline Press', 'Chest Flyes', 'Push-ups', 'Dips'],
  Arms: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Skull Crushers', 'Preacher Curls'],
  Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises', 'Reverse Flyes', 'Shrugs'],
  Core: ['Planks', 'Crunches', 'Russian Twists', 'Leg Raises', 'Wood Chops']
};

// Helper function to calculate duration between start and end time
function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  return `${diffMinutes} min`;
}

// Helper function to format time from 24-hour to 12-hour format
function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Helper function to get next date for a given day of week
function getNextDateForDay(day: string): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayIndex = days.indexOf(day.toUpperCase());
  if (dayIndex === -1) return new Date().toISOString().split('T')[0];
  
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (dayIndex - currentDay + 7) % 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  
  const resultDate = targetDate.toISOString().split('T')[0];
  console.log('🏋️‍♂️ Date calculation:', {
    day: day,
    dayIndex: dayIndex,
    currentDay: currentDay,
    daysUntilTarget: daysUntilTarget,
    resultDate: resultDate
  });
  
  return resultDate;
}

export default function TrainerDashboard() {
  console.log('🏋️‍♂️ ===== TRAINER DASHBOARD COMPONENT LOADED =====');
  const { loading, trainerData } = useAuthCheck();
  console.log('🏋️‍♂️ Auth check loading:', loading);
  console.log('🏋️‍♂️ Trainer data:', trainerData);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'nutrition' | 'progress'>('overview');
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  
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
      name: '',
      email: '',
      progress: 0,
      nextSession: '',
      program: '',
      status: ''
    },
   
  ]);
  
  const [upcomingSessions, setUpcomingSessions] = useState<WorkoutSession[]>([]);
  
  // Debug upcomingSessions state changes
  useEffect(() => {
    console.log('🏋️‍♂️ ===== UPCOMING SESSIONS STATE CHANGED =====');
    console.log('🏋️‍♂️ UpcomingSessions state changed:', upcomingSessions);
    console.log('🏋️‍♂️ UpcomingSessions length:', upcomingSessions.length);
    console.log('🏋️‍♂️ UpcomingSessions is array:', Array.isArray(upcomingSessions));
    console.log('🏋️‍♂️ UpcomingSessions content:', JSON.stringify(upcomingSessions, null, 2));
    
    // Force re-render of OverviewTab by updating a dummy state
    if (upcomingSessions.length > 0) {
      console.log('🏋️‍♂️ ✅ Data available for OverviewTab');
    } else {
      console.log('🏋️‍♂️ ❌ No data available for OverviewTab');
    }
  }, [upcomingSessions]);

  
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  
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
        console.log('Trainer Dashboard - getTrainerClients result:', result);

        if (result.success && result.data && result.data.clients) {
          console.log('Trainer Dashboard - Raw clients data:', result.data.clients);
          console.log('Trainer Dashboard - Raw clients count:', result.data.clients.length);

          // Map API data to ClientSummary format - clients are nested under data.clients
          const formattedClients = result.data.clients.map((client: any, index: number) => {
            console.log(`Trainer Dashboard - Processing client ${index}:`, client);
            const formattedClient = {
              id: client.id?.toString() || client.govId?.toString() || `client-${index}`,
              name: client.fullName || client.username || client.name || 'Unknown',
              email: client.email || 'No email',
              nextSession: 'Not scheduled',
              program: 'General Fitness',
              status: client.status === 'ACTIVE' ? 'Active' : (client.status === 'PENDING' ? 'Pending' : 'Inactive')
            };
            console.log(`Trainer Dashboard - Formatted client ${index}:`, formattedClient);
            return formattedClient;
          });

          console.log('Trainer Dashboard - Formatted clients:', formattedClients);
          console.log('Trainer Dashboard - Formatted clients count:', formattedClients.length);

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

  // Fetch upcoming payments when component mounts or trainerId changes
  useEffect(() => {
    async function fetchUpcomingPayments() {
      if (!trainerData.trainerId) return;
      
      setIsLoadingPayments(true);
      try {
        const result = await getUpcomingPayments(trainerData.trainerId);
        console.log('Trainer Dashboard - getUpcomingPayments result:', result);

        if (result.success && result.data) {
          console.log('Trainer Dashboard - Raw payments data:', result.data);
          console.log('Trainer Dashboard - Raw payments count:', result.data.length);
          setUpcomingPayments(result.data);
          
          // Calculate total upcoming revenue
          const totalRevenue = result.data.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
          console.log('Trainer Dashboard - Total upcoming revenue:', totalRevenue);
          
          // Update monthly revenue in stats
          setTrainerStats(prev => ({
            ...prev,
            monthlyRevenue: totalRevenue
          }));
        } else {
          console.error('Failed to fetch upcoming payments:', result.error);
        }
      } catch (error) {
        console.error('Error fetching upcoming payments:', error);
      } finally {
        setIsLoadingPayments(false);
      }
    }

    fetchUpcomingPayments();
  }, [trainerData.trainerId]);

  // Fetch upcoming workouts when component mounts
  useEffect(() => {
    console.log('🏋️‍♂️ ===== USEEFFECT TRIGGERED =====');
    console.log('🏋️‍♂️ Component mounted, starting workout fetch...');
    
    async function fetchUpcomingWorkouts() {
      console.log('🏋️‍♂️ ===== FETCHING UPCOMING WORKOUTS =====');
      console.log('🏋️‍♂️ Loading workouts for next 7 days...');
      
      setIsLoadingWorkouts(true);
      try {
        console.log('🏋️‍♂️ About to call getUpcomingWorkouts API...');
        const result = await getUpcomingWorkouts(7); // Fetch next 7 days
        console.log('🏋️‍♂️ getUpcomingWorkouts API result:', result);
        console.log('🏋️‍♂️ Result success:', result.success);
        console.log('🏋️‍♂️ Result data type:', typeof result.data);
        console.log('🏋️‍♂️ Result data length:', result.data?.length);

        if (result.success && result.data && result.data.userSchedules) {
          console.log('🏋️‍♂️ Raw workouts data from API:', JSON.stringify(result.data, null, 2));
          console.log('🏋️‍♂️ User schedules object:', result.data.userSchedules);
          
          // Extract all workouts from userSchedules object
          const allWorkouts: any[] = [];
          Object.keys(result.data.userSchedules).forEach(userId => {
            const userWorkouts = result.data.userSchedules[userId];
            console.log(`🏋️‍♂️ User ${userId} has ${userWorkouts.length} workouts:`, userWorkouts);
            // Add user ID to each workout for better tracking
            const workoutsWithUserId = userWorkouts.map((workout: any) => ({
              ...workout,
              userId: userId
            }));
            allWorkouts.push(...workoutsWithUserId);
          });
          
          console.log('🏋️‍♂️ Total workouts extracted:', allWorkouts.length);
          console.log('🏋️‍♂️ All workouts array:', allWorkouts);
          
          // Map API data to WorkoutSession format
          const formattedWorkouts = allWorkouts.map((workout: any, index: number) => {
            console.log(`🏋️‍♂️ Processing workout ${index + 1}/${allWorkouts.length}:`, workout);
            
            // Calculate duration from start and end time
            const startTime = workout.startTime || '06:00';
            const endTime = workout.endTime || '07:00';
            const duration = calculateDuration(startTime, endTime);
            
            // Convert day to date (simplified - you might want to improve this)
            const workoutDate = getNextDateForDay(workout.day);
            
              // Map status correctly - PLANNED should be upcoming
              let mappedStatus: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
              if (workout.status === 'COMPLETED') {
                mappedStatus = 'completed';
              } else if (workout.status === 'CANCELLED') {
                mappedStatus = 'cancelled';
              } else {
                // PLANNED, PENDING, etc. -> upcoming
                mappedStatus = 'upcoming';
              }
              
              console.log('🏋️‍♂️ Status mapping:', {
                original: workout.status,
                mapped: mappedStatus
              });
              
              const formattedWorkout: WorkoutSession = {
                id: workout.userId + '-' + index || `workout-${index}`,
                clientName: workout.userName || `User ${workout.userId}` || 'Unknown Client',
                type: workout.workoutName || 'General Workout',
                date: workoutDate,
                time: formatTime(startTime),
                duration: duration,
                status: mappedStatus
              };
            
            console.log('🏋️‍♂️ Mapped workout details:', {
              original: workout,
              formatted: formattedWorkout
            });
            
            console.log('🏋️‍♂️ Final formatted workout for display:', formattedWorkout);
            
            console.log(`🏋️‍♂️ Formatted workout ${index + 1}:`, formattedWorkout);
            return formattedWorkout;
          });

          console.log('🏋️‍♂️ All formatted workouts:', JSON.stringify(formattedWorkouts, null, 2));
          console.log('🏋️‍♂️ Total formatted workouts count:', formattedWorkouts.length);
          
          // Debug: Check what dates we have
          const today = new Date().toISOString().split('T')[0];
          const todaysWorkouts = formattedWorkouts.filter(workout => workout.date === today);
          console.log('🏋️‍♂️ Today\'s date:', today);
          console.log('🏋️‍♂️ Workouts for today:', todaysWorkouts.length);
          console.log('🏋️‍♂️ All workout dates:', formattedWorkouts.map(w => w.date));
          
          console.log('🏋️‍♂️ About to set upcomingSessions with:', formattedWorkouts);
          console.log('🏋️‍♂️ Formatted workouts type:', typeof formattedWorkouts);
          console.log('🏋️‍♂️ Formatted workouts is array:', Array.isArray(formattedWorkouts));
          setUpcomingSessions(formattedWorkouts);
          console.log('🏋️‍♂️ Upcoming sessions state updated with', formattedWorkouts.length, 'workouts');
          
          // Verify the state was set
          setTimeout(() => {
            console.log('🏋️‍♂️ State after setting (delayed check):', upcomingSessions);
          }, 100);
          
          // Update active workouts count in stats
          const activeWorkoutsCount = formattedWorkouts.filter((w: WorkoutSession) => w.status === 'upcoming').length;
          console.log('🏋️‍♂️ Active workouts count (upcoming only):', activeWorkoutsCount);
          
          setTrainerStats(prev => {
            const newStats = {
              ...prev,
              activeWorkouts: activeWorkoutsCount
            };
            console.log('🏋️‍♂️ Updated trainer stats:', newStats);
            return newStats;
          });
          
          // Debug: Verify data is being passed to OverviewTab
          console.log('🏋️‍♂️ ===== DATA BEING PASSED TO OVERVIEW TAB =====');
          console.log('🏋️‍♂️ upcomingSessions state:', upcomingSessions);
          console.log('🏋️‍♂️ formattedWorkouts:', formattedWorkouts);
          
          console.log('🏋️‍♂️ ===== WORKOUTS FETCH COMPLETED SUCCESSFULLY =====');
        } else {
          console.error('🏋️‍♂️ ❌ Failed to fetch upcoming workouts:', result.error);
          console.error('🏋️‍♂️ ❌ Result object:', result);
        }
      } catch (error) {
        console.error('🏋️‍♂️ ❌ Error fetching upcoming workouts:', error);
        console.error('🏋️‍♂️ ❌ Error details:', error);
      } finally {
        setIsLoadingWorkouts(false);
        console.log('🏋️‍♂️ Loading state set to false');
      }
    }

    console.log('🏋️‍♂️ Starting workout fetch process...');
    fetchUpcomingWorkouts();
  }, []);

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
          <div className="space-y-8">
            <OverviewTab 
              trainerStats={trainerStats}
              upcomingSessions={upcomingSessions}
              upcomingPayments={upcomingPayments}
              clientSegments={clientSegments}
            />
            
            {/* Recent Activity Section */}
            <ActivitySection 
              title="Trainer Activity" 
              adminType="trainer"
              maxItems={7}
            />
          </div>
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
