'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiActivity, FiTrendingUp, FiPackage, FiDollarSign, FiUser, FiPlus, FiLogOut, FiClock, FiCheck, FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { ApexOptions } from 'apexcharts';
import { getCookie, getWorkouts } from '@/lib/api';

// Extend Window interface to include ApexCharts
declare global {
  interface Window {
    ApexCharts: any;
  }
}

// Create a client-side only wrapper for ApexCharts
const ApexChartsWrapper = dynamic(
  () => import('react-apexcharts').then((mod) => {
    // Force ApexCharts to be available globally for SSR
    if (typeof window !== 'undefined') {
      window.ApexCharts = require('apexcharts');
    }
    return mod;
  }),
  { ssr: false }
);

// Create a Chart component that uses the wrapper with proper types
interface ChartProps {
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'scatter' | 'bubble';
  width: number;
  series: any[];
  options: ApexOptions;
}

const Chart = ({ type, width, series, options }: ChartProps) => {
  return <ApexChartsWrapper type={type} width={width} series={series} options={options} />;
};

interface UserData {
  email: string;
  city: string;
  status: string;
  mobile: string;
  fullName: string;
  govId: string | null;
}

interface Workout {
  time: string;
  type: string;
  duration: string;
  completed: boolean;
}

interface ScheduleDay {
  id: number;
  day: string;
  workouts: Workout[];
}

interface Supplement {
  id: number;
  name: string;
  timing: string;
  dosage: string;
  benefits: string[];
  recommended: boolean;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: string;
  completed: boolean;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

interface WorkoutWeek {
  weekNumber: number;
  workouts: WorkoutDay[];
}

interface WorkoutProgram {
  name: string;
  weeks: WorkoutWeek[];
}

interface ProgressData {
  workoutsCompleted: number;
  totalWorkouts: number;
  attendanceRate: number;
  weightProgress: {
    current: number;
    target: number;
    history: { date: string; weight: number }[];
  };
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    legs: number;
  };
}

interface MealPlan {
  day: string;
  meals: {
    type: string;
    time: string;
    foods: {
      name: string;
      portion: string;
      calories: number;
    }[];
  }[];
}

// Add new interfaces for history tracking
interface WorkoutHistory {
  date: string;
  workoutType: string;
  duration: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: string;
    completed: boolean;
  }[];
  caloriesBurned: number;
  notes?: string;
}

interface MealHistory {
  date: string;
  mealType: string;
  time: string;
  foods: {
    name: string;
    portion: string;
    calories: number;
  }[];
  totalCalories: number;
  notes?: string;
}

// Add new interfaces for trainer and payment data
interface TrainerData {
  id: string;
  name: string;
  image: string;
  specialization: string;
  experience: string;
  rating: number;
  bio: string;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

interface BodyMetrics {
  date: string;
  weight: number;
  height: number;
  bmi: number;
}

// Add new interface for API workout data
interface APIWorkout {
  workoutId: string;
  workoutName: string;
  startDate: string;
  endDate: string;
  workouts: {
    type: string;
    day: string;
    startTime: string;
    duration: number;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      weight: string;
      notes: string;
    }[];
    notes: string;
  }[];
}

// Add sample data
const sampleSchedule: ScheduleDay[] = [
  {
    id: 1,
    day: 'Monday',
    workouts: [
      { time: '08:00 AM', type: 'Cardio', duration: '45 mins', completed: true },
      { time: '06:00 PM', type: 'Strength Training', duration: '60 mins', completed: false },
    ],
  },
  {
    id: 2,
    day: 'Tuesday',
    workouts: [
      { time: '07:00 AM', type: 'Yoga', duration: '30 mins', completed: true },
      { time: '05:30 PM', type: 'HIIT', duration: '45 mins', completed: true },
    ],
  },
  {
    id: 3,
    day: 'Wednesday',
    workouts: [
      { time: '08:30 AM', type: 'Strength Training', duration: '75 mins', completed: false },
    ],
  },
  {
    id: 4,
    day: 'Thursday',
    workouts: [
      { time: '07:30 AM', type: 'Cardio', duration: '40 mins', completed: true },
      { time: '06:00 PM', type: 'Flexibility', duration: '30 mins', completed: false },
    ],
  },
  {
    id: 5,
    day: 'Friday',
    workouts: [
      { time: '08:00 AM', type: 'Full Body Workout', duration: '60 mins', completed: false },
    ],
  },
];

