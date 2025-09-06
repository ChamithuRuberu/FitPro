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
        if (activeTab === 'exercise' && assessment && mealPlan && !workoutPlan) {
            generateWorkoutPlanData();
        }
    }, [activeTab, assessment, mealPlan, workoutPlan]);

    const submitAssessment = async (payload: any) => {
        try {
            setAssessment(null);
            setError(null);
            setLoading(true);
            setView('loading');
            setProgress(0);
            setLoadingMsg(loadingMessages[0]);

            const totalDuration = 3000; // 3s
            const interval = 500;
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
                    }, 300);
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
                    }, 300);
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

    const generateWorkoutPlanData = async () => {
        if (!assessment || !mealPlan) return;
        
        try {
            const result = await generateWorkoutPlan({
                user_id: 'user_' + Date.now(), // Generate a unique user ID
                duration_minutes: 30, // Fixed duration - determined by backend
                workout_type: 'general', // Fixed workout type - determined internally
                n_days: mealPlan.plan_duration_days // Use meal plan duration days
            });

            if (result.success) {
                setWorkoutPlan(result.data);
            } else {
                console.error('Failed to generate workout plan:', result.message);
            }
        } catch (error) {
            console.error('Error generating workout plan:', error);
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
                                    className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        // Clear previous errors
                                        setError(null);
                                        
                                        // Validate form before submitting
                                        if (!requestBody.age || requestBody.age < 1 || requestBody.age > 120) {
                                            setError('Please enter a valid age between 1 and 120 years');
                                            return;
                                        }
                                        if (!requestBody.height_cm || requestBody.height_cm < 100 || requestBody.height_cm > 250) {
                                            setError('Please enter a valid height between 100cm and 250cm');
                                            return;
                                        }
                                        if (!requestBody.weight_kg || requestBody.weight_kg < 30 || requestBody.weight_kg > 300) {
                                            setError('Please enter a valid weight between 30kg and 300kg');
                                            return;
                                        }
                                        if (!requestBody.gender) {
                                            setError('Please select your gender');
                                            return;
                                        }
                                        if (!requestBody.activity_level) {
                                            setError('Please select your activity level');
                                            return;
                                        }
                                        if (!requestBody.fitness_goal) {
                                            setError('Please select your fitness goal');
                                            return;
                                        }
                                        if (!requestBody.spice_tolerance) {
                                            setError('Please select your spice tolerance');
                                            return;
                                        }
                                        
                                        submitAssessment(requestBody);
                                    }}
                                >
                                    {/* Personal Information Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Personal Information</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Age <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="number" 
                                                    value={requestBody.age || ''}
                                               onChange={(e) => setRequestBody({ ...requestBody, age: Number(e.target.value) })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                                                    placeholder="Enter your age"
                                                    min="1"
                                                    max="120"
                                                    required 
                                                />
                                                {requestBody.age > 0 && (requestBody.age < 1 || requestBody.age > 120) && (
                                                    <p className="text-sm text-red-500">Age must be between 1 and 120 years</p>
                                                )}
                                    </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Gender <span className="text-red-500">*</span>
                                                </label>
                                                <select 
                                                    value={requestBody.gender}
                                                onChange={(e) => setRequestBody({ ...requestBody, gender: e.target.value as any })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                >
                                                    <option value="">Select your gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                        </select>
                                    </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Height (cm) <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="number" 
                                                    value={requestBody.height_cm || ''}
                                               onChange={(e) => setRequestBody({ ...requestBody, height_cm: Number(e.target.value) })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                                                    placeholder="Enter your height in cm"
                                                    min="100" 
                                                    max="250"
                                                    required 
                                                />
                                                {requestBody.height_cm > 0 && (requestBody.height_cm < 100 || requestBody.height_cm > 250) && (
                                                    <p className="text-sm text-red-500">Height must be between 100cm and 250cm</p>
                                                )}
                                    </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Weight (kg) <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="number" 
                                                    value={requestBody.weight_kg || ''}
                                               onChange={(e) => setRequestBody({ ...requestBody, weight_kg: Number(e.target.value) })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                                                    placeholder="Enter your weight in kg"
                                                    min="30" 
                                                    max="300"
                                                    required 
                                                />
                                                {requestBody.weight_kg > 0 && (requestBody.weight_kg < 30 || requestBody.weight_kg > 300) && (
                                                    <p className="text-sm text-red-500">Weight must be between 30kg and 300kg</p>
                                                )}
                                    </div>
                                        </div>
                                    </div>

                                    {/* Lifestyle & Goals Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Lifestyle & Goals</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Activity Level <span className="text-red-500">*</span>
                                                </label>
                                                <select 
                                                    value={requestBody.activity_level}
                                                onChange={(e) => setRequestBody({ ...requestBody, activity_level: e.target.value as any })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                >
                                                    <option value="">Select your activity level</option>
                                                    <option value="sedentary">Sedentary - Little to no exercise</option>
                                                    <option value="light">Light - Light exercise 1-3 days/week</option>
                                                    <option value="moderate">Moderate - Moderate exercise 3-5 days/week</option>
                                                    <option value="active">Active - Heavy exercise 6-7 days/week</option>
                                                    <option value="very_active">Very Active - Very heavy exercise, physical job</option>
                                        </select>
                                    </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Fitness Goal <span className="text-red-500">*</span>
                                                </label>
                                                <select 
                                                    value={requestBody.fitness_goal}
                                                onChange={(e) => setRequestBody({ ...requestBody, fitness_goal: e.target.value as any })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                >
                                                    <option value="">Select your fitness goal</option>
                                                    <option value="maintenance">Maintain current fitness level</option>
                                                    <option value="weight-loss">Weight loss and fat reduction</option>
                                                    <option value="muscle-gain">Muscle building and strength</option>
                                                    <option value="endurance">Improve endurance and stamina</option>
                                                    <option value="flexibility">Increase flexibility and mobility</option>
                                        </select>
                                    </div>
                                        </div>
                                    </div>

                                    {/* Health Conditions Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Health Information</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                                <input 
                                                    id="has_diabetes" 
                                                    type="checkbox" 
                                                    checked={requestBody.has_diabetes}
                                               onChange={(e) => setRequestBody({ ...requestBody, has_diabetes: e.target.checked })}
                                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                                />
                                                <label htmlFor="has_diabetes" className="text-sm font-medium text-gray-700">
                                                    I have diabetes or pre-diabetes
                                                </label>
                                    </div>

                                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                                <input 
                                                    id="has_hypertension" 
                                                    type="checkbox" 
                                                    checked={requestBody.has_hypertension}
                                               onChange={(e) => setRequestBody({ ...requestBody, has_hypertension: e.target.checked })}
                                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                                />
                                                <label htmlFor="has_hypertension" className="text-sm font-medium text-gray-700">
                                                    I have high blood pressure or hypertension
                                                </label>
                                    </div>

                                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                                <input 
                                                    id="is_vegetarian" 
                                                    type="checkbox" 
                                                    checked={requestBody.is_vegetarian}
                                               onChange={(e) => setRequestBody({ ...requestBody, is_vegetarian: e.target.checked })}
                                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                                />
                                                <label htmlFor="is_vegetarian" className="text-sm font-medium text-gray-700">
                                                    I follow a vegetarian or plant-based diet
                                                </label>
                                    </div>
                                        </div>
                                    </div>

                                    {/* Dietary Preferences Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Dietary Preferences</h3>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Spice Tolerance <span className="text-red-500">*</span>
                                            </label>
                                            <select 
                                                value={requestBody.spice_tolerance}
                                                onChange={(e) => setRequestBody({ ...requestBody, spice_tolerance: e.target.value as any })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            >
                                                <option value="">Select your spice tolerance</option>
                                                <option value="low">Low - Mild flavors preferred</option>
                                                <option value="medium">Medium - Moderate spice level</option>
                                                <option value="high">High - Spicy foods preferred</option>
                                        </select>
                                    </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <button 
                                            type="submit" 
                                            className="w-full md:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-150"
                                        >
                                            Generate My Personalized Plan 🚀
                                        </button>
                                    </div>
                                </form>

                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    <p>{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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

                        {workoutPlan ? (
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
                                            <div>
                                                <h4 className="text-xl font-semibold text-gray-900">Day {dayIndex + 1}</h4>
                                                {dayPlan.type !== 'rest' && 'total_duration_minutes' in dayPlan && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Total Duration: {dayPlan.total_duration_minutes} minutes
                                                    </p>
                                                    )}
                                                </div>
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
                                                        🔥 Warm Up
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
                                                        💪 Main Workout
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
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
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
                                                        ❄️ Cool Down
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
                        ) : assessment && mealPlan ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏋️‍♂️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Your Workout Plan</h3>
                                <p className="text-gray-600 mb-4">Select your preferences and click "Generate Plan" to create your personalized workout routine.</p>
                                <div className="mb-6">
                                    <p className="text-sm text-gray-600">
                                        Your workout plan will be generated for{' '}
                                        <span className="font-semibold text-blue-600">
                                            {mealPlan.plan_duration_days} days
                                        </span>
                                        {' '}based on your meal plan duration.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => generateWorkoutPlanData()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    disabled={!mealPlan}
                                >
                                    Generate {mealPlan?.plan_duration_days || 3}-Day Workout Plan
                                </button>
                            </div>
                        ) : assessment ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🍽️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Meal Plan First</h3>
                                <p className="text-gray-600">Please generate your meal plan first to determine the workout plan duration.</p>
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