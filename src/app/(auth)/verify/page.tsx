'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getCookie, verifyOTP } from '@/lib/api';

interface VerifyRequest {
  username: string;
  otp: string;
}
function VerifyForm() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyRequest, setVerifyRequest] = useState<VerifyRequest>({
    username: '',
    otp: '',
  });

  useEffect(() => {
    async function fetchUsername() {
      const username = await getCookie("username");
      if (!username) {
        router.push('/login');
        return;
      }
      setVerifyRequest(prev => ({ ...prev, username }));
    }
    fetchUsername();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setLoading(true);

    const loadingToast = toast.loading('Verifying...');
    try {
      const result = await verifyOTP({
        username: verifyRequest.username,
        otp: otp // Use the otp state directly
      });

      toast.dismiss(loadingToast);

      if (result.success && result.data) {
        toast.success('Verification successful!');
        if(result.data.trainer_id !== null) {
          router.push('/trainer-profile');
        } else {
          router.push('/user-profile');
        }
      } else {
        toast.error(result.message || 'Verification failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          OTP Code
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="otp"
            name="otp"
            type="text"
            required
            maxLength={6}
            pattern="\d{6}"
            className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const newOtp = e.target.value.replace(/\D/g, '');
              setOtp(newOtp);
              setVerifyRequest(prev => ({ ...prev, otp: newOtp }));
            }}
          />
        </div>
        <p className="text-sm text-gray-500">
          Enter the verification code sent to your email address
        </p>
      </div>

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
            Verifying...
          </>
        ) : (
          'Verify OTP'
        )}
      </button>
    </form>
  );
}

export default function VerifyPage() {
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
                Verify Your Account
              </h2>
              <p className="text-sm text-gray-600">
                We've sent a verification code to your email
              </p>
            </div>

            <Suspense fallback={
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <VerifyForm />
            </Suspense>
          </div>
        </motion.div>
      </div>

      {/* Right side - Image and Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-900/90 z-10" />
        <Image
          src="/images/fitness-verify.jpg"
          alt="Fitness verification"
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
                Almost <span className="text-blue-300">There!</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Just one more step to begin your fitness journey with us.
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
                <span>Secure account verification</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span>Access to personalized dashboard</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FiCheckCircle className="w-5 h-5 text-blue-300" />
                <span>Start your fitness journey</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 