const sampleSupplements: Supplement[] = [
  {
    id: 1,
    name: 'Whey Protein',
    timing: 'Post-workout',
    dosage: '30g with water',
    benefits: ['Muscle recovery', 'Protein synthesis', 'Weight management'],
    recommended: true,
  },
  
];


const sampleProgressData: ProgressData = {
  workoutsCompleted: 8,
  totalWorkouts: 12,
  attendanceRate: 85,
  weightProgress: {
    current: 75,
    target: 70,
    history: [
      { date: '2024-01-01', weight: 80 },
      { date: '2024-01-15', weight: 78 },
      { date: '2024-02-01', weight: 76 },
      { date: '2024-02-15', weight: 75 },
    ],
  },
  measurements: {
    chest: 95,
    waist: 80,
    hips: 95,
    arms: 35,
    legs: 55,
  },
};

const sampleMealPlan: MealPlan[] = [
  {
    day: 'Monday',
    meals: [
      {
        type: 'Breakfast',
        time: '07:00 AM',
        foods: [
          { name: 'Oatmeal', portion: '1 cup', calories: 300 },
          { name: 'Banana', portion: '1 medium', calories: 105 },
          { name: 'Almonds', portion: '1 oz', calories: 164 },
        ],
      },
      
    ],
  },
];

// Update sample workout history with more data
const sampleWorkoutHistory: WorkoutHistory[] = [
  {
    date: '2024-02-15',
    workoutType: 'Strength Training',
    duration: '60 mins',
    exercises: [
      { name: 'Bench Press', sets: 3, reps: 12, weight: '60kg', completed: true },
      { name: 'Squats', sets: 4, reps: 10, weight: '80kg', completed: true },
      { name: 'Deadlifts', sets: 3, reps: 8, weight: '100kg', completed: true },
    ],
    caloriesBurned: 450,
    notes: 'Great session, increased weight on squats',
  },
  {
    date: '2024-02-14',
    workoutType: 'Cardio',
    duration: '45 mins',
    exercises: [
      { name: 'Running', sets: 1, reps: 1, weight: 'N/A', completed: true },
      { name: 'Jump Rope', sets: 3, reps: 100, weight: 'N/A', completed: true },
      { name: 'Burpees', sets: 3, reps: 20, weight: 'N/A', completed: true },
    ],
    caloriesBurned: 350,
    notes: 'Maintained 5km pace',
  },
  {
    date: '2024-02-13',
    workoutType: 'HIIT',
    duration: '30 mins',
    exercises: [
      { name: 'Mountain Climbers', sets: 4, reps: 30, weight: 'N/A', completed: true },
      { name: 'Kettlebell Swings', sets: 4, reps: 20, weight: '16kg', completed: true },
      { name: 'Box Jumps', sets: 4, reps: 15, weight: 'N/A', completed: true },
    ],
    caloriesBurned: 400,
    notes: 'High intensity session completed',
  },
  {
    date: '2024-02-12',
    workoutType: 'Yoga',
    duration: '45 mins',
    exercises: [
      { name: 'Sun Salutations', sets: 3, reps: 1, weight: 'N/A', completed: true },
      { name: 'Warrior Poses', sets: 2, reps: 1, weight: 'N/A', completed: true },
      { name: 'Balance Poses', sets: 2, reps: 1, weight: 'N/A', completed: true },
    ],
    caloriesBurned: 200,
    notes: 'Focus on flexibility and balance',
  },
  {
    date: '2024-02-11',
    workoutType: 'Full Body Workout',
    duration: '75 mins',
    exercises: [
      { name: 'Pull-ups', sets: 3, reps: 8, weight: 'Body weight', completed: true },
      { name: 'Dips', sets: 3, reps: 12, weight: 'Body weight', completed: true },
      { name: 'Plank', sets: 3, reps: 1, weight: 'N/A', completed: true },
    ],
    caloriesBurned: 500,
    notes: 'Full body strength session',
  },
];

