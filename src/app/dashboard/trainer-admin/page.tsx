'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiActivity, FiTrendingUp, FiPackage, FiDollarSign, FiUser, FiPlus, FiLogOut, FiClock, FiBarChart2, FiUsers, FiCheckCircle, FiAward, FiStar, FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { getCookie } from '@/lib/api';

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

interface ClientSummary {
  id: string;
  name: string;
  progress: number;
  nextSession: string;
  program: string;
  email?: string;
  status?: string;
}

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weight: string;
  notes?: string;
}

interface WorkoutPlan {
  type: 'Legs' | 'Back' | 'Chest' | 'Arms' | 'Shoulders' | 'Core';
  exercises: WorkoutExercise[];
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

interface WorkoutPlanRequest {
  id: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  duration: '1month' | '2months' | '3months';
  status: 'draft' | 'pending' | 'approved' | 'active' | 'completed';
  weeklyPlans: {
    weekNumber: number;
    schedule: {
      [key: string]: { // Monday, Tuesday, etc.
        workouts: {
          type: keyof typeof workoutExercises;
          time: string;
          duration: number;
          exercises: WorkoutExercise[];
        }[];
      };
    };
  }[];
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'nutrition' | 'progress'>('overview');
  const [trainerData, setTrainerData] = useState<TrainerData>({
    email: 'trainer@fitpro.com',
    fullName: 'John Smith',
    city: 'New York',
    status: 'Active',
    trainerId: 'TR-2024-001',
    servicePeriod: '2 years',
    weight: '75kg',
    height: '180cm',
    profile: 'Professional Fitness Trainer'
  });
  const [trainerStats, setTrainerStats] = useState<TrainerStats>({
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
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'workout' | 'meal'>('workout');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<keyof typeof workoutExercises | ''>('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseDetails, setExerciseDetails] = useState<WorkoutExercise>({
    name: '',
    sets: 3,
    reps: 12,
    weight: ''
  });
  const [clientWorkouts, setClientWorkouts] = useState<ClientWorkoutPlan[]>([]);
  const [clientMeals, setClientMeals] = useState<MealPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [workoutTime, setWorkoutTime] = useState('09:00');
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [currentWorkoutExercises, setCurrentWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [workoutPlanRequests, setWorkoutPlanRequests] = useState<WorkoutPlanRequest[]>([
    {
      id: '1',
      clientId: '1',
      clientName: 'Emma Wilson',
      startDate: '2024-03-20',
      endDate: '2024-04-20',
      duration: '1month',
      status: 'active',
      weeklyPlans: [
        {
          weekNumber: 1,
          schedule: {
            Monday: {
              workouts: [
                {
                  type: 'Legs',
                  time: '09:00',
                  duration: 60,
                  exercises: [
                    { name: 'Squat', sets: 4, reps: 12, weight: '60', notes: 'Focus on form' },
                    { name: 'Leg Press', sets: 3, reps: 15, weight: '100' }
                  ]
                }
              ]
            },
            Wednesday: {
              workouts: [
                {
                  type: 'Chest',
                  time: '10:00',
                  duration: 45,
                  exercises: [
                    { name: 'Bench Press', sets: 4, reps: 10, weight: '50' },
                    { name: 'Push-ups', sets: 3, reps: 15, weight: 'Body weight' }
                  ]
                }
              ]
            }
          }
        }
      ]
    }
  ]);
  const [selectedDuration, setSelectedDuration] = useState<'1month' | '2months' | '3months'>('1month');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const handleLogout = async () => {
    
  };

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

    const sampleMeals: MealPlan[] = [
      {
        id: '1',
        mealType: 'Breakfast',
        time: '08:00',
        items: [
          {
            name: 'Oatmeal with Berries',
            portion: '1 cup',
            calories: 300
          },
          {
            name: 'Greek Yogurt',
            portion: '200g',
            calories: 150
          },
          {
            name: 'Banana',
            portion: '1 medium',
            calories: 105
          }
        ]
      },
      {
        id: '2',
        mealType: 'Lunch',
        time: '13:00',
        items: [
          {
            name: 'Grilled Chicken Breast',
            portion: '200g',
            calories: 330
          },
          {
            name: 'Brown Rice',
            portion: '1 cup',
            calories: 216
          },
          {
            name: 'Mixed Vegetables',
            portion: '200g',
            calories: 70
          }
        ]
      },
      {
        id: '3',
        mealType: 'Dinner',
        time: '19:00',
        items: [
          {
            name: 'Salmon Fillet',
            portion: '180g',
            calories: 367
          },
          {
            name: 'Sweet Potato',
            portion: '200g',
            calories: 180
          },
          {
            name: 'Broccoli',
            portion: '150g',
            calories: 55
          }
        ]
      },
      {
        id: '4',
        mealType: 'Snack',
        time: '16:00',
        items: [
          {
            name: 'Almonds',
            portion: '30g',
            calories: 164
          },
          {
            name: 'Apple',
            portion: '1 medium',
            calories: 95
          }
        ]
      }
    ];

    setClientWorkouts(sampleWorkouts);
    setClientMeals(sampleMeals);
  };

  const handleAddExercise = () => {
    if (!selectedWorkoutType || !selectedExercise) return;

    const newExercise: WorkoutExercise = {
      name: selectedExercise,
      sets: exerciseDetails.sets,
      reps: exerciseDetails.reps,
      weight: exerciseDetails.weight,
      notes: workoutNotes
    };

    setCurrentWorkoutExercises([...currentWorkoutExercises, newExercise]);
    
    // Reset form for next exercise
    setSelectedExercise('');
    setExerciseDetails({
      name: '',
      sets: 3,
      reps: 12,
      weight: ''
    });
    setWorkoutNotes('');

    toast.success('Exercise added to workout');
  };

  const handleAddWorkout = () => {
    if (!selectedWorkoutType || currentWorkoutExercises.length === 0) return;

    const newWorkout: ClientWorkoutPlan = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedWorkoutType as keyof typeof workoutExercises,
      exercises: [...currentWorkoutExercises],
      day: selectedDay,
      startTime: workoutTime,
      duration: workoutDuration
    };

    setClientWorkouts([...clientWorkouts, newWorkout]);
    
    // Reset form for next workout
    setSelectedWorkoutType('');
    setCurrentWorkoutExercises([]);
    setWorkoutTime('09:00');
    setWorkoutDuration(60);

    toast.success('Workout added to plan');
  };

