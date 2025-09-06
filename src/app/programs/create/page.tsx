'use client';

import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { FiTarget, FiBook, FiTrendingUp, FiSearch, FiFilter } from 'react-icons/fi';
import { calculateHealthMetrics, generateMealPlan, generateWorkoutPlan } from '@/lib/api';
import { HealthMetricsResponse, MealPlanResponse, WorkoutPlanResponse } from '@/types/dashboard';

export default function CreateProgramPage() {
    const [activeTab, setActiveTab] = useState<'assessment' | 'nutrition' | 'exercise'>('assessment');
    const [requestBody, setRequestBody] = useState({
        age: 0,
        gender: 'Male' as 'Male' | 'Female',
        height_cm: 0,
        weight_kg: 0,
        activity_level: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
        fitness_goal: 'maintenance' as 'maintenance' | 'weight-loss' | 'muscle-gain' | 'endurance' | 'flexibility',
        has_diabetes: false,
        has_hypertension: false,
        is_vegetarian: false,
        spice_tolerance: 'medium' as 'low' | 'medium' | 'high',
    });
    const [assessment, setAssessment] = useState<HealthMetricsResponse | null>(null);
    const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
    const [mealPlanLoading, setMealPlanLoading] = useState<boolean>(false);
    const [selectedDays, setSelectedDays] = useState<number>(3);
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanResponse | null>(null);
    const [workoutPlanLoading, setWorkoutPlanLoading] = useState<boolean>(false);
    const [selectedWorkoutDays, setSelectedWorkoutDays] = useState<number>(7);
    const [selectedDuration, setSelectedDuration] = useState<number>(30);
    const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('general');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'form' | 'loading' | 'results'>('form');
    const [progress, setProgress] = useState<number>(0);
    const loadingMessages = [
        'Analyzing your health profile...',
        'Calculating personalized metrics...',
        'Generating nutrition recommendations...',
        'Creating exercise plans...',
        'Optimizing for your goals...',
        'Finalizing your assessment...',
        'Almost ready! Preparing your results...'
    ];
    const [loadingMsg, setLoadingMsg] = useState<string>(loadingMessages[0]);

    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('programFormData') : null;
        if (saved) {
            const parsed = JSON.parse(saved);
            const healthConditions = (parsed.healthConditions || '').toLowerCase();
            const dietaryRestrictions = (parsed.dietaryRestrictions || '').toLowerCase();
            setRequestBody({
                age: Number(parsed.age) || 0,
                gender: (parsed.gender === 'male' ? 'Male' : parsed.gender === 'female' ? 'Female' : 'Male') as any,
                height_cm: Number(parsed.height) || 0,
                weight_kg: Number(parsed.weight) || 0,
                activity_level: (parsed.activityLevel || 'moderate') as any,
                fitness_goal: (parsed.fitnessGoal === 'general-fitness' ? 'maintenance' : parsed.fitnessGoal) as any,
                has_diabetes: /diabet/.test(healthConditions),
                has_hypertension: /hypertension|high blood pressure|bp/.test(healthConditions),
                is_vegetarian: /vegetarian|vegan/.test(dietaryRestrictions),
                spice_tolerance: ((dietaryRestrictions.match(/low|medium|high/)?.[0]) || 'medium') as any,
            });
        }
    }, []);

    useEffect(() => {
        if (view === 'loading') {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [view]);

    // Switch back to assessment tab if user is on nutrition/exercise tab but no assessment data
    useEffect(() => {
        if (!assessment && (activeTab === 'nutrition' || activeTab === 'exercise')) {
            setActiveTab('assessment');
        }
    }, [assessment, activeTab]);

    // Generate meal plan when nutrition tab is accessed
    useEffect(() => {
        if (activeTab === 'nutrition' && assessment && !mealPlan && !mealPlanLoading) {
            generateMealPlanData(selectedDays);
        }
    }, [activeTab, assessment, mealPlan, mealPlanLoading, selectedDays]);

    // Generate workout plan when exercise tab is accessed
    useEffect(() => {
        if (activeTab === 'exercise' && assessment && !workoutPlan && !workoutPlanLoading) {
            generateWorkoutPlanData(selectedWorkoutDays, selectedDuration, selectedWorkoutType);
        }
    }, [activeTab, assessment, workoutPlan, workoutPlanLoading, selectedWorkoutDays, selectedDuration, selectedWorkoutType]);

    const submitAssessment = async (payload: any) => {
        try {
            setAssessment(null);
            setError(null);
            setLoading(true);
            setView('loading');
            setProgress(0);
            setLoadingMsg(loadingMessages[0]);

            const totalDuration = 8000; // 8s
            const interval = 1000;
            const total = totalDuration / interval;
            let tick = 0;
            let apiCompleted = false;
            let apiData: HealthMetricsResponse | null = null;

            const timer = setInterval(() => {
                tick++;
                setProgress(Math.min((tick / total) * 100, 99));
                const idx = Math.floor((tick / total) * loadingMessages.length);
                if (idx < loadingMessages.length) setLoadingMsg(loadingMessages[idx]);

                // If we've reached the end and API is complete, finish loading
                if (tick >= total && apiCompleted) {
                    clearInterval(timer);
                    setProgress(100);
                    setLoadingMsg('Assessment complete! 🎉');
                    
                    setTimeout(() => {
                        setAssessment(apiData);
                        setLoading(false);
                        setView('results');
                    }, 800);
                }
            }, interval);

            // Actual API call (runs in parallel)
            try {
                const result = await calculateHealthMetrics(payload);
                
                if (!result.success) {
                    throw new Error(result.message || 'Failed to calculate health metrics');
                }

                apiData = result.data;
                apiCompleted = true;

                // If timer is still running, let it complete naturally
                // If timer is done, finish immediately
                if (tick >= total) {
                    clearInterval(timer);
                    setProgress(100);
                    setLoadingMsg('Assessment complete! 🎉');
                    
                    setTimeout(() => {
                        setAssessment(apiData);
                        setLoading(false);
                        setView('results');
                    }, 800);
                }

            } catch (apiError: any) {
                clearInterval(timer);
                setError(apiError?.message || 'Failed to calculate health metrics');
                setLoading(false);
                setView('form');
            }

        } catch (e: any) {
            setError(e?.message || 'Failed to calculate health metrics');
            setLoading(false);
            setView('form');
        }
    };

    const emojis = requestBody.gender === 'Female'
        ? ['🏋️‍♀️','💃','🏃‍♀️','🚴‍♀️','🏊‍♀️','✨','🌟']
        : ['🏋️‍♂️','💪','🏃‍♂️','🚴‍♂️','🏊‍♂️','⚡','🔥'];

    const generateMealPlanData = async (days: number = selectedDays) => {
        if (!assessment) return;
        
        try {
            setMealPlanLoading(true);
            const result = await generateMealPlan({
                user_id: 'user_' + Date.now(), // Generate a unique user ID
                target_calories: assessment.daily_calories,
                n_days: days,
                meal_plan_type: 'traditional'
            });

            if (result.success) {
                setMealPlan(result.data);
            } else {
                console.error('Failed to generate meal plan:', result.message);
            }
        } catch (error) {
            console.error('Error generating meal plan:', error);
        } finally {
            setMealPlanLoading(false);
        }
    };

    const generateWorkoutPlanData = async (days: number = selectedWorkoutDays, duration: number = selectedDuration, workoutType: string = selectedWorkoutType) => {
        if (!assessment) return;
        
        try {
            setWorkoutPlanLoading(true);
            const result = await generateWorkoutPlan({
                user_id: 'user_' + Date.now(), // Generate a unique user ID
                duration_minutes: duration,
                workout_type: workoutType,
                n_days: days
            });

            if (result.success) {
                setWorkoutPlan(result.data);
            } else {
                console.error('Failed to generate workout plan:', result.message);
            }
        } catch (error) {
            console.error('Error generating workout plan:', error);
        } finally {
            setWorkoutPlanLoading(false);
        }
    };

    const tabs = [
        { id: 'assessment', name: 'Assessment', icon: FiTarget, description: 'Get personalized recommendations' },
        { id: 'nutrition', name: 'Nutrition Recommendations', icon: FiBook, description: 'Browse nutrition plans' },
        { id: 'exercise', name: 'Exercise Recommendations', icon: FiTrendingUp, description: 'View exercise plans' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'assessment':
                return (

                    <div className="space-y-4">
                        
                        {view === 'form' && (
                            <div className="rounded-xl p-0 mb-0">

                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Comprehensive Assessment</h2>
                                </div>

                                <form
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded mb-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        // Validate form before submitting
                                        if (requestBody.height_cm < 100) {
                                            setError('Height must be at least 100cm');
                                            return;
                                        }
                                        if (requestBody.weight_kg < 30) {
                                            setError('Weight must be at least 30kg');
                                            return;
                                        }
                                        if (requestBody.age < 1) {
                                            setError('Please enter a valid age');
                                            return;
                                        }
                                        submitAssessment(requestBody);
                                    }}
                                >
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Age</label>
                                        <input type="number" value={requestBody.age}
                                               onChange={(e) => setRequestBody({ ...requestBody, age: Number(e.target.value) })}
                                               className="w-full border rounded px-3 py-2 text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Gender</label>
                                        <select value={requestBody.gender}
                                                onChange={(e) => setRequestBody({ ...requestBody, gender: e.target.value as any })}
                                                className="w-full border rounded px-3 py-2 text-sm">
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
                                        <input type="number" value={requestBody.height_cm}
                                               onChange={(e) => setRequestBody({ ...requestBody, height_cm: Number(e.target.value) })}
                                               className="w-full border rounded px-3 py-2 text-sm" 
                                               min="100" 
                                               max="250"
                                               required />
                                        {requestBody.height_cm > 0 && requestBody.height_cm < 100 && (
                                            <p className="text-xs text-red-500 mt-1">Height must be at least 100cm</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                                        <input type="number" value={requestBody.weight_kg}
                                               onChange={(e) => setRequestBody({ ...requestBody, weight_kg: Number(e.target.value) })}
                                               className="w-full border rounded px-3 py-2 text-sm" 
                                               min="30" 
                                               max="300"
                                               required />
                                        {requestBody.weight_kg > 0 && requestBody.weight_kg < 30 && (
                                            <p className="text-xs text-red-500 mt-1">Weight must be at least 30kg</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Activity Level</label>
                                        <select value={requestBody.activity_level}
                                                onChange={(e) => setRequestBody({ ...requestBody, activity_level: e.target.value as any })}
                                                className="w-full border rounded px-3 py-2 text-sm">
                                            <option value="sedentary">Sedentary</option>
                                            <option value="light">Light</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="active">Active</option>
                                            <option value="very_active">Very Active</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Fitness Goal</label>
                                        <select value={requestBody.fitness_goal}
                                                onChange={(e) => setRequestBody({ ...requestBody, fitness_goal: e.target.value as any })}
                                                className="w-full border rounded px-3 py-2 text-sm">
                                            <option value="maintenance">Maintenance</option>
                                            <option value="weight-loss">Weight Loss</option>
                                            <option value="muscle-gain">Muscle Gain</option>
                                            <option value="endurance">Endurance</option>
                                            <option value="flexibility">Flexibility</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input id="has_diabetes" type="checkbox" checked={requestBody.has_diabetes}
                                               onChange={(e) => setRequestBody({ ...requestBody, has_diabetes: e.target.checked })}
                                               className="h-4 w-4" />
                                        <label htmlFor="has_diabetes" className="text-sm text-gray-700">Has Diabetes</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input id="has_hypertension" type="checkbox" checked={requestBody.has_hypertension}
                                               onChange={(e) => setRequestBody({ ...requestBody, has_hypertension: e.target.checked })}
                                               className="h-4 w-4" />
                                        <label htmlFor="has_hypertension" className="text-sm text-gray-700">Has Hypertension</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input id="is_vegetarian" type="checkbox" checked={requestBody.is_vegetarian}
                                               onChange={(e) => setRequestBody({ ...requestBody, is_vegetarian: e.target.checked })}
                                               className="h-4 w-4" />
                                        <label htmlFor="is_vegetarian" className="text-sm text-gray-700">Vegetarian</label>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Spice Tolerance</label>
                                        <select value={requestBody.spice_tolerance}
                                                onChange={(e) => setRequestBody({ ...requestBody, spice_tolerance: e.target.value as any })}
                                                className="w-full border rounded px-3 py-2 text-sm">
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                                            Let's go!   
                                        </button>
                                    </div>
                                </form>

                                {error && (
                                    <div className="text-sm text-red-600">{error}</div>
                                )}
                            </div>
                        )}

                        {view === 'results' && assessment && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Assessment Results</h2>
                                    <button
                                        onClick={() => { setAssessment(null); setView('form'); }}
                                        className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded"
                                    >
                                        New Assessment
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">BMI</p>
                                        <p className="font-semibold">{assessment.bmi}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">BMI Category</p>
                                        <p className="font-semibold">{assessment.bmi_category}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">Body Fat %</p>
                                        <p className="font-semibold">{assessment.body_fat_percentage}%</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">BMR</p>
                                        <p className="font-semibold">{assessment.bmr} kcal</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">TDEE</p>
                                        <p className="font-semibold">{assessment.tdee} kcal</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">Ideal Weight</p>
                                        <p className="font-semibold">{assessment.ideal_weight_kg} kg</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">Daily Calories</p>
                                        <p className="font-semibold">{assessment.daily_calories} kcal</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">Health Risk Score</p>
                                        <p className="font-semibold">{assessment.health_risk_score}/100</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">Water Intake</p>
                                        <p className="font-semibold">{assessment.water_intake_ml} ml</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-medium text-blue-900 mb-2">View Detailed Recommendations</h3>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Your assessment is complete! Use the tabs above to view detailed nutrition and exercise recommendations.
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setActiveTab('nutrition')}
                                            className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded"
                                        >
                                            View Nutrition
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('exercise')}
                                            className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded"
                                        >
                                            View Exercises
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'nutrition':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">Personalized Meal Plan</h2>
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="days-select" className="text-sm font-medium text-gray-700">
                                        Days:
                                    </label>
                                    <select
                                        id="days-select"
                                        value={selectedDays}
                                        onChange={(e) => setSelectedDays(Number(e.target.value))}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={mealPlanLoading}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                            <option key={day} value={day}>
                                                {day} {day === 1 ? 'Day' : 'Days'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={() => {
                                        setMealPlan(null);
                                        if (assessment) generateMealPlanData(selectedDays);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg w-full sm:w-auto"
                                    disabled={mealPlanLoading}
                                >
                                    {mealPlanLoading ? 'Generating...' : 'Generate Plan'}
                                </button>
                            </div>
                        </div>

                        {assessment && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Nutrition Profile</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{assessment.daily_calories}</p>
                                        <p className="text-sm text-blue-700">Target Calories</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{assessment.water_intake_ml}ml</p>
                                        <p className="text-sm text-green-700">Water Intake</p>
                                    </div>
                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">{assessment.ideal_weight_kg}kg</p>
                                        <p className="text-sm text-orange-700">Ideal Weight</p>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">{assessment.health_risk_score}/100</p>
                                        <p className="text-sm text-purple-700">Health Score</p>
                                                </div>
                                                    </div>
                                                        </div>
                                                    )}

                        {mealPlanLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Meal Plan</h3>
                                <p className="text-gray-600">Creating personalized nutrition recommendations based on your health profile...</p>
                            </div>
                        ) : mealPlan ? (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{mealPlan.plan_duration_days}-Day Meal Plan</h3>
                                    <p className="text-gray-600">Target: {mealPlan.target_calories_per_day} calories per day • Plan Type: {mealPlan.plan_type}</p>
                                </div>

                                {Object.entries(mealPlan.meal_plan).map(([dayKey, dayPlan], dayIndex) => (
                                    <div key={dayKey} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h4 className="text-xl font-semibold text-gray-900 mb-4">Day {dayIndex + 1}</h4>
                                        
                                        {/* Daily Nutrition Summary */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                                    <div className="text-center">
                                                <p className="text-lg font-bold text-blue-600">{Math.round(dayPlan.daily_nutrition.total_calories)}</p>
                                                <p className="text-xs text-gray-500">Calories</p>
                                                    </div>
                                                        <div className="text-center">
                                                <p className="text-lg font-bold text-green-600">{Math.round(dayPlan.daily_nutrition.total_protein)}g</p>
                                                <p className="text-xs text-gray-500">Protein</p>
                                                        </div>
                                                        <div className="text-center">
                                                <p className="text-lg font-bold text-orange-600">{Math.round(dayPlan.daily_nutrition.total_carbs)}g</p>
                                                <p className="text-xs text-gray-500">Carbs</p>
                                                        </div>
                                                        <div className="text-center">
                                                <p className="text-lg font-bold text-red-600">{Math.round(dayPlan.daily_nutrition.total_fat)}g</p>
                                                <p className="text-xs text-gray-500">Fat</p>
                                                        </div>
                                                </div>

                                        {/* Meals */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.entries(dayPlan.meals).map(([mealType, mealItems]) => (
                                                <div key={mealType} className="space-y-3">
                                                    <h5 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                                                        {mealType === 'breakfast' && '🌅'}
                                                        {mealType === 'lunch' && '☀️'}
                                                        {mealType === 'dinner' && '🌙'}
                                                        {mealType === 'snack' && '🍎'}
                                                        {mealType}
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {mealItems.map((item: any, itemIndex: number) => (
                                                            <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                                    <p className="text-sm text-gray-500">{item.portion_g}g • {item.category}</p>
                                            </div>
                                                                <div className="text-right">
                                                                    <p className="font-semibold text-blue-600">{Math.round(item.calories)} cal</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        P: {Math.round(item.protein)}g • C: {Math.round(item.carbs)}g • F: {Math.round(item.fat)}g
                                                                    </p>
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
                        ) : assessment ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🍽️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Your Meal Plan</h3>
                                <p className="text-gray-600 mb-4">Select the number of days and click "Generate Plan" to create your personalized meal plan.</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                                    <label htmlFor="days-select-ready" className="text-sm font-medium text-gray-700">
                                        Days:
                                    </label>
                                    <select
                                        id="days-select-ready"
                                        value={selectedDays}
                                        onChange={(e) => setSelectedDays(Number(e.target.value))}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                            <option key={day} value={day}>
                                                {day} {day === 1 ? 'Day' : 'Days'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={() => generateMealPlanData(selectedDays)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Generate {selectedDays}-Day Meal Plan
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🥗</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Assessment First</h3>
                                <p className="text-gray-600">Complete your health assessment to get personalized meal plans.</p>
                            </div>
                        )}
                    </div>
                );

            case 'exercise':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">Personalized Workout Plan</h2>
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="workout-days-select" className="text-sm font-medium text-gray-700">
                                        Days:
                                    </label>
                                    <select
                                        id="workout-days-select"
                                        value={selectedWorkoutDays}
                                        onChange={(e) => setSelectedWorkoutDays(Number(e.target.value))}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={workoutPlanLoading}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                            <option key={day} value={day}>
                                                {day} {day === 1 ? 'Day' : 'Days'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="duration-select" className="text-sm font-medium text-gray-700">
                                        Duration:
                                    </label>
                                    <select
                                        id="duration-select"
                                        value={selectedDuration}
                                        onChange={(e) => setSelectedDuration(Number(e.target.value))}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={workoutPlanLoading}
                                    >
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>60 min</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="workout-type-select" className="text-sm font-medium text-gray-700">
                                        Type:
                                    </label>
                                    <select
                                        id="workout-type-select"
                                        value={selectedWorkoutType}
                                        onChange={(e) => setSelectedWorkoutType(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={workoutPlanLoading}
                                    >
                                        <option value="general">General</option>
                                        <option value="cardio">Cardio</option>
                                        <option value="strength">Strength</option>
                                        <option value="flexibility">Flexibility</option>
                                    </select>
                                </div>
                                <button 
                                    onClick={() => {
                                        setWorkoutPlan(null);
                                        if (assessment) generateWorkoutPlanData(selectedWorkoutDays, selectedDuration, selectedWorkoutType);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg w-full sm:w-auto"
                                    disabled={workoutPlanLoading}
                                >
                                    {workoutPlanLoading ? 'Generating...' : 'Generate Plan'}
                                </button>
                            </div>
                        </div>

                        {assessment && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Fitness Profile</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{Math.round(assessment.tdee - assessment.bmr)}</p>
                                        <p className="text-sm text-blue-700">Daily Activity Calories</p>
                                                </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600 capitalize">{requestBody.activity_level}</p>
                                        <p className="text-sm text-green-700">Activity Level</p>
                                    </div>
                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600 capitalize">{requestBody.fitness_goal.replace('-', ' ')}</p>
                                        <p className="text-sm text-orange-700">Fitness Goal</p>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">{assessment.bmi_category}</p>
                                        <p className="text-sm text-purple-700">BMI Category</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {workoutPlanLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Workout Plan</h3>
                                <p className="text-gray-600">Creating personalized exercise recommendations based on your fitness profile...</p>
                            </div>
                        ) : workoutPlan ? (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{workoutPlan.plan_duration_days}-Day Workout Plan</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                    <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{workoutPlan.total_workout_days}</p>
                                            <p className="text-sm text-gray-600">Workout Days</p>
                                                    </div>
                                                    <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{workoutPlan.total_rest_days}</p>
                                            <p className="text-sm text-gray-600">Rest Days</p>
                                                    </div>
                                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-orange-600">{workoutPlan.estimated_weekly_calories_burned}</p>
                                            <p className="text-sm text-gray-600">Weekly Calories</p>
                                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-600">{workoutPlan.average_workout_duration}min</p>
                                            <p className="text-sm text-gray-600">Avg Duration</p>
                                        </div>
                                    </div>
                                </div>

                                {Object.entries(workoutPlan.workout_plan).map(([dayKey, dayPlan], dayIndex) => (
                                    <div key={dayKey} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xl font-semibold text-gray-900">Day {dayIndex + 1}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                    dayPlan.type === 'rest' 
                                                        ? 'bg-gray-100 text-gray-800' 
                                                        : dayPlan.type === 'cardio'
                                                        ? 'bg-red-100 text-red-800'
                                                        : dayPlan.type === 'strength'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {dayPlan.type === 'rest' ? '🛌 Rest' : 
                                                     dayPlan.type === 'cardio' ? '❤️ Cardio' :
                                                     dayPlan.type === 'strength' ? '💪 Strength' : '🤸 Flexibility'}
                                                </span>
                                                {dayPlan.type !== 'rest' && 'estimated_calories_burned' in dayPlan && (
                                                    <span className="text-sm text-gray-600">
                                                        {dayPlan.estimated_calories_burned} cal
                                                    </span>
                                                    )}
                                                </div>
                                        </div>

                                        {dayPlan.type === 'rest' ? (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <h5 className="font-medium text-gray-900 mb-2">Rest Day Activities</h5>
                                                    <ul className="space-y-1">
                                                        {dayPlan.activities.map((activity, idx) => (
                                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                                {activity}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <p className="text-sm text-gray-600 italic">{dayPlan.notes}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Warm Up */}
                                                <div className="space-y-3">
                                                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                                        🔥 Warm Up ({dayPlan.warm_up.duration_minutes} min)
                                                    </h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {dayPlan.warm_up.exercises.map((exercise, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                                                <span className="text-sm font-medium text-gray-900">{exercise.name}</span>
                                                                <span className="text-xs text-gray-600">{exercise.duration}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Main Workout */}
                                                <div className="space-y-3">
                                                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                                        💪 Main Workout ({dayPlan.main_workout.duration_minutes} min)
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {dayPlan.main_workout.exercises.map((exercise, idx) => (
                                                            <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h6 className="font-medium text-gray-900">{exercise.name}</h6>
                                                                    <div className="text-right text-sm">
                                                                        <p className="text-blue-600 font-semibold">{exercise.calories_burned} cal</p>
                                                                        <p className="text-gray-500">Difficulty: {exercise.difficulty}/5</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-3">{exercise.instructions}</p>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                                    <div className="bg-white p-2 rounded">
                                                                        <p className="font-medium text-gray-700">Duration</p>
                                                                        <p className="text-gray-600">{exercise.duration_minutes} min</p>
                                                                    </div>
                                                                    {exercise.sets.sets && (
                                                                        <div className="bg-white p-2 rounded">
                                                                            <p className="font-medium text-gray-700">Sets</p>
                                                                            <p className="text-gray-600">{exercise.sets.sets}</p>
                                                    </div>
                                                )}
                                                                    {exercise.sets.reps && (
                                                                        <div className="bg-white p-2 rounded">
                                                                            <p className="font-medium text-gray-700">Reps</p>
                                                                            <p className="text-gray-600">{exercise.sets.reps}</p>
                                            </div>
                                                                    )}
                                                                    {exercise.sets.rest_seconds && (
                                                                        <div className="bg-white p-2 rounded">
                                                                            <p className="font-medium text-gray-700">Rest</p>
                                                                            <p className="text-gray-600">{exercise.sets.rest_seconds}s</p>
                                                                        </div>
                                                                    )}
                                        </div>
                                    </div>
                                ))}
                                                    </div>
                                                </div>

                                                {/* Cool Down */}
                                                <div className="space-y-3">
                                                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                                        ❄️ Cool Down ({dayPlan.cool_down.duration_minutes} min)
                                                    </h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {dayPlan.cool_down.exercises.map((exercise, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                                <span className="text-sm font-medium text-gray-900">{exercise.name}</span>
                                                                <span className="text-xs text-gray-600">{exercise.duration}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600 italic">{dayPlan.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : assessment ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏋️‍♂️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Your Workout Plan</h3>
                                <p className="text-gray-600 mb-4">Select your preferences and click "Generate Plan" to create your personalized workout routine.</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="workout-days-ready" className="text-sm font-medium text-gray-700">
                                            Days:
                                        </label>
                                        <select
                                            id="workout-days-ready"
                                            value={selectedWorkoutDays}
                                            onChange={(e) => setSelectedWorkoutDays(Number(e.target.value))}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                                <option key={day} value={day}>
                                                    {day} {day === 1 ? 'Day' : 'Days'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="duration-ready" className="text-sm font-medium text-gray-700">
                                            Duration:
                                        </label>
                                        <select
                                            id="duration-ready"
                                            value={selectedDuration}
                                            onChange={(e) => setSelectedDuration(Number(e.target.value))}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value={15}>15 min</option>
                                            <option value={30}>30 min</option>
                                            <option value={45}>45 min</option>
                                            <option value={60}>60 min</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="workout-type-ready" className="text-sm font-medium text-gray-700">
                                            Type:
                                        </label>
                                        <select
                                            id="workout-type-ready"
                                            value={selectedWorkoutType}
                                            onChange={(e) => setSelectedWorkoutType(e.target.value)}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="general">General</option>
                                            <option value="cardio">Cardio</option>
                                            <option value="strength">Strength</option>
                                            <option value="flexibility">Flexibility</option>
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => generateWorkoutPlanData(selectedWorkoutDays, selectedDuration, selectedWorkoutType)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Generate {selectedWorkoutDays}-Day Workout Plan
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏋️‍♂️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Assessment First</h3>
                                <p className="text-gray-600">Complete your health assessment to get personalized workout plans.</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8 relative">
            {/* Loading full-screen view */}
            {view === 'loading' && (
                <div className="fixed inset-0 z-50 bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0">
                        {/* Floating geometric shapes */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-4 h-4 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-lg animate-pulse"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`
                                }}
                            />
                        ))}
                        {/* Gradient orbs */}
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={`orb-${i}`}
                                className="absolute w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-300/20 rounded-full blur-xl"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 4}s`,
                                    animationDuration: `${4 + Math.random() * 3}s`
                                }}
                            />
                        ))}
                    </div>
                    
                    <div className="text-center max-w-3xl mx-auto px-8 relative z-10">
                        {/* Main fitness emoji with enhanced animation */}
                        <div className="mb-12">
                            <div className="text-8xl mb-8 animate-bounce" style={{ animationDuration: '2.5s' }}>
                                {emojis[Math.min(emojis.length - 1, Math.floor((progress / 100) * emojis.length))]}
                            </div>
                            <div className="text-5xl mb-6 animate-pulse" style={{ animationDuration: '2s' }}>
                                {/* {requestBody.gender === 'male' ? '💪' : '✨'} */}
                            </div>
                        </div>

                        {/* Enhanced progress bar with white theme */}
                        <div className="mb-10">
                            <div className="w-full bg-gray-200/50 rounded-full h-3 mb-4 backdrop-blur-sm border border-gray-300/30">
                                <div 
                                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 shadow-lg transition-all duration-800 ease-out"
                                    style={{ width: `${Math.round(progress)}%` }}
                                />
                            </div>
                            <p className="text-gray-700 text-sm font-semibold">{Math.round(progress)}% Complete</p>
                        </div>

                        {/* Enhanced loading message with white theme */}
                        <div className="mb-10">
                            <h2 className="text-4xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {requestBody.gender === 'Male' ? 'Building Your Fitness Plan' : 'Creating Your Wellness Journey'}
                            </h2>
                            <p className="text-xl text-gray-700 mb-3 font-medium">{loadingMsg}</p>
                            <p className="text-gray-600 text-lg">
                                {requestBody.gender === 'Male' 
                                    ? "We're crafting the perfect workout and nutrition plan for your goals!" 
                                    : "We're designing a personalized wellness program just for you!"
                                }
                            </p>
                        </div>

                        {/* Estimated time with enhanced styling */}
                        <div className="text-gray-600 text-sm  backdrop-blur-sm rounded-2xl p-6 ">
                            <p className="font-semibold text-gray-700">Estimated time remaining: {Math.max(0, Math.ceil((100 - progress) / 100 * 8))} seconds</p>
                            <p className="mt-2 text-gray-500">Please don't close this window</p>
                        </div>

                        {/* Floating fitness icons with white theme */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute text-2xl opacity-30 animate-float"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 4}s`,
                                        animationDuration: `${4 + Math.random() * 3}s`
                                    }}
                                >
                                    {['🏃‍♂️', '🏋️‍♂️', '🚴‍♂️', '🏊‍♂️', '💪', '⚡', '🔥', '🏃‍♀️', '🏋️‍♀️', '🚴‍♀️', '🏊‍♀️', '✨', '🌟'][Math.floor(Math.random() * 13)]}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Fitness Programs</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Create, track, and manage your fitness journey with personalized programs
                    </p>
                </div>

                {/* Tab Navigation - Only show if assessment is completed */}
                {assessment ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6" aria-label="Tabs">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                                activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {tab.name}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                        
                        {/* Tab Content */}
                        <div className="p-6">
                            {renderTabContent()}
                        </div>
                    </div>
                ) : (
                    /* Assessment Form - No tabs visible */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
                        {renderTabContent()}
                    </div>
                )}
            </div>
        </div>
        </>
    );
} 