// Update sample meal history with more data
const sampleMealHistory: MealHistory[] = [
  {
    date: '2024-02-15',
    mealType: 'Breakfast',
    time: '07:00 AM',
    foods: [
      { name: 'Oatmeal', portion: '1 cup', calories: 300 },
      { name: 'Banana', portion: '1 medium', calories: 105 },
      { name: 'Almonds', portion: '1 oz', calories: 164 },
      { name: 'Greek Yogurt', portion: '1 cup', calories: 133 },
    ],
    totalCalories: 702,
    notes: 'Followed meal plan exactly',
  },
  
];

// Add sample data for new components
const sampleTrainerData: TrainerData = {
  id: '1',
  name: 'John Smith',
  image: '/trainer1.jpg',
  specialization: 'Strength Training & Weight Loss',
  experience: '8 years',
  rating: 4.8,
  bio: 'Certified personal trainer specializing in strength training and weight loss programs.',
};

const samplePaymentHistory: PaymentHistory[] = [
  {
    id: '1',
    date: '2024-02-15',
    amount: 150,
    status: 'paid',
    description: 'Monthly Training Fee',
  },
  {
    id: '2',
    date: '2024-01-15',
    amount: 150,
    status: 'paid',
    description: 'Monthly Training Fee',
  },
  {
    id: '3',
    date: '2023-12-15',
    amount: 150,
    status: 'paid',
    description: 'Monthly Training Fee',
  },
];

const sampleBodyMetrics: BodyMetrics[] = [
  {
    date: '2024-02-15',
    weight: 75,
    height: 180,
    bmi: 23.1,
  },
  {
    date: '2024-01-15',
    weight: 78,
    height: 180,
    bmi: 24.1,
  },
  {
    date: '2023-12-15',
    weight: 80,
    height: 180,
    bmi: 24.7,
  },
];

interface ExerciseDetails {
  isDropSet: boolean;
  reps: string;
  notes: string;
  sets: string;
  targetMuscles: string;
  restBetweenSets: string;
  name: string;
  weight: string;
  equipment: string;
  tempo: string;
  isSuperSet: boolean;
  superSetGroup: string | null;
}

interface WorkoutNotes {
  general: string | null;
  cooldown: string | null;
  warmup: string | null;
}

interface HistoryInfo {
  historyId: string;
  programName: string;
  currentWeek: number;
  status: string;
}

interface ScheduleInfo {
  duration: string;
  startDateTime: string;
  isRestDay: boolean;
  endDateTime: string;
}

interface WorkoutResponse {
  id: number;
  intensity: string;
  exerciseDetails: ExerciseDetails;
  notes: WorkoutNotes;
  historyInfo: HistoryInfo;
  scheduleInfo: ScheduleInfo;
  type: string;
  day: string;
  weekNumber: number;
  status: string;
  focusArea: string;
}

interface GroupedWorkouts {
  [programName: string]: {
    [weekNumber: string]: WorkoutResponse[];
  };
}