  const [mealItems, setMealItems] = useState<{name: string; portion: string; calories: number}[]>([
    { name: '', portion: '', calories: 0 }
  ]);

  const handleAddMealItem = () => {
    setMealItems([...mealItems, { name: '', portion: '', calories: 0 }]);
  };

  const handleMealItemChange = (index: number, field: keyof typeof mealItems[0], value: string) => {
    const newMealItems = [...mealItems];
    if (field === 'calories') {
      newMealItems[index][field] = parseInt(value) || 0;
    } else {
      newMealItems[index][field] = value;
    }
    setMealItems(newMealItems);
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
                      <div className={`p-2 rounded-full ${session.status === 'upcoming' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                        <FiClock className={`w-5 h-5 ${session.status === 'upcoming' ? 'text-blue-600' : 'text-green-600'
                          }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{session.clientName}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${session.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
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
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center ${segment.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
              <button 
                onClick={() => {
                  // Add logic to open add client modal
                }}
                className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
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
                        <button
                          onClick={() => handleClientSelect(client)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Manage Plans
                        </button>
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

      {/* Client Management Modal */}
      {showPlanModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Plan Management - {selectedClient.name}
                </h2>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setActiveModalTab('workout')}
                  className={`px-4 py-2 rounded-lg ${
                    activeModalTab === 'workout'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Workout Plan
                </button>
                <button
                  onClick={() => setActiveModalTab('meal')}
                  className={`px-4 py-2 rounded-lg ${
                    activeModalTab === 'meal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Meal Plan
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeModalTab === 'workout' ? (
                <div className="space-y-6">
                  {/* Plan Duration Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Duration
                      </label>
                      <div className="flex space-x-4">
                        {[
                          { id: '1month', label: '1 Month', weeks: 4 },
                          { id: '2months', label: '2 Months', weeks: 8 },
                          { id: '3months', label: '3 Months', weeks: 12 }
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedDuration(option.id as '1month' | '2months' | '3months');
                              setTotalWeeks(option.weeks);
                            }}
                            className={`flex-1 py-3 px-4 rounded-lg text-center transition-all duration-200 ${
                              selectedDuration === option.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs mt-1 opacity-80">{option.weeks} weeks</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Week Selection */}
                    
                  </div>

                  {/* Weekly Schedule */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Week {currentWeek} Schedule</h4>
                    <div className="space-y-4">
                      {weekDays.map((day) => (
                        <div key={day} className="border rounded-lg overflow-hidden">
                          <div 
                            onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-gray-900">{day}</h5>
                              {/* Show indicator if workouts exist for this day */}
                              {clientWorkouts.some(workout => workout.day === day) && (
                                <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true"></span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDay(day);
                                  setCurrentWorkoutExercises([]);
                                  setSelectedWorkoutType('');
                                  setExpandedDay(day);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                + Add Workout
                              </button>
                              <svg 
                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedDay === day ? 'transform rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Workout Form - Only show if expanded */}
                          {expandedDay === day && (
                            <div className="p-4 bg-gray-50 border-t">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Workout Type
                                  </label>
                                  <select
                                    value={selectedWorkoutType}
                                    onChange={(e) => setSelectedWorkoutType(e.target.value as keyof typeof workoutExercises)}
                                    className="w-full form-select rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  >
                                    <option value="">Select Type</option>
                                    {Object.keys(workoutExercises).map((type) => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                    <input
                                      type="time"
                                      value={workoutTime}
                                      onChange={(e) => setWorkoutTime(e.target.value)}
                                      className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                                    <input
                                      type="number"
                                      value={workoutDuration}
                                      onChange={(e) => setWorkoutDuration(parseInt(e.target.value))}
                                      className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      min="15"
                                      step="15"
                                    />
                                  </div>
                                </div>
                              </div>

                              {selectedWorkoutType && (
                                <div className="mt-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exercises
                                  </label>
                                  
                                  {/* Display already added exercises */}
                                  {currentWorkoutExercises.length > 0 && (
                                    <div className="mb-4 bg-white p-3 rounded-lg border">
                                      <h6 className="text-sm font-medium text-gray-700 mb-2">Added Exercises:</h6>
                                      <div className="space-y-2">
                                        {currentWorkoutExercises.map((exercise, idx) => (
                                          <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border">
                                            <span>{exercise.name} - {exercise.sets} sets × {exercise.reps} reps {exercise.weight && `(${exercise.weight} kg)`}</span>
                                            <button 
                                              onClick={() => {
                                                const updatedExercises = [...currentWorkoutExercises];
                                                updatedExercises.splice(idx, 1);
                                                setCurrentWorkoutExercises(updatedExercises);
                                              }}
                                              className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-2">
                                    <select
                                      value={selectedExercise}
                                      onChange={(e) => setSelectedExercise(e.target.value)}
                                      className="w-full form-select rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                      <option value="">Select Exercise</option>
                                      {workoutExercises[selectedWorkoutType as keyof typeof workoutExercises].map((exercise) => (
                                        <option key={exercise} value={exercise}>{exercise}</option>
                                      ))}
                                    </select>
                                    {selectedExercise && (
                                      <div className="grid grid-cols-3 gap-4 mt-2">
                                        <input
                                          type="number"
                                          value={exerciseDetails.sets}
                                          onChange={(e) => setExerciseDetails({...exerciseDetails, sets: parseInt(e.target.value)})}
                                          placeholder="Sets"
                                          className="form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <input
                                          type="number"
                                          value={exerciseDetails.reps}
                                          onChange={(e) => setExerciseDetails({...exerciseDetails, reps: parseInt(e.target.value)})}
                                          placeholder="Reps"
                                          className="form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <input
                                          type="text"
                                          value={exerciseDetails.weight}
                                          onChange={(e) => setExerciseDetails({...exerciseDetails, weight: e.target.value})}
                                          placeholder="Weight (kg)"
                                          className="form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {selectedExercise && (
                                    <div className="mt-3 flex justify-end">
                                      <button
                                        onClick={handleAddExercise}
                                        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                                      >
                                        Add Exercise
                                      </button>
                                    </div>
                                  )}
                                  
                                  {currentWorkoutExercises.length > 0 && (
                                    <div className="mt-4 flex justify-end">
                                      <button
                                        onClick={() => {
                                          handleAddWorkout();
                                          setExpandedDay(null);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                      >
                                        Save Workout
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                         
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Plan Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {/* Add logic to submit plan */}}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Plan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Meal Plan Form */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Meal</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meal Type
                        </label>
                        <select className="w-full form-select rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <option value="">Select Meal Type</option>
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snack">Snack</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Food Items
                      </label>
                      <div className="space-y-2">
                        {mealItems.map((item, index) => (
                          <div key={index} className="grid grid-cols-3 gap-4">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleMealItemChange(index, 'name', e.target.value)}
                              placeholder="Food item"
                              className="form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={item.portion}
                              onChange={(e) => handleMealItemChange(index, 'portion', e.target.value)}
                              placeholder="Portion"
                              className="form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <input
                              type="number"
                              value={item.calories || ''}
                              onChange={(e) => handleMealItemChange(index, 'calories', e.target.value)}
                              placeholder="Calories"
                              className="form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                        <button
                          onClick={handleAddMealItem}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add another item
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
