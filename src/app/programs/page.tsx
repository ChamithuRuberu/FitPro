'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiTarget, FiActivity, FiDroplet, FiTrendingUp, FiHeart, FiZap, FiAward, FiUsers } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

type ProgramFormData = {
  height: string;
  weight: string;
  age: string;
  gender: string;
  fitnessGoal: string;
  activityLevel: string;
  healthConditions: string;
  dietaryRestrictions: string;
};

export default function ProgramsPage() {
  const [formData, setFormData] = useState<ProgramFormData | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [view, setView] = useState<'form' | 'loading' | 'results'>('form');

  // Assessment request form state
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

  // Loading messages for different stages
  const loadingMessages = [
    "Analyzing your health profile...",
    "Calculating personalized metrics...",
    "Generating nutrition recommendations...",
    "Creating exercise plans...",
    "Optimizing for your goals...",
    "Finalizing your assessment...",
    "Almost ready! Preparing your results..."
  ];

  // Fitness animations for different genders
  const fitnessAnimations = {
    male: [
      "🏋️‍♂️",
      "💪",
      "🏃‍♂️",
      "🚴‍♂️",
      "🏊‍♂️",
      "⚡",
      "🔥"
    ],
    female: [
      "🏋️‍♀️",
      "💃",
      "🏃‍♀️",
      "🚴‍♀️",
      "🏊‍♀️",
      "✨",
      "🌟"
    ]
  };

  useEffect(() => {
    // Retrieve form data from localStorage
    const savedFormData = typeof window !== 'undefined' ? localStorage.getItem('programFormData') : null;
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      setFormData(parsedData);

      // Prefill assessment request body
      const healthConditions = (parsedData.healthConditions || '').toLowerCase();
      const dietaryRestrictions = (parsedData.dietaryRestrictions || '').toLowerCase();
      setRequestBody({
        age: Number(parsedData.age) || 0,
        gender: (parsedData.gender || 'male') as any,
        height_cm: Number(parsedData.height) || 0,
        weight_kg: Number(parsedData.weight) || 0,
        activity_level: (parsedData.activityLevel || 'moderate') as any,
        fitness_goal: (parsedData.fitnessGoal === 'general-fitness' ? 'maintenance' : parsedData.fitnessGoal) as any,
        has_diabetes: /diabet/.test(healthConditions),
        has_hypertension: /hypertension|high blood pressure|bp/.test(healthConditions),
        is_vegetarian: /vegetarian|vegan/.test(dietaryRestrictions),
        spice_tolerance: ((dietaryRestrictions.match(/low|medium|high/)?.[0]) || 'medium') as any,
      });
    }
  }, []);

  useEffect(() => {
    // Lock/unlock body scroll depending on view
    if (view === 'loading') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [view]);

  const submitAssessment = async (payload: any) => {
    try {
      setAssessment(null);
      setError(null);
      setLoading(true);
      setView('loading');
      setLoadingProgress(0);
      setLoadingMessage(loadingMessages[0]);

      // Simulate 20-second loading with progress updates
      const totalDuration = 8000; // 20 seconds in milliseconds
      const updateInterval = 1000; // Update every 1 second
      const totalUpdates = totalDuration / updateInterval;
      let currentUpdate = 0;
      let apiCompleted = false;
      let apiData: any = null;

      const progressInterval = setInterval(() => {
        currentUpdate++;
        const progress = Math.min((currentUpdate / totalUpdates) * 100, 99);
        setLoadingProgress(progress);
        
        const messageIndex = Math.floor((currentUpdate / totalUpdates) * loadingMessages.length);
        if (messageIndex < loadingMessages.length) {
          setLoadingMessage(loadingMessages[messageIndex]);
        }

        // If we've reached the end and API is complete, finish loading
        if (currentUpdate >= totalUpdates && apiCompleted) {
          clearInterval(progressInterval);
          setLoadingProgress(100);
          setLoadingMessage("Assessment complete! 🎉");
          
          setTimeout(() => {
            setAssessment(apiData);
            setLoading(false);
            setView('results');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 1000);
        }
      }, updateInterval);

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
        if (currentUpdate >= totalUpdates) {
          clearInterval(progressInterval);
          setLoadingProgress(100);
          setLoadingMessage("Assessment complete! 🎉");
          
          setTimeout(() => {
            setAssessment(apiData);
            setLoading(false);
            setView('results');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 1000);
        }

      } catch (apiError: any) {
        clearInterval(progressInterval);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Loading Screen - Full Screen Overlay */}
      {view === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 z-50 flex items-center justify-center overflow-hidden"
        >
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
                {fitnessAnimations[requestBody.gender as keyof typeof fitnessAnimations]?.[
                  Math.floor((loadingProgress / 100) * fitnessAnimations[requestBody.gender as keyof typeof fitnessAnimations].length)
                ] || fitnessAnimations[requestBody.gender as keyof typeof fitnessAnimations][0]}
              </div>
              <div className="text-5xl mb-6 animate-pulse" style={{ animationDuration: '2s' }}>
                {requestBody.gender === 'male' ? '💪' : '✨'}
              </div>
            </div>

            {/* Enhanced progress bar with white theme */}
            <div className="mb-10">
              <div className="w-full bg-gray-200/50 rounded-full h-3 mb-4 backdrop-blur-sm border border-gray-300/30">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-gray-700 text-sm font-semibold">{Math.round(loadingProgress)}% Complete</p>
            </div>

            {/* Enhanced loading message with white theme */}
            <motion.div
              key={loadingMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {requestBody.gender === 'male' ? 'Building Your Fitness Plan' : 'Creating Your Wellness Journey'}
              </h2>
              <p className="text-xl text-gray-700 mb-3 font-medium">{loadingMessage}</p>
              <p className="text-gray-600 text-lg">
                {requestBody.gender === 'male' 
                  ? "We're crafting the perfect workout and nutrition plan for your goals!" 
                  : "We're designing a personalized wellness program just for you!"
                }
              </p>
            </motion.div>

            {/* Fitness stats preview with white theme */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-gray-800 font-bold mb-3 text-lg">Personalized Goals</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {requestBody.gender === 'male' 
                    ? "Strength training and muscle building focus" 
                    : "Balanced fitness and wellness approach"
                  }
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">🥗</div>
                <h3 className="text-gray-800 font-bold mb-3 text-lg">Smart Nutrition</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {requestBody.gender === 'male' 
                    ? "High-protein meal plans for muscle growth" 
                    : "Nutritious and delicious meal suggestions"
                  }
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-gray-800 font-bold mb-3 text-lg">Health Metrics</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {requestBody.gender === 'male' 
                    ? "Body composition and strength tracking" 
                    : "Wellness metrics and progress monitoring"
                  }
                </p>
              </div>
            </div>

            {/* Estimated time with enhanced styling */}
            <div className="text-gray-600 text-sm bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-md">
              <p className="font-semibold text-gray-700">Estimated time remaining: {Math.max(0, Math.ceil((100 - loadingProgress) / 100 * 15))} seconds</p>
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
        </motion.div>
      )}
      
      {view === 'form' && (
      <main className="relative container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
              <FiZap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Assessment</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-6">
              Your Personal Fitness
              <br />
              <span className="text-blue-600">Companion</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get your comprehensive health metrics, personalized nutrition recommendations, 
              and tailored exercise plan powered by advanced AI analysis
            </p>
          </motion.div>

          {/* Assessment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Form</h2>
                <p className="text-gray-600">Fill in your details to get personalized recommendations</p>
              </div>
              <button
                onClick={() => submitAssessment(requestBody)}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Generate Assessment
              </button>
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                submitAssessment(requestBody);
              }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Age</label>
                <input 
                  type="number" 
                  value={requestBody.age}
                  onChange={(e) => setRequestBody({ ...requestBody, age: Number(e.target.value) })}
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Gender</label>
                <select 
                  value={requestBody.gender}
                  onChange={(e) => setRequestBody({ ...requestBody, gender: e.target.value as any })}
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Height (cm)</label>
                <input 
                  type="number" 
                  value={requestBody.height_cm}
                  onChange={(e) => setRequestBody({ ...requestBody, height_cm: Number(e.target.value) })}
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Weight (kg)</label>
                <input 
                  type="number" 
                  value={requestBody.weight_kg}
                  onChange={(e) => setRequestBody({ ...requestBody, weight_kg: Number(e.target.value) })}
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Activity Level</label>
                <select 
                  value={requestBody.activity_level}
                  onChange={(e) => setRequestBody({ ...requestBody, activity_level: e.target.value as any })}
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Fitness Goal</label>
                <select 
                  value={requestBody.fitness_goal}
                  onChange={(e) => setRequestBody({ ...requestBody, fitness_goal: e.target.value as any })}
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Spice Tolerance</label>
                <select 
                  value={requestBody.spice_tolerance}
                  onChange={(e) => setRequestBody({ ...requestBody, spice_tolerance: e.target.value as any })}
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              {/* Health Conditions */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Health Conditions</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-gray-200/50 cursor-pointer hover:bg-white/50 transition-all duration-200">
                    <input 
                      id="has_diabetes" 
                      type="checkbox" 
                      checked={requestBody.has_diabetes}
                      onChange={(e) => setRequestBody({ ...requestBody, has_diabetes: e.target.checked })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                    />
                    <span className="text-sm font-medium text-gray-700">Has Diabetes</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-gray-200/50 cursor-pointer hover:bg-white/50 transition-all duration-200">
                    <input 
                      id="has_hypertension" 
                      type="checkbox" 
                      checked={requestBody.has_hypertension}
                      onChange={(e) => setRequestBody({ ...requestBody, has_hypertension: e.target.checked })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                    />
                    <span className="text-sm font-medium text-gray-700">Has Hypertension</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-gray-200/50 cursor-pointer hover:bg-white/50 transition-all duration-200">
                    <input 
                      id="is_vegetarian" 
                      type="checkbox" 
                      checked={requestBody.is_vegetarian}
                      onChange={(e) => setRequestBody({ ...requestBody, is_vegetarian: e.target.checked })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                    />
                    <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                  </label>
                </div>
              </div>
              
              <div className="lg:col-span-3 flex justify-end">
                <button 
                  type="submit" 
                  className="px-8 py-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Submit Assessment
                </button>
              </div>
            </form>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800">Assessment Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      )}

      {view === 'results' && (
      <main className="relative container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Assessment</h2>
              <p className="text-gray-600">Personalized results based on your inputs</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setAssessment(null); setView('form'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl"
              >
                New Assessment
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
              >
                Download PDF
              </button>
            </div>
          </div>

          {!error && assessment && (
            <div className="space-y-12">
              {/* Health Metrics Overview */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FiActivity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Health Metrics Overview</h2>
                    <p className="text-gray-600">Your personalized health insights</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200/50">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FiActivity className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{assessment.health_metrics?.bmi}</p>
                    <p className="text-sm font-semibold text-gray-700 mb-1">BMI</p>
                    <p className="text-xs text-blue-600 font-medium">{assessment.health_metrics?.bmi_category}</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FiTrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{assessment.health_metrics?.tdee}</p>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Daily Calories</p>
                    <p className="text-xs text-green-600 font-medium">TDEE</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FiTarget className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{assessment.health_metrics?.ideal_weight_kg}</p>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Ideal Weight</p>
                    <p className="text-xs text-purple-600 font-medium">kg</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200/50">
                    <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FiDroplet className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{assessment.health_metrics?.water_intake_ml}</p>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Water Intake</p>
                    <p className="text-xs text-cyan-600 font-medium">ml/day</p>
                  </div>
                </div>
              </motion.div>

              {/* Detailed Health Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FiHeart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Detailed Health Metrics</h2>
                    <p className="text-gray-600">Comprehensive health analysis</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Body Fat %</p>
                    <p className="text-2xl font-bold text-gray-900">{assessment.health_metrics?.body_fat_percentage}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">BMR</p>
                    <p className="text-2xl font-bold text-gray-900">{assessment.health_metrics?.bmr}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Health Risk Score</p>
                    <p className="text-2xl font-bold text-gray-900">{assessment.health_metrics?.health_risk_score}</p>
                  </div>
                </div>
              </motion.div>

              {/* Nutrition Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <FiAward className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Nutrition Recommendations</h2>
                    <p className="text-gray-600">Personalized food suggestions</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(assessment.nutrition_recommendations || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200/50 hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                        <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-medium">
                          {item.source}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{item.category}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">{item.calories}</p>
                          <p className="text-xs text-gray-500 font-medium">Calories</p>
                        </div>
                        {item.protein !== undefined && (
                          <div className="text-center">
                            <p className="text-xl font-bold text-gray-900">{item.protein}g</p>
                            <p className="text-xs text-gray-500 font-medium">Protein</p>
                          </div>
                        )}
                        {item.carbs !== undefined && (
                          <div className="text-center">
                            <p className="text-xl font-bold text-gray-900">{item.carbs}g</p>
                            <p className="text-xs text-gray-500 font-medium">Carbs</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Exercise Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <FiZap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Exercise Recommendations</h2>
                    <p className="text-gray-600">Tailored workout suggestions</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {(assessment.exercise_recommendations || []).map((ex: any, idx: number) => (
                    <div key={idx} className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{ex.name}</h3>
                          <p className="text-sm text-gray-600">{ex.category} • {ex.intensity} intensity</p>
                        </div>
                        <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-medium">
                          {ex.compatibility_score}% match
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{ex.duration_min} min</p>
                          <p className="text-xs text-gray-500 font-medium">Duration</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">~{ex.calories_per_min} kcal/min</p>
                          <p className="text-xs text-gray-500 font-medium">Calorie Burn</p>
                        </div>
                        {ex.equipment && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{ex.equipment}</p>
                            <p className="text-xs text-gray-500 font-medium">Equipment</p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{ex.source}</p>
                          <p className="text-xs text-gray-500 font-medium">Source</p>
                        </div>
                      </div>
                      {ex.instructions && (
                        <div className="p-4 bg-white/50 rounded-xl border-l-4 border-green-500">
                          <p className="text-sm text-gray-700">{ex.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Cultural Recommendations */}
              {assessment.cultural_recommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <FiUsers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Cultural Recommendations</h2>
                      <p className="text-gray-600">Local and traditional suggestions</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Cultural Foods</h3>
                      <div className="space-y-3">
                        {(assessment.cultural_recommendations.foods || []).map((food: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                            <p className="font-semibold text-gray-900">{food.name}</p>
                            <p className="text-sm text-gray-600">{food.category} • {food.spice_level} spice</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Cultural Exercises</h3>
                      <div className="space-y-3">
                        {(assessment.cultural_recommendations.exercises || []).map((exercise: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                            <p className="font-semibold text-gray-900">{exercise.name}</p>
                            <p className="text-sm text-gray-600">{exercise.category} • {exercise.intensity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Raw Data Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
              >
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2">
                    <span className="group-open:hidden">Show Raw Assessment Data</span>
                    <span className="hidden group-open:inline">Hide Raw Assessment Data</span>
                    <svg className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <pre className="mt-6 text-xs bg-gray-50/50 backdrop-blur-sm p-6 rounded-2xl overflow-auto whitespace-pre-wrap text-gray-800 border border-gray-200/50">
                    {JSON.stringify(assessment, null, 2)}
                  </pre>
                </details>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      )}
    </div>
  );
} 