export default function ClientDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'supplements' | 'workouts' | 'progress' | 'mealplan'>('overview');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDay[]>(sampleSchedule);
  const [supplements, setSupplements] = useState<Supplement[]>(sampleSupplements);
  const [progressData, setProgressData] = useState<ProgressData | null>(sampleProgressData);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>(sampleMealPlan);
  const [loading, setLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>(sampleWorkoutHistory);
  const [mealHistory, setMealHistory] = useState<MealHistory[]>(sampleMealHistory);
  const [workoutFilter, setWorkoutFilter] = useState({
    dateRange: 'all',
    type: 'all',
    sortBy: 'date',
  });
  const [mealFilter, setMealFilter] = useState({
    dateRange: 'all',
    mealType: 'all',
    sortBy: 'date',
  });
  const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const trainerId = await getCookie('trainerId');
        const fullName = await getCookie('fullName');
        const city = await getCookie('city');
        const status = await getCookie('status');

        if (!trainerId) {
          router.push('/login');
          return;
        }

        setUserData({
          email: '',
          mobile: '',
          govId: trainerId,
          fullName: fullName || '',
          city: city || '',
          status: status || ''
        });

        // Fetch workouts for the client
        const workoutsResult = await getWorkouts(trainerId);
        if (workoutsResult.success && workoutsResult.data) {
          setWorkouts(workoutsResult.data.workouts || []);
        } else {
          setError(workoutsResult.message || 'Failed to fetch workouts');
          toast.error(workoutsResult.message || 'Failed to fetch workouts');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const fetchTabData = async (tab: string) => {
    try {
      switch (tab) {
        case 'schedule':
          // Fetch schedule data
          break;
        case 'supplements':
          // Fetch supplements data
          break;
        case 'workouts':
          // Fetch workout program data
          break;
        case 'progress':
          // Fetch progress data
          break;
        case 'mealplan':
          // Fetch meal plan data
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
      toast.error(`Failed to load ${tab} data`);
    }
  };

  const handleLogout = async () => {

  };

  // Add filter functions
  const filterWorkoutHistory = (history: WorkoutHistory[]) => {
    return history.filter(workout => {
      const workoutDate = new Date(workout.date);
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      if (workoutFilter.dateRange === 'week' && workoutDate < new Date(today.setDate(today.getDate() - 7))) {
        return false;
      }
      if (workoutFilter.dateRange === 'month' && workoutDate < thirtyDaysAgo) {
        return false;
      }
      if (workoutFilter.type !== 'all' && workout.workoutType !== workoutFilter.type) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (workoutFilter.sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.caloriesBurned - a.caloriesBurned;
    });
  };

  const filterMealHistory = (history: MealHistory[]) => {
    return history.filter(meal => {
      const mealDate = new Date(meal.date);
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      if (mealFilter.dateRange === 'week' && mealDate < new Date(today.setDate(today.getDate() - 7))) {
        return false;
      }
      if (mealFilter.dateRange === 'month' && mealDate < thirtyDaysAgo) {
        return false;
      }
      if (mealFilter.mealType !== 'all' && meal.mealType !== mealFilter.mealType) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (mealFilter.sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.totalCalories - a.totalCalories;
    });
  };

  const renderWorkouts = () => {
    if (loading) {
      return <div className="text-center py-4">Loading workouts...</div>;
    }

    if (error) {
      return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    if (!workouts || !workouts.length) {
      return <div className="text-center py-4">No workouts found</div>;
    }

    // Group workouts by program name and week number
    const groupedWorkouts = workouts.reduce<GroupedWorkouts>((acc, workout) => {
      const programName = workout.historyInfo.programName;
      const weekNumber = workout.weekNumber.toString();
      
      if (!acc[programName]) {
        acc[programName] = {} as { [key: string]: WorkoutResponse[] };
      }
      if (!acc[programName][weekNumber]) {
        acc[programName][weekNumber] = [];
      }
      
      acc[programName][weekNumber].push(workout);
      return acc;
    }, {} as GroupedWorkouts);

    return (
      <div className="space-y-8">
        {Object.entries(groupedWorkouts).map(([programName, weeks]) => (
          <div key={programName} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{programName}</h3>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(weeks).map(([weekNumber, workouts]) => (
                <div key={weekNumber} className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Week {weekNumber}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workouts.map((workout: WorkoutResponse) => (
                      <div key={workout.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            workout.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            workout.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {workout.status}
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            {workout.day}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{workout.exerciseDetails.name}</h5>
                            <p className="text-sm text-gray-600">{workout.focusArea.replace(/_/g, ' ')}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white p-2 rounded">
                              <span className="text-gray-600">Sets:</span>
                              <span className="ml-2 font-medium">{workout.exerciseDetails.sets}</span>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <span className="text-gray-600">Reps:</span>
                              <span className="ml-2 font-medium">{workout.exerciseDetails.reps}</span>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <span className="text-gray-600">Weight:</span>
                              <span className="ml-2 font-medium">{workout.exerciseDetails.weight}</span>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <span className="text-gray-600">Equipment:</span>
                              <span className="ml-2 font-medium">{workout.exerciseDetails.equipment}</span>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Schedule:</span>
                              <span className="font-medium">
                                {workout.scheduleInfo.startDateTime} - {workout.scheduleInfo.endDateTime}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium">{workout.scheduleInfo.duration} mins</span>
                            </div>
                          </div>

                          {workout.notes.warmup && (
                            <div className="bg-yellow-50 p-3 rounded text-sm">
                              <p className="font-medium text-yellow-800">Warmup:</p>
                              <p className="text-yellow-700">{workout.notes.warmup}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-lg">
                <FiActivity className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                FIT PRO
              </h1>
            </div>
            <div className="flex items-center space-x-4">

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
                {['overview', 'schedule', 'supplements', 'workouts', 'progress', 'mealplan'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-3 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="text-white text-sm"> <div className="flex items-center space-x-2  bg-opacity-20 px-4 py-2 rounded-full">
                  <FiUser className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">{userData?.fullName}</span>
                </div></span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                  {userData?.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Enhanced Spacing and Layout */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section with Enhanced Design */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative p-8 text-white">
                  <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {userData?.fullName}</h1>
                  <p className="text-lg text-blue-100">Track your fitness journey and stay on top of your goals</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FiActivity className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-600">Active Member</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FiTrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-600">On Track</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats with Enhanced Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Attendance</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-3xl font-bold text-gray-900">{progressData?.attendanceRate}%</p>
                      <p className="ml-2 text-sm text-green-600">↑ 5% from last month</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FiCalendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressData?.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weight Progress</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-3xl font-bold text-gray-900">{sampleBodyMetrics[0].weight} kg</p>
                      <p className="ml-2 text-sm text-green-600">↓ 2.5 kg this month</p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FiTrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(sampleBodyMetrics[0].weight / sampleBodyMetrics[sampleBodyMetrics.length - 1].weight) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Payment</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-3xl font-bold text-gray-900">$150</p>
                      <p className="ml-2 text-sm text-gray-600">Due in 5 days</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FiDollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium">
                    Pay Now
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Trainer Details with Enhanced Design */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Your Trainer</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                    View Profile
                    <FiPlus className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-blue-100">
                      <img
                        src={sampleTrainerData.image}
                        alt={sampleTrainerData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      Available
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                      <h3 className="text-2xl font-semibold text-gray-900">{sampleTrainerData.name}</h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xl ${i < Math.floor(sampleTrainerData.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({sampleTrainerData.rating})</span>
                    </div>
                    <p className="text-lg text-gray-600 mt-2">{sampleTrainerData.specialization}</p>
                    <p className="mt-4 text-gray-600">{sampleTrainerData.bio}</p>
                    <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                        {sampleTrainerData.experience} Experience
                      </span>
                      <span className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                        Certified Trainer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Body Metrics Progress with Enhanced Charts */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Body Metrics Progress</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                      Weekly
                    </button>
                    <button className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                      Monthly
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Weight Progress</h3>
                    <div className="flex items-center justify-center">
                      <Chart
                        type="line"
                        width={400}
                        series={[{
                          name: 'Weight',
                          data: sampleBodyMetrics.map(m => m.weight)
                        }]}
                        options={{
                          chart: {
                            toolbar: {
                              show: false
                            }
                          },
                          xaxis: {
                            categories: sampleBodyMetrics.map(m => m.date)
                          },
                          yaxis: {
                            title: {
                              text: 'Weight (kg)'
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600">Starting Weight</p>
                        <p className="text-2xl font-bold text-gray-900">{sampleBodyMetrics[sampleBodyMetrics.length - 1].weight} kg</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600">Current Weight</p>
                        <p className="text-2xl font-bold text-gray-900">{sampleBodyMetrics[0].weight} kg</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">BMI Progress</h3>
                    <div className="flex items-center justify-center">
                      <Chart
                        type="line"
                        width={400}
                        series={[{
                          name: 'BMI',
                          data: sampleBodyMetrics.map(m => m.bmi)
                        }]}
                        options={{
                          chart: {
                            toolbar: {
                              show: false
                            }
                          },
                          xaxis: {
                            categories: sampleBodyMetrics.map(m => m.date)
                          },
                          yaxis: {
                            title: {
                              text: 'BMI'
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600">Starting BMI</p>
                        <p className="text-2xl font-bold text-gray-900">{sampleBodyMetrics[sampleBodyMetrics.length - 1].bmi}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600">Current BMI</p>
                        <p className="text-2xl font-bold text-gray-900">{sampleBodyMetrics[0].bmi}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History with Enhanced Design */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                    View All
                    <FiPlus className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {samplePaymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{payment.description}</p>
                        <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${payment.amount}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Monthly Calendar View */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Monthly Calendar</h2>
                  <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                      Previous Month
                    </button>
                    <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                      Next Month
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* Calendar grid would go here */}
                <div className="text-center text-gray-500 py-8">
                  Calendar view coming soon
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supplements Tab */}
        {activeTab === 'supplements' && (
          <div className="space-y-8">
            {/* Supplement Overview */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recommended Supplements</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-sm font-medium text-blue-600">{supplements.length}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {supplements.map((supplement) => (
                    <motion.div
                      key={supplement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{supplement.name}</h3>
                        {supplement.recommended && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiClock className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-900">Timing</span>
                          </div>
                          <p className="text-gray-600">{supplement.timing}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiPackage className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-gray-900">Dosage</span>
                          </div>
                          <p className="text-gray-600">{supplement.dosage}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiTrendingUp className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">Benefits</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {supplement.benefits.map((benefit, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-white text-blue-600 text-sm rounded-full border border-blue-100"
                              >
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supplement Schedule */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Supplement Schedule</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {['Morning', 'Afternoon', 'Evening'].map((time) => (
                    <div key={time} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{time}</h3>
                      <div className="space-y-3">
                        {supplements
                          .filter(s => s.timing.toLowerCase().includes(time.toLowerCase()))
                          .map((supplement) => (
                            <div key={supplement.id} className="bg-white rounded-lg p-4">
                              <p className="font-medium text-gray-900">{supplement.name}</p>
                              <p className="text-sm text-gray-600">{supplement.dosage}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && progressData && (
          <div className="space-y-8">
            {/* Progress Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Workout Completion</h3>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FiActivity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <Chart
                    type="pie"
                    width={200}
                    series={[progressData.workoutsCompleted, progressData.totalWorkouts - progressData.workoutsCompleted]}
                    options={{
                      labels: ['Completed', 'Remaining'],
                      colors: ['#10B981', '#EF4444'],
                      legend: {
                        position: 'bottom',
                      },
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round((progressData.workoutsCompleted / progressData.totalWorkouts) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FiTrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <Chart
                    type="line"
                    width={200}
                    series={[{
                      name: 'Weight',
                      data: progressData.weightProgress.history.map(h => h.weight)
                    }]}
                    options={{
                      chart: {
                        toolbar: {
                          show: false
                        }
                      },
                      xaxis: {
                        categories: progressData.weightProgress.history.map(h => h.date)
                      },
                      yaxis: {
                        title: {
                          text: 'Weight (kg)'
                        }
                      }
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {progressData.weightProgress.current} kg
                  </p>
                  <p className="text-sm text-gray-600">Current Weight</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Body Measurements</h3>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FiPackage className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(progressData.measurements).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-sm text-gray-600 capitalize">{key}</p>
                      <p className="text-lg font-semibold text-gray-900">{value} cm</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Detailed Progress Charts */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Detailed Progress</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                      Weekly
                    </button>
                    <button className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                      Monthly
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Weight Progress</h3>
                    <div className="flex items-center justify-center">
                      <Chart
                        type="line"
                        width={400}
                        series={[{
                          name: 'Weight',
                          data: progressData.weightProgress.history.map(h => h.weight)
                        }]}
                        options={{
                          chart: {
                            toolbar: {
                              show: false
                            }
                          },
                          xaxis: {
                            categories: progressData.weightProgress.history.map(h => h.date)
                          },
                          yaxis: {
                            title: {
                              text: 'Weight (kg)'
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600">Starting Weight</p>
                        <p className="text-2xl font-bold text-gray-900">{progressData.weightProgress.history[progressData.weightProgress.history.length - 1].weight} kg</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600">Current Weight</p>
                        <p className="text-2xl font-bold text-gray-900">{progressData.weightProgress.current} kg</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Body Measurements Progress</h3>
                    <div className="flex items-center justify-center">
                      <Chart
                        type="bar"
                        width={400}
                        series={[{
                          name: 'Measurements',
                          data: Object.values(progressData.measurements)
                        }]}
                        options={{
                          chart: {
                            toolbar: {
                              show: false
                            }
                          },
                          xaxis: {
                            categories: Object.keys(progressData.measurements).map(k => k.charAt(0).toUpperCase() + k.slice(1))
                          },
                          yaxis: {
                            title: {
                              text: 'cm'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meal Plan Tab */}
        {activeTab === 'mealplan' && (
          <div className="space-y-8">
            {/* Current Meal Plan */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Current Meal Plan</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Week of:</span>
                    <span className="text-sm font-medium text-blue-600">Feb 12 - Feb 18</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mealPlan.map((day) => (
                    <div key={day.day} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{day.day}</h3>
                      <div className="space-y-4">
                        {day.meals.map((meal, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{meal.type}</h4>
                              <span className="text-sm text-gray-600">{meal.time}</span>
                            </div>
                            <div className="space-y-2">
                              {meal.foods.map((food, i) => (
                                <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                  <span className="font-medium text-gray-900">{food.name}</span>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-gray-600">{food.portion}</span>
                                    <span className="text-blue-600 font-medium">{food.calories} cal</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Calories</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {meal.foods.reduce((sum, food) => sum + food.calories, 0)} cal
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Meal History */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Meal History</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Total Meals:</span>
                      <span className="text-sm font-medium text-blue-600">{mealHistory.length}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      View All
                      <FiPlus className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select
                      value={mealFilter.dateRange}
                      onChange={(e) => setMealFilter({ ...mealFilter, dateRange: e.target.value })}
                      className="w-full rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                    <select
                      value={mealFilter.mealType}
                      onChange={(e) => setMealFilter({ ...mealFilter, mealType: e.target.value })}
                      className="w-full rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Meals</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={mealFilter.sortBy}
                      onChange={(e) => setMealFilter({ ...mealFilter, sortBy: e.target.value })}
                      className="w-full rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="date">Date</option>
                      <option value="calories">Calories</option>
                    </select>
                  </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                  {filterMealHistory(mealHistory).map((meal, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-lg text-gray-900">{meal.mealType}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(meal.date).toLocaleDateString()} at {meal.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg text-gray-900">{meal.totalCalories} cal</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Foods:</h4>
                        <div className="mt-1 space-y-1">
                          {meal.foods.map((food, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg">
                              <span className="font-medium text-gray-900">{food.name}</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-gray-600">{food.portion}</span>
                                <span className="text-blue-600 font-medium">{food.calories} cal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {meal.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg">
                          <p className="font-medium text-gray-700">Notes:</p>
                          <p>{meal.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add this where you want to display the workouts */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">My Workouts</h2>
          {renderWorkouts()}
        </div>
      </main>
    </div>
  );
} 