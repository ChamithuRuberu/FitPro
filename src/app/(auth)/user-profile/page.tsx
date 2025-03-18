'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiCalendar, FiMapPin, FiActivity, FiCheckCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { completeUserProfile, getCookie } from '@/lib/api';

interface RegisterUserFormData {
  username: string;
  profile: string;
  full_name: string;
  birth_of_date: string;
  address_no: string;
  address_street: string;
  city: string;
  password: string;
  postalCode: string;
  role_type: string;
  servicePeriod: string;
  weight: string;
  height: string;
  injuries: string;
  trainerId: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState<RegisterUserFormData>({
    username: "",
    profile: "",
    full_name: "",
    birth_of_date: "",
    address_no: "",
    address_street: "",
    city: "",
    password: "",
    postalCode: "",
    role_type: "ROLE_USER",
    servicePeriod: "",
    weight: "",
    height: "",
    injuries: "",
    trainerId: "",
  });

  useEffect(() => {
    const checkSession = async () => {
      const username = await getCookie("username");
      console.log('User profile session:', username);

      if (username) {
        setFormData(prev => ({
          ...prev,
          username,
        }));
      } else {
        toast.error('Session not found');
        router.replace('/login');
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true at the start
  
    try {
      const result = await completeUserProfile(formData);
      if (result.success) {
        router.replace('/dashboard/client-dashboard');
      } else {
        toast.error(result.message || 'Failed to create profile. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false); // Reset loading to false
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
                    Tell us about yourself to get started
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section - Scrollable */}
            <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <form id="user-profile-form" className="space-y-4" onSubmit={handleSubmit}>
                {/* Basic Info Section */}
                <div className="space-y-4">
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
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        required
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your full name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="birth_of_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="birth_of_date"
                        name="birth_of_date"
                        type="date"
                        required
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={formData.birth_of_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="address_no" className="block text-sm font-medium text-gray-700 mb-1">
                        Address No
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="address_no"
                          name="address_no"
                          type="text"
                          required
                          className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="No."
                          value={formData.address_no}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="address_street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street
                      </label>
                      <input
                        id="address_street"
                        name="address_street"
                        type="text"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Street name"
                        value={formData.address_street}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Postal code"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
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
                          required
                          min="30"
                          max="200"
                          className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Weight"
                          value={formData.weight}
                          onChange={handleInputChange}
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
                          required
                          min="100"
                          max="250"
                          className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Height"
                          value={formData.height}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="injuries" className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Conditions or Injuries
                  </label>
                  <textarea
                    id="injuries"
                    name="injuries"
                    rows={3}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="List any medical conditions or injuries we should know about..."
                    value={formData.injuries}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Trainer ID Field */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label htmlFor="trainerId" className="block text-sm font-medium text-gray-700 mb-1">
                    Trainer ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="trainerId"
                      name="trainerId"
                      type="text"
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.trainerId}
                      onChange={handleInputChange}
                      placeholder="Enter trainer ID (default: 499763)"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Leave empty to use default trainer (ID: 499763)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-0 left-0 right-0 mt-4 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''
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
          src="/images/fitness-user.jpg"
          alt="Fitness enthusiast"
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
                Start Your <span className="text-blue-300">Fitness Journey</span>
              </h1>
              <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                Complete your profile to get personalized training and achieve your fitness goals.
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
                <span className="text-sm">Get matched with expert trainers</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span className="text-sm">Access personalized workout plans</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span className="text-sm">Track your fitness progress</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 