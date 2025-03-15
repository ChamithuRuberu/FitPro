'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiUser, FiMapPin, FiLock, FiClock, FiActivity, FiAlertCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { completeTrainerProfile, getSession } from '@/actions';
import type { TrainerProfileData } from '@/actions';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiCheckCircle } from 'react-icons/fi';

export default function TrainerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<TrainerProfileData>({
    username: '',
    name: '',
    city: '',
    password: '',
    role_type: 'ROLE_TRAINER',
    servicePeriod: '',
    weight: '',
    height: '',
    profile: '',
    trainerId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const username = searchParams.get('username');
      if (!username) {
        toast.error('Invalid access');
        router.push('/login');
        return;
      }

      setFormData(prev => ({
        ...prev,
        username,
        role_type: 'ROLE_TRAINER'
      }));
    };

    checkSession();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const loadingToast = toast.loading('Completing your profile...');

    try {
        // Validate name format
        const nameRegex = /^(?![ .]+$)[a-zA-Z .]*$/;
        if (!nameRegex.test(formData.name)) {
            throw new Error('Please enter a valid name');
        }

        console.log('formData trainer profile start ->');

        // Validate password
        if (!formData.password) {
            throw new Error('Password should not be empty');
        }

        // Make the API request
        const response = await completeTrainerProfile(formData);

        // If response is a fetch response, parse JSON
        const result = response instanceof Response ? await response.json() : response;

        if (result.code !== "0000") {
            router.push('/login');
        }
        console.log('Profile completion result:', result);
        router.push('/dashboard/trainer-admin');

    } catch (err) {
        console.error('Profile completion error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
        toast.dismiss(loadingToast);
        setLoading(false);
    }
    console.log('formData trainer profile end ->', formData);

};

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-4 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white shadow-xl rounded-2xl">
            {/* Header Section - Fixed */}
            <div className="px-6 py-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-20 animate-pulse"></div>
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center transform rotate-6">
                    <FiUser className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    Complete Your Profile
                  </h2>
                  <p className="text-sm text-gray-500">
                    Share your expertise as a trainer
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section - Scrollable */}
            <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <form id="trainer-profile-form" className="space-y-4" onSubmit={handleSubmit}>
                {/* Basic Info Section */}
                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        pattern="^(?![ .]+$)[a-zA-Z .]*$"
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* City Field */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Your city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Experience and Measurements Section */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* Service Period Field */}
                  <div>
                    <label htmlFor="servicePeriod" className="block text-sm font-medium text-gray-700 mb-1">
                      Training Experience
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiClock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="servicePeriod"
                        name="servicePeriod"
                        type="number"
                        min="0"
                        step="0.5"
                        required
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Years of experience"
                        value={formData.servicePeriod}
                        onChange={(e) => setFormData({ ...formData, servicePeriod: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Weight and Height Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiActivity className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="weight"
                          name="weight"
                          type="number"
                          min="30"
                          max="200"
                          required
                          className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Weight"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiActivity className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="height"
                          name="height"
                          type="number"
                          min="100"
                          max="250"
                          required
                          className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Height"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Field */}
                <div>
                  <label htmlFor="profile" className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Profile
                  </label>
                  <textarea
                    id="profile"
                    name="profile"
                    rows={3}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Share your expertise, specializations, and certifications..."
                    value={formData.profile}
                    onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 rounded-lg text-sm text-red-600 flex items-center space-x-2"
                  >
                    <FiAlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit Button - Moved inside form */}
                <div className="sticky bottom-0 left-0 right-0 mt-4 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Profile...
                      </>
                    ) : (
                      'Complete Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Image and Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-900/90 z-10" />
        <Image
          src="/images/fitness-trainer.jpg"
          alt="Fitness trainer"
          fill
          className="object-cover object-center transform scale-105 animate-subtle-zoom"
          priority
        />
        <div className="relative z-20 flex flex-col justify-center items-start p-16">
          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold mb-4 text-white font-serif leading-tight">
                Share Your <span className="text-blue-300">Expertise</span>
              </h1>
              <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                Help others achieve their fitness goals by becoming a certified trainer.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span className="text-sm">Connect with motivated clients</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span className="text-sm">Showcase your expertise</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span className="text-sm">Grow your training business</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 