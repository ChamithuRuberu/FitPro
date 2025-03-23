'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { createWorkout } from '@/lib/api';
import type { Exercise, WorkoutSession, WorkoutPlan, AdvancedWorkoutProgram } from '@/lib/api';
import AdvancedWorkoutProgramForm from './AdvancedWorkoutProgramForm';

interface ClientSummary {
  id: string;
  name: string;
  email: string;
  progress: number;
  nextSession: string;
  program: string;
  status?: string;
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
  duration: number;
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

interface ClientPlanModalProps {
  selectedClient: ClientSummary | null;
  showPlanModal: boolean;
  setShowPlanModal: (show: boolean) => void;
  clientWorkouts: ClientWorkoutPlan[];
  setClientWorkouts: (workouts: ClientWorkoutPlan[]) => void;
  clientMeals: MealPlan[];
  setClientMeals: (meals: MealPlan[]) => void;
}

const workoutExercises = {
  Legs: ['Squat', 'Leg Press', 'Leg Extension', 'Leg Curls', 'Calf Raises'],
  Back: ['Pull-ups', 'Deadlifts', 'Bent Over Rows', 'Lat Pulldowns', 'Face Pulls'],
  Chest: ['Bench Press', 'Incline Press', 'Chest Flyes', 'Push-ups', 'Dips'],
  Arms: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Skull Crushers', 'Preacher Curls'],
  Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises', 'Reverse Flyes', 'Shrugs'],
  Core: ['Planks', 'Crunches', 'Russian Twists', 'Leg Raises', 'Wood Chops']
};

export default function ClientPlanModal({
  selectedClient,
  showPlanModal,
  setShowPlanModal,
  clientWorkouts,
  setClientWorkouts,
  clientMeals,
  setClientMeals
}: ClientPlanModalProps) {
  const [activeModalTab, setActiveModalTab] = useState<'workout' | 'meal'>('workout');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<keyof typeof workoutExercises>('Legs');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseDetails, setExerciseDetails] = useState<WorkoutExercise>({
    name: '',
    sets: 3,
    reps: 12,
    weight: ''
  });
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [workoutTime, setWorkoutTime] = useState('09:00');
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [currentWorkoutExercises, setCurrentWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [activeMealType, setActiveMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [mealTime, setMealTime] = useState('08:00');
  const [mealItems, setMealItems] = useState<{name: string; portion: string; calories: number}[]>([
    { name: '', portion: '', calories: 0 }
  ]);
  const [mealCategory, setMealCategory] = useState<string>('Regular');
  const [selectedDuration, setSelectedDuration] = useState<'1month' | '2months' | '3months'>('1month');
  const [totalWeeks, setTotalWeeks] = useState(4);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const handleWorkoutCreated = (workout: AdvancedWorkoutProgram) => {
    // Convert each week's workouts into ClientWorkoutPlan format
    const newWorkouts: ClientWorkoutPlan[] = workout.weeks.flatMap(week => 
      week.workoutDays.map(day => ({
        id: Math.random().toString(36).substr(2, 9),
        type: day.focusArea.includes('LEGS') ? 'Legs' :
              day.focusArea.includes('BACK') ? 'Back' :
              day.focusArea.includes('CHEST') ? 'Chest' :
              day.focusArea.includes('ARMS') ? 'Arms' :
              day.focusArea.includes('SHOULDERS') ? 'Shoulders' : 'Core',
        exercises: day.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          notes: ex.notes
        })),
        day: day.day,
        startTime: day.startTime,
        duration: day.duration,
        notes: day.generalNotes
      }))
    );

