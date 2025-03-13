'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { verifyOTP } from '@/actions';

interface VerificationResult {
  success: boolean;
  message?: string;
  data?: {
    user_status: string;
    user_id: string;
    trainer_id: string | null;
  };
}

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const username = searchParams.get('username');
    if (!username) {
      toast.error('Username is required');
      setLoading(false);
      return;
    }

    const loadingToast = toast.loading('Verifying...');

    try {
      const result = await verifyOTP(username, otp) as VerificationResult;
      console.log("verify result", result);

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Verification failed');
      }

      toast.success('Account verified successfully!');

      // Navigate based on user type
      if (result.data.trainer_id !== null) {
        router.push('/trainer-profile');
      } else {
        router.push('/user-profile');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          OTP Code
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
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
            className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ${loading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </form>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the OTP sent to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div>Loading...</div>}>
            <VerifyForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 