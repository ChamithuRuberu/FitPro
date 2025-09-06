export type UserRole = 'super_admin' | 'gym_admin' | 'trainer' | 'client';

export interface GymData {
  id: string;
  name: string;
  location: string;
  memberCount: number;
  trainerCount: number;
  rating: number;
  revenue: number;
  status: 'active' | 'inactive';
  nextPaymentDate: string;
  registeredDate: string;
}

export interface TrainerData {
  id: string;
  name: string;
  gym: string;
  clientCount: number;
  rating: number;
  specializations: string[];
  activePrograms: number;
  revenue: number;
  status: 'active' | 'inactive';
  nextPaymentDate: string;
  registeredDate: string;
}

export interface ClientData {
  id: string;
  name: string;
  program: string;
  trainer: string;
  progress: number;
  attendance: number;
  nextSession: string;
  subscriptionStatus: 'active' | 'expired' | 'pending';
  nextPaymentDate: string;
  registeredDate: string;
}

export interface DashboardStats {
  totalRevenue: number;
  activeMembers: number;
  totalTrainers: number;
  totalGyms: number;
  activePrograms: number;
  averageRating: number;
  pendingPayments: number;
  newRegistrations: number;
}

export interface HealthMetricsRequest {
  age: number;
  gender: 'Male' | 'Female';
  height_cm: number;
  weight_kg: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitness_goal: 'maintenance' | 'weight-loss' | 'muscle-gain' | 'endurance' | 'flexibility';
  has_diabetes: boolean;
  has_hypertension: boolean;
  is_vegetarian: boolean;
  spice_tolerance: 'low' | 'medium' | 'high';
}

export interface HealthMetricsResponse {
  bmi: number;
  bmi_category: string;
  body_fat_percentage: number;
  bmr: number;
  tdee: number;
  ideal_weight_kg: number;
  daily_calories: number;
  health_risk_score: number;
  water_intake_ml: number;
}

export interface MealItem {
  food_id: string;
  name: string;
  portion_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

export interface DailyNutrition {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface DayMeals {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snack: MealItem[];
}

export interface DayPlan {
  meals: DayMeals;
  daily_nutrition: DailyNutrition;
}

export interface MealPlanResponse {
  meal_plan: {
    day_1: DayPlan;
    day_2: DayPlan;
    day_3: DayPlan;
  };
  plan_duration_days: number;
  target_calories_per_day: number;
  plan_type: string;
}

export interface Exercise {
  name: string;
  duration: string;
}

export interface ExerciseWithDetails {
  name: string;
  duration_minutes: number;
  sets: {
    sets?: number;
    reps?: string;
    rest_seconds?: number;
    duration?: string;
    intensity?: string;
  };
  calories_burned: number;
  instructions: string;
  difficulty: number;
}

export interface WorkoutSection {
  duration_minutes: number;
  exercises: Exercise[];
}

export interface MainWorkoutSection {
  duration_minutes: number;
  exercises: ExerciseWithDetails[];
}

export interface RestDay {
  type: 'rest';
  activities: string[];
  duration_minutes: number;
  notes: string;
}

export interface WorkoutDay {
  type: 'cardio' | 'strength' | 'flexibility';
  total_duration_minutes: number;
  warm_up: WorkoutSection;
  main_workout: MainWorkoutSection;
  cool_down: WorkoutSection;
  estimated_calories_burned: number;
  notes: string;
}

export interface WorkoutPlanResponse {
  workout_plan: {
    [key: string]: WorkoutDay | RestDay;
  };
  plan_duration_days: number;
  total_workout_days: number;
  total_rest_days: number;
  estimated_weekly_calories_burned: number;
  average_workout_duration: number;
  workout_type: string;
} 