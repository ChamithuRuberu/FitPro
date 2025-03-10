'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiActivity, FiTrendingUp, FiPackage, FiDollarSign, FiUser, FiPlus, FiLogOut, FiClock, FiCheck, FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { getSession, logoutUser } from '@/actions';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
  {
    id: 2,
    name: 'BCAA',
    timing: 'During workout',
    dosage: '5g with water',
    benefits: ['Muscle preservation', 'Energy boost', 'Recovery'],
    recommended: true,
  },
  {
    id: 3,
    name: 'Creatine',
    timing: 'Pre-workout',
    dosage: '5g with water',
    benefits: ['Strength increase', 'Muscle growth', 'Performance'],
    recommended: false,
  },
];

const sampleWorkoutProgram: WorkoutProgram = {
  name: 'Strength & Conditioning Program',
  weeks: [
    {
      weekNumber: 1,
      workouts: [
        {
          day: 'Monday',
          exercises: [
            { name: 'Bench Press', sets: 3, reps: 12, weight: '60kg', completed: true },
            { name: 'Squats', sets: 4, reps: 10, weight: '80kg', completed: true },
            { name: 'Deadlifts', sets: 3, reps: 8, weight: '100kg', completed: false },
          ],
        },
        {
          day: 'Wednesday',
          exercises: [
            { name: 'Pull-ups', sets: 3, reps: 8, weight: 'Body weight', completed: true },
            { name: 'Shoulder Press', sets: 3, reps: 12, weight: '40kg', completed: true },
            { name: 'Lunges', sets: 3, reps: 12, weight: '20kg', completed: false },
          ],
        },
        {
          day: 'Friday',
          exercises: [
            { name: 'Romanian Deadlifts', sets: 3, reps: 12, weight: '70kg', completed: false },
            { name: 'Chest Flyes', sets: 3, reps: 12, weight: '20kg', completed: false },
            { name: 'Leg Press', sets: 4, reps: 10, weight: '120kg', completed: false },
          ],
        },
      ],
    },
  ],
};

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
      {
        type: 'Lunch',
        time: '12:30 PM',
        foods: [
          { name: 'Grilled Chicken', portion: '200g', calories: 330 },
          { name: 'Brown Rice', portion: '1 cup', calories: 216 },
          { name: 'Mixed Vegetables', portion: '1 cup', calories: 100 },
        ],
      },
      {
        type: 'Dinner',
        time: '07:00 PM',
        foods: [
          { name: 'Salmon', portion: '200g', calories: 412 },
          { name: 'Sweet Potato', portion: '1 medium', calories: 103 },
          { name: 'Broccoli', portion: '1 cup', calories: 55 },
        ],
      },
    ],
  },
  {
    day: 'Tuesday',
    meals: [
      {
        type: 'Breakfast',
        time: '07:00 AM',
        foods: [
          { name: 'Greek Yogurt', portion: '1 cup', calories: 133 },
          { name: 'Granola', portion: '1/2 cup', calories: 200 },
          { name: 'Honey', portion: '1 tbsp', calories: 64 },
        ],
      },
      {
        type: 'Lunch',
        time: '12:30 PM',
        foods: [
          { name: 'Tuna Salad', portion: '200g', calories: 280 },
          { name: 'Whole Grain Bread', portion: '2 slices', calories: 160 },
          { name: 'Apple', portion: '1 medium', calories: 95 },
        ],
      },
      {
        type: 'Dinner',
        time: '07:00 PM',
        foods: [
          { name: 'Lean Beef', portion: '200g', calories: 340 },
          { name: 'Quinoa', portion: '1 cup', calories: 222 },
          { name: 'Green Salad', portion: '2 cups', calories: 50 },
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
  {
    date: '2024-02-15',
    mealType: 'Lunch',
    time: '12:30 PM',
    foods: [
      { name: 'Grilled Chicken', portion: '200g', calories: 330 },
      { name: 'Brown Rice', portion: '1 cup', calories: 216 },
      { name: 'Mixed Vegetables', portion: '1 cup', calories: 100 },
      { name: 'Olive Oil', portion: '1 tbsp', calories: 120 },
    ],
    totalCalories: 766,
    notes: 'Added extra vegetables',
  },
  {
    date: '2024-02-15',
    mealType: 'Dinner',
    time: '07:00 PM',
    foods: [
      { name: 'Salmon', portion: '200g', calories: 412 },
      { name: 'Sweet Potato', portion: '1 medium', calories: 103 },
      { name: 'Broccoli', portion: '1 cup', calories: 55 },
      { name: 'Quinoa', portion: '1 cup', calories: 222 },
    ],
    totalCalories: 792,
    notes: 'Post-workout meal',
  },
  {
    date: '2024-02-14',
    mealType: 'Breakfast',
    time: '07:00 AM',
    foods: [
      { name: 'Protein Smoothie', portion: '1 serving', calories: 250 },
      { name: 'Whole Grain Toast', portion: '2 slices', calories: 160 },
      { name: 'Peanut Butter', portion: '2 tbsp', calories: 190 },
      { name: 'Apple', portion: '1 medium', calories: 95 },
    ],
    totalCalories: 695,
    notes: 'Pre-workout breakfast',
  },
  {
    date: '2024-02-14',
    mealType: 'Lunch',
    time: '12:30 PM',
    foods: [
      { name: 'Tuna Salad', portion: '200g', calories: 280 },
      { name: 'Whole Grain Bread', portion: '2 slices', calories: 160 },
      { name: 'Mixed Greens', portion: '2 cups', calories: 50 },
      { name: 'Avocado', portion: '1/2', calories: 160 },
    ],
    totalCalories: 650,
    notes: 'Healthy lunch with good fats',
  },
  {
    date: '2024-02-14',
    mealType: 'Dinner',
    time: '07:00 PM',
    foods: [
      { name: 'Lean Beef', portion: '200g', calories: 340 },
      { name: 'Quinoa', portion: '1 cup', calories: 222 },
      { name: 'Green Salad', portion: '2 cups', calories: 50 },
      { name: 'Balsamic Dressing', portion: '2 tbsp', calories: 60 },
    ],
    totalCalories: 672,
    notes: 'Balanced dinner with protein',
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

export default function ClientDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'supplements' | 'workouts' | 'progress' | 'mealplan'>('overview');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDay[]>(sampleSchedule);
  const [supplements, setSupplements] = useState<Supplement[]>(sampleSupplements);
  const [workoutProgram, setWorkoutProgram] = useState<WorkoutProgram | null>(sampleWorkoutProgram);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (!session.success || !session.data) {
          toast.error('Please log in to access the dashboard');
          router.push('/login');
          return;
        }

        setUserData({
          email: session.data.email,
          fullName: session.data.fullName || '',
          city: session.data.city || '',
          status: session.data.userStatus || 'Active',
          mobile: session.data.mobile || '',
          govId: session.data.govId || null,
        });

        await fetchTabData(activeTab);
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router, activeTab]);

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
    try {
      const result = await logoutUser();
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
            <h1 className="text-2xl font-semibold text-gray-800">
              FIT PRO
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
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {['overview', 'schedule', 'supplements', 'workouts', 'progress', 'mealplan'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
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
                {userData?.status}
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
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{getGreeting()}, {userData?.fullName}</h1>
                  <p className="text-blue-100">Track your fitness journey and stay on top of your goals</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full">
                    <FiActivity className="w-5 h-5 mr-2" />
                    Active Member
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Attendance</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-bold text-gray-900">{progressData?.attendanceRate}%</p>
                      <p className="ml-2 text-sm text-green-600">↑ 5% from last month</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <FiCalendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${progressData?.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weight Progress</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-bold text-gray-900">{sampleBodyMetrics[0].weight} kg</p>
                      <p className="ml-2 text-sm text-green-600">↓ 2.5 kg this month</p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <FiTrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(sampleBodyMetrics[0].weight / sampleBodyMetrics[sampleBodyMetrics.length - 1].weight) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Payment</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-bold text-gray-900">$150</p>
                      <p className="ml-2 text-sm text-gray-600">Due in 5 days</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <FiDollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                    Pay Now
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Trainer Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Trainer</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Profile
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-50">
                    <img
                      src={sampleTrainerData.image}
                      alt={sampleTrainerData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <h3 className="text-xl font-semibold text-gray-900">{sampleTrainerData.name}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                        Available
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{sampleTrainerData.specialization}</p>
                    <div className="flex items-center justify-center md:justify-start mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < Math.floor(sampleTrainerData.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">({sampleTrainerData.rating})</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{sampleTrainerData.bio}</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        {sampleTrainerData.experience} Experience
                      </span>
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                        Certified Trainer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Body Metrics Progress */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Body Metrics Progress</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      Weekly
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                      Monthly
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">Weight Progress</h3>
                    <div className="flex items-center justify-center">
                      <Chart
                        type="line"
                        width={300}
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
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Starting Weight</p>
                        <p className="text-lg font-semibold text-gray-900">{sampleBodyMetrics[sampleBodyMetrics.length - 1].weight} kg</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Current Weight</p>
                        <p className="text-lg font-semibold text-gray-900">{sampleBodyMetrics[0].weight} kg</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">BMI Progress</h3>
                    <div className="flex items-center justify-center">
                      <Chart
                        type="line"
                        width={300}
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
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Starting BMI</p>
                        <p className="text-lg font-semibold text-gray-900">{sampleBodyMetrics[sampleBodyMetrics.length - 1].bmi}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Current BMI</p>
                        <p className="text-lg font-semibold text-gray-900">{sampleBodyMetrics[0].bmi}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {samplePaymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{payment.description}</p>
                        <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${payment.amount}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {schedule.length > 0 ? (
                schedule.map((day) => (
                  <div key={day.id} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{day.day}</h3>
                    <div className="space-y-4">
                      {day.workouts.map((workout, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${workout.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                              {workout.completed ? (
                                <FiCheck className="w-5 h-5 text-green-600" />
                              ) : (
                                <FiClock className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{workout.type}</p>
                              <p className="text-sm text-gray-600">{workout.time}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">{workout.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No schedule available yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Supplements Tab */}
        {activeTab === 'supplements' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recommended Supplements</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {supplements.length > 0 ? (
                supplements.map((supplement) => (
                  <div key={supplement.id} className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{supplement.name}</h3>
                      {supplement.recommended && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Timing</p>
                        <p className="font-medium">{supplement.timing}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dosage</p>
                        <p className="font-medium">{supplement.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Benefits</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {supplement.benefits.map((benefit, index) => (
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
                  No supplements recommended yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div className="space-y-6">
            {/* Current Program */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {workoutProgram ? workoutProgram.name : 'Workout Program'}
                </h2>
              </div>
              <div className="p-6">
                {workoutProgram ? (
                  workoutProgram.weeks.map((week) => (
                    <div key={week.weekNumber} className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Week {week.weekNumber}</h3>
                      <div className="space-y-6">
                        {week.workouts.map((workout, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6">
                            <h4 className="font-medium mb-4">{workout.day}</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {workout.exercises.map((exercise, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium">{exercise.name}</p>
                                    {exercise.completed ? (
                                      <FiCheck className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <FiX className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600">
                                    <p>{exercise.sets} sets × {exercise.reps} reps</p>
                                    <p>Weight: {exercise.weight}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    No workout program available yet
                  </div>
                )}
              </div>
            </div>

            {/* Workout History */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Workout History</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Total Workouts:</span>
                    <span className="text-sm font-medium text-blue-600">{workoutHistory.length}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select
                      value={workoutFilter.dateRange}
                      onChange={(e) => setWorkoutFilter({ ...workoutFilter, dateRange: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Workout Type</label>
                    <select
                      value={workoutFilter.type}
                      onChange={(e) => setWorkoutFilter({ ...workoutFilter, type: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="Cardio">Cardio</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Yoga">Yoga</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={workoutFilter.sortBy}
                      onChange={(e) => setWorkoutFilter({ ...workoutFilter, sortBy: e.target.value })}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="date">Date</option>
                      <option value="calories">Calories</option>
                    </select>
                  </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                  {filterWorkoutHistory(workoutHistory).map((workout, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg">{workout.workoutType}</h3>
                          <p className="text-sm text-gray-600">{new Date(workout.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">{workout.duration}</p>
                          <p className="text-sm text-gray-600">{workout.caloriesBurned} cal</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700">Exercises:</h4>
                        <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {workout.exercises.map((exercise, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                              <span className="font-medium">{exercise.name}</span>
                              <span className="text-gray-600">
                                {exercise.sets}×{exercise.reps} {exercise.weight !== 'N/A' && `@ ${exercise.weight}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {workout.notes && (
                        <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded">
                          <p className="font-medium">Notes:</p>
                          <p>{workout.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && progressData && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Rate</h3>
                <div className="flex items-center justify-center">
                  <Chart
                    type="pie"
                    width={300}
                    series={[progressData.attendanceRate, 100 - progressData.attendanceRate]}
                    options={{
                      labels: ['Present', 'Absent'],
                      colors: ['#10B981', '#EF4444'],
                      legend: {
                        position: 'bottom',
                      },
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {progressData.attendanceRate}%
                  </p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Measurements</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(progressData.measurements).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-sm text-gray-600 capitalize">{key}</p>
                      <p className="text-lg font-semibold text-gray-900">{value} cm</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Weight Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
              <div className="flex items-center justify-center">
                <Chart
                  type="line"
                  width={600}
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
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressData.weightProgress.current} kg
                  </p>
                  <p className="text-sm text-gray-600">Current Weight</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressData.weightProgress.target} kg
                  </p>
                  <p className="text-sm text-gray-600">Target Weight</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Meal Plan Tab */}
        {activeTab === 'mealplan' && (
          <div className="space-y-6">
            {/* Current Meal Plan */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Current Meal Plan</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {mealPlan.length > 0 ? (
                  mealPlan.map((day) => (
                    <div key={day.day} className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{day.day}</h3>
                      <div className="space-y-4">
                        {day.meals.map((meal, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{meal.type}</h4>
                              <span className="text-sm text-gray-600">{meal.time}</span>
                            </div>
                            <div className="space-y-2">
                              {meal.foods.map((food, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span>{food.name}</span>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-gray-600">{food.portion}</span>
                                    <span className="text-gray-900 font-medium">{food.calories} cal</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No meal plan available yet
                  </div>
                )}
              </div>
            </div>

            {/* Meal History */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Meal History</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Total Meals:</span>
                    <span className="text-sm font-medium text-blue-600">{mealHistory.length}</span>
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
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="date">Date</option>
                      <option value="calories">Calories</option>
                    </select>
                  </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                  {filterMealHistory(mealHistory).map((meal, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg">{meal.mealType}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(meal.date).toLocaleDateString()} at {meal.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">{meal.totalCalories} cal</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700">Foods:</h4>
                        <div className="mt-1 space-y-1">
                          {meal.foods.map((food, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                              <span className="font-medium">{food.name}</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-gray-600">{food.portion}</span>
                                <span className="text-gray-900">{food.calories} cal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {meal.notes && (
                        <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded">
                          <p className="font-medium">Notes:</p>
                          <p>{meal.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 