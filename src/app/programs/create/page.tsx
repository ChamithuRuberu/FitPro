'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';


export default function CreateProgramPage() {
    const [requestBody, setRequestBody] = useState({
        age: 0,
        gender: 'male' as 'male' | 'female' | 'other',
        height_cm: 0,
        weight_kg: 0,
        activity_level: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
        fitness_goal: 'maintenance' as 'maintenance' | 'weight-loss' | 'muscle-gain' | 'endurance' | 'flexibility',
        has_diabetes: false,
        has_hypertension: false,
        is_vegetarian: false,
        spice_tolerance: 'medium' as 'low' | 'medium' | 'high',
    });
    const [assessment, setAssessment] = useState<any>(null);
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
                gender: (parsed.gender || 'male') as any,
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

    const submitAssessment = async (payload: any) => {
        try {
            setAssessment(null);
            setError(null);
            setLoading(true);
            setView('loading');
            setProgress(0);
            setLoadingMsg(loadingMessages[0]);

            const totalDuration = 8000; // 20s
            const interval = 1000;
            const total = totalDuration / interval;
            let tick = 0;
            let apiCompleted = false;
            let apiData: any = null;

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
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 800);
                }
            }, interval);

            // Actual API call (runs in parallel)
            try {
                const res = await fetch('http://localhost:8000/comprehensive-assessment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
                    body: JSON.stringify(payload),
                    mode: 'cors',
                });

                if (!res.ok) {
                    const err = await res.text();
                    throw new Error(err || `Request failed with status ${res.status}`);
                }

                apiData = await res.json();
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
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 800);
                }

            } catch (apiError: any) {
                clearInterval(timer);
                setError(apiError?.message || 'Failed to fetch assessment');
                setLoading(false);
                setView('form');
            }

        } catch (e: any) {
            setError(e?.message || 'Failed to fetch assessment');
            setLoading(false);
            setView('form');
        }
    };

    const emojis = requestBody.gender === 'female'
        ? ['🏋️‍♀️','💃','🏃‍♀️','🚴‍♀️','🏊‍♀️','✨','🌟']
        : ['🏋️‍♂️','💪','🏃‍♂️','🚴‍♂️','🏊‍♂️','⚡','🔥'];

    return (
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
                                {requestBody.gender === 'male' ? 'Building Your Fitness Plan' : 'Creating Your Wellness Journey'}
                            </h2>
                            <p className="text-xl text-gray-700 mb-3 font-medium">{loadingMsg}</p>
                            <p className="text-gray-600 text-lg">
                                {requestBody.gender === 'male' 
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
                    <h1 className="text-3xl font-bold text-gray-900">Create Workout Program</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Design comprehensive workout programs with detailed exercises, progressions, and schedules
                    </p>
                </div>

                {view === 'form' && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Comprehensive Assessment</h2>
                        <button
                            onClick={() => submitAssessment(requestBody)}
                            className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded"
                        >
                            Generate
                        </button>
                    </div>

                    <form
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded mb-4"
                        onSubmit={(e) => {
                            e.preventDefault();
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
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
                            <input type="number" value={requestBody.height_cm}
                                   onChange={(e) => setRequestBody({ ...requestBody, height_cm: Number(e.target.value) })}
                                   className="w-full border rounded px-3 py-2 text-sm" required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                            <input type="number" value={requestBody.weight_kg}
                                   onChange={(e) => setRequestBody({ ...requestBody, weight_kg: Number(e.target.value) })}
                                   className="w-full border rounded px-3 py-2 text-sm" required />
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
                                Submit
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
                            onClick={() => { setAssessment(null); setView('form'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded"
                        >
                            New Assessment
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">BMI</p>
                            <p className="font-semibold">{assessment.health_metrics?.bmi}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">BMI Category</p>
                            <p className="font-semibold">{assessment.health_metrics?.bmi_category}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Body Fat %</p>
                            <p className="font-semibold">{assessment.health_metrics?.body_fat_percentage}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">BMR</p>
                            <p className="font-semibold">{assessment.health_metrics?.bmr}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">TDEE</p>
                            <p className="font-semibold">{assessment.health_metrics?.tdee}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Water Intake (ml)</p>
                            <p className="font-semibold">{assessment.health_metrics?.water_intake_ml}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Nutrition Recommendations</h3>
                        <div className="space-y-3">
                            {(assessment.nutrition_recommendations || []).map((item: any, idx: number) => (
                                <div key={idx} className="p-4 bg-gray-50 rounded flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-600">{item.category} • {item.source}</p>
                                    </div>
                                    <div className="text-right text-sm text-gray-700">
                                        <div>Calories: {item.calories}</div>
                                        {item.protein !== undefined && <div>Protein: {item.protein}</div>}
                                        {item.carbs !== undefined && <div>Carbs: {item.carbs}</div>}
                                        {item.fat !== undefined && <div>Fat: {item.fat}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Exercise Recommendations</h3>
                        <div className="space-y-3">
                            {(assessment.exercise_recommendations || []).map((ex: any, idx: number) => (
                                <div key={idx} className="p-4 bg-gray-50 rounded">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900">{ex.name}</p>
                                        <span className="text-xs text-gray-600">{ex.intensity} • {ex.category}</span>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-700">
                                        <div>Duration: {ex.duration_min} min • ~{ex.calories_per_min} kcal/min</div>
                                        {ex.equipment && <div>Equipment: {ex.equipment}</div>}
                                        {ex.instructions && <div className="text-gray-600">{ex.instructions}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
} 