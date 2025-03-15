'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiPhone, FiUser, FiAward, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { initializeRegistration } from '@/lib/api';

interface SignupFormData {
  nic: string;
  mobile: string;
  email: string;
  isTrainer: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    nic: '',
    mobile: '',
    email: '',
    isTrainer: false,
  });

  const generateTrainerId = (): number => {
    // Generate a random 6-digit number
    return Math.floor(100000 + Math.random() * 900000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    const loadingToast = toast.loading('Creating your account...');
  
    try {
      const trainerId = formData.isTrainer ? generateTrainerId() : undefined;
  
      const result = await initializeRegistration({
        nic: formData.nic,
        mobile: formData.mobile,
        email: formData.email,
        role_type: formData.isTrainer ? 'ROLE_TRAINER' : 'ROLE_USER',
        ...(trainerId && { trainer_id: trainerId }),
      });
  
      if (result.success && result.data) {
        toast.success(`Registration successful! Please verify your ${result.data.mobile} mobile number.`);     
        router.push('/verify');
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during registration';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white py-12 px-8 shadow-xl rounded-2xl space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-sm text-gray-600">
                Join FitPro to start your fitness journey
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* NIC Field */}
              <div className="space-y-2">
                <label htmlFor="nic" className="block text-sm font-medium text-gray-700">
                  NIC Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nic"
                    name="nic"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={formData.nic}
                    onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                    placeholder="Enter your NIC number"
                  />
                </div>
              </div>

              {/* Mobile Field */}
              <div className="space-y-2">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+94 XX XXX XXXX"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Trainer Checkbox with better styling */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="is_trainer"
                      name="is_trainer"
                      type="checkbox"
                      checked={formData.isTrainer}
                      onChange={(e) => setFormData({ ...formData, isTrainer: e.target.checked })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                    />
                    <label htmlFor="is_trainer" className="ml-3 block text-sm font-medium text-gray-700">
                      I am a trainer
                    </label>
                  </div>
                  <FiAward className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 pl-8">
                  Select this if you're registering as a fitness trainer to provide professional services
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 rounded-xl text-sm text-red-600 flex items-center space-x-2"
                >
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Right side - Image and Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-900/90 z-10" />
        <Image
          src="/images/fitness-register.jpg"
          alt="Fitness motivation"
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
              <h1 className="text-5xl font-bold mb-6 text-white font-serif leading-tight">
                Start Your <span className="text-blue-300">Fitness Journey</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join our community of fitness enthusiasts and professional trainers.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span>Access to certified trainers</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span>Personalized workout plans</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span>Track your progress</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 