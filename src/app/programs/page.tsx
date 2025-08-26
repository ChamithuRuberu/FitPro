'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiTarget, FiActivity, FiDroplet, FiTrendingUp } from 'react-icons/fi';
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

  const submitAssessment = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);
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
      const data = await res.json();
      setAssessment(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalized Fitness Assessment</h1>
            <p className="text-lg text-gray-600">
              Get your comprehensive health metrics, nutrition recommendations, and exercise plan
            </p>
          </div>

          {/* Assessment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Assessment Form</h2>
              <button
                onClick={() => submitAssessment(requestBody)}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              >
                Generate Assessment
              </button>
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitAssessment(requestBody);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input 
                  type="number" 
                  value={requestBody.age}
                  onChange={(e) => setRequestBody({ ...requestBody, age: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  value={requestBody.gender}
                  onChange={(e) => setRequestBody({ ...requestBody, gender: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  value={requestBody.height_cm}
                  onChange={(e) => setRequestBody({ ...requestBody, height_cm: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  value={requestBody.weight_kg}
                  onChange={(e) => setRequestBody({ ...requestBody, weight_kg: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select 
                  value={requestBody.activity_level}
                  onChange={(e) => setRequestBody({ ...requestBody, activity_level: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goal</label>
                <select 
                  value={requestBody.fitness_goal}
                  onChange={(e) => setRequestBody({ ...requestBody, fitness_goal: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  id="has_diabetes" 
                  type="checkbox" 
                  checked={requestBody.has_diabetes}
                  onChange={(e) => setRequestBody({ ...requestBody, has_diabetes: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label htmlFor="has_diabetes" className="text-sm text-gray-700">Has Diabetes</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  id="has_hypertension" 
                  type="checkbox" 
                  checked={requestBody.has_hypertension}
                  onChange={(e) => setRequestBody({ ...requestBody, has_hypertension: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label htmlFor="has_hypertension" className="text-sm text-gray-700">Has Hypertension</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  id="is_vegetarian" 
                  type="checkbox" 
                  checked={requestBody.is_vegetarian}
                  onChange={(e) => setRequestBody({ ...requestBody, is_vegetarian: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label htmlFor="is_vegetarian" className="text-sm text-gray-700">Vegetarian</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spice Tolerance</label>
                <select 
                  value={requestBody.spice_tolerance}
                  onChange={(e) => setRequestBody({ ...requestBody, spice_tolerance: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="lg:col-span-3 flex justify-end">
                <button 
                  type="submit" 
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Submit Assessment
                </button>
              </div>
            </form>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Generating your personalized assessment...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Assessment Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Assessment Results */}
          {!loading && !error && assessment && (
            <div className="space-y-8">
              {/* Health Metrics Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Health Metrics Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FiActivity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{assessment.health_metrics?.bmi}</p>
                    <p className="text-sm text-gray-600">BMI</p>
                    <p className="text-xs text-gray-500">{assessment.health_metrics?.bmi_category}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FiTrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{assessment.health_metrics?.tdee}</p>
                    <p className="text-sm text-gray-600">Daily Calories</p>
                    <p className="text-xs text-gray-500">TDEE</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FiTarget className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{assessment.health_metrics?.ideal_weight_kg}</p>
                    <p className="text-sm text-gray-600">Ideal Weight</p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 rounded-lg">
                    <FiDroplet className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{assessment.health_metrics?.water_intake_ml}</p>
                    <p className="text-sm text-gray-600">Water Intake</p>
                    <p className="text-xs text-gray-500">ml/day</p>
                  </div>
                </div>
              </motion.div>

              {/* Detailed Health Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Health Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Body Fat %</p>
                    <p className="text-lg font-semibold text-gray-900">{assessment.health_metrics?.body_fat_percentage}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">BMR</p>
                    <p className="text-lg font-semibold text-gray-900">{assessment.health_metrics?.bmr}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Health Risk Score</p>
                    <p className="text-lg font-semibold text-gray-900">{assessment.health_metrics?.health_risk_score}</p>
                  </div>
                </div>
              </motion.div>

              {/* Nutrition Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Nutrition Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(assessment.nutrition_recommendations || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {item.source}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-gray-900">{item.calories}</p>
                          <p className="text-xs text-gray-500">Calories</p>
                        </div>
                        {item.protein !== undefined && (
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{item.protein}g</p>
                            <p className="text-xs text-gray-500">Protein</p>
                          </div>
                        )}
                        {item.carbs !== undefined && (
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{item.carbs}g</p>
                            <p className="text-xs text-gray-500">Carbs</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Exercise Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Exercise Recommendations</h2>
                <div className="space-y-4">
                  {(assessment.exercise_recommendations || []).map((ex: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{ex.name}</h3>
                          <p className="text-sm text-gray-600">{ex.category} • {ex.intensity} intensity</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {ex.compatibility_score}% match
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{ex.duration_min} min</p>
                          <p className="text-xs text-gray-500">Duration</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">~{ex.calories_per_min} kcal/min</p>
                          <p className="text-xs text-gray-500">Calorie Burn</p>
                        </div>
                        {ex.equipment && (
                          <div>
                            <p className="font-medium text-gray-900">{ex.equipment}</p>
                            <p className="text-xs text-gray-500">Equipment</p>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{ex.source}</p>
                          <p className="text-xs text-gray-500">Source</p>
                        </div>
                      </div>
                      {ex.instructions && (
                        <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-500">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Cultural Recommendations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Cultural Foods</h3>
                      <div className="space-y-2">
                        {(assessment.cultural_recommendations.foods || []).map((food: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900">{food.name}</p>
                            <p className="text-sm text-gray-600">{food.category} • {food.spice_level} spice</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Cultural Exercises</h3>
                      <div className="space-y-2">
                        {(assessment.cultural_recommendations.exercises || []).map((exercise: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900">{exercise.name}</p>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    <span className="group-open:hidden">Show Raw Assessment Data</span>
                    <span className="hidden group-open:inline">Hide Raw Assessment Data</span>
                  </summary>
                  <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap text-gray-800">
                    {JSON.stringify(assessment, null, 2)}
                  </pre>
                </details>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 