    setClientWorkouts([...clientWorkouts, ...newWorkouts]);
    setShowPlanModal(false);
  };

  const handleAddWorkout = async () => {
    if (!selectedWorkoutType || currentWorkoutExercises.length === 0 || !selectedClient) return;

    // Convert WorkoutExercise[] to Exercise[] by ensuring notes is always a string
    const exercises: Exercise[] = currentWorkoutExercises.map(exercise => ({
      ...exercise,
      notes: exercise.notes || '' // Ensure notes is always a string
    }));

    const workoutPlan: WorkoutPlan = {
      clientId: selectedClient.id,
      workoutName: `${selectedWorkoutType} Workout`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + totalWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      workouts: [{
        type: selectedWorkoutType,
        day: selectedDay,
        startTime: workoutTime,
        duration: workoutDuration,
        exercises: exercises,
        notes: workoutNotes || '' // Ensure notes is always a string
      }]
    };

    try {
      const result = await createWorkout(workoutPlan);
      
      if (result.success) {
        // Update local state
        const newWorkout: ClientWorkoutPlan = {
          id: Math.random().toString(36).substr(2, 9),
          type: selectedWorkoutType,
          exercises: [...currentWorkoutExercises],
          day: selectedDay,
          startTime: workoutTime,
          duration: workoutDuration,
          notes: workoutNotes
        };

        setClientWorkouts([...clientWorkouts, newWorkout]);
        
        // Reset form for next workout
        setSelectedWorkoutType('Legs');
        setCurrentWorkoutExercises([]);
        setWorkoutTime('09:00');
        setWorkoutDuration(60);
        setWorkoutNotes('');

        toast.success('Workout added to plan');
      } else {
        toast.error(result.message || 'Failed to add workout');
      }
    } catch (error) {
      console.error('Error adding workout:', error);
      toast.error('Failed to add workout to plan');
    }
  };

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

  const handleAddMeal = () => {
    if (!activeMealType || mealItems[0].name === '') return;

    const newMeal: MealPlan = {
      id: Math.random().toString(36).substr(2, 9),
      mealType: activeMealType,
      time: mealTime,
      items: [...mealItems],
      category: mealCategory
    };

    setClientMeals([...clientMeals, newMeal]);
    
    // Reset form for next meal
    setActiveMealType('Breakfast');
    setMealTime('08:00');
    setMealItems([{ name: '', portion: '', calories: 0 }]);
    setMealCategory('Regular');

    toast.success('Meal added to plan');
  };

  const handleDeleteMeal = (id: string) => {
    const updatedMeals = clientMeals.filter(meal => meal.id !== id);
    setClientMeals(updatedMeals);
    toast.success('Meal removed from plan');
  };

  if (!selectedClient || !showPlanModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
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
            <AdvancedWorkoutProgramForm
              clientId={selectedClient.id}
              onWorkoutCreated={handleWorkoutCreated}
              onClose={() => setShowPlanModal(false)}
              onNavigateToMealPlan={() => setActiveModalTab('meal')}
            />
          ) : (
            <div className="space-y-6">
              {/* Meal Plan Form */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Plan</h3>
                
                {/* Meal Type Tabs */}
                <div className="flex space-x-2 mb-6">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveMealType(type as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack');
                        setMealTime(
                          type === 'Breakfast' ? '08:00' : 
                          type === 'Lunch' ? '13:00' : 
                          type === 'Dinner' ? '19:00' : '16:00'
                        );
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeMealType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                
                {/* Active Meal Type Section */}
                <div className="border rounded-lg p-5 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-4">{activeMealType} Meal</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={mealTime}
                        onChange={(e) => setMealTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diet Category
                      </label>
                      <select 
                        className="w-full form-select rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        onChange={(e) => setMealCategory(e.target.value)}
                        value={mealCategory}
                      >
                        <option value="Regular">Regular</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Keto">Keto</option>
                        <option value="Low Carb">Low Carb</option>
                        <option value="Gluten Free">Gluten Free</option>
                        <option value="High Protein">High Protein</option>
                      </select>
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

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleAddMeal}
                      disabled={!activeMealType || mealItems[0].name === '' || !mealTime}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                        !activeMealType || mealItems[0].name === '' || !mealTime 
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Add to {activeMealType} Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Meal Plans */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Meal Plan Summary</h3>
                {clientMeals.length > 0 ? (
                  <div className="space-y-4">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((mealType) => {
                      const meals = clientMeals.filter(meal => meal.mealType === mealType);
                      
                      return (
                        <div key={mealType} className="border rounded-lg overflow-hidden">
                          <div className={`px-4 py-3 border-b ${
                            mealType === 'Breakfast' ? 'bg-yellow-50' : 
                            mealType === 'Lunch' ? 'bg-green-50' : 
                            mealType === 'Dinner' ? 'bg-blue-50' : 'bg-purple-50'
                          }`}>
                            <h4 className="font-medium text-gray-900">{mealType}</h4>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {meals.length > 0 ? (
                              meals.map((meal) => (
                                <div key={meal.id} className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="text-sm text-gray-500">Time: {meal.time}</span>
                                      {meal.category && (
                                        <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                          {meal.category}
                                        </span>
                                      )}
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteMeal(meal.id)}
                                      className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {meal.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span>{item.name} ({item.portion})</span>
                                        <span>{item.calories} cal</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                No {mealType.toLowerCase()} meals added yet
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 border rounded-lg">
                    <p className="text-gray-500">No meals added to plan yet</p>
                  </div>
                )}
              </div>

              {/* Save Plan Button */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {/* Add logic to save meal plan */ toast.success('Meal plan saved')}}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Meal Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 