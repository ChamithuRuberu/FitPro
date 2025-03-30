import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/api';
import toast from 'react-hot-toast';

interface TrainerData {
  fullName: string;
  city: string;
  status: string;
  trainerId: string;
  email: string;
}

export function useAuthCheck() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trainerData, setTrainerData] = useState<TrainerData>({
    fullName: '',
    city: '',
    status: '',
    trainerId: '',
    email: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Get the token from client cookie
        const token = getCookie('token');
        console.log("Auth check - Token exists:", !!token);
        
        if (!token) {
          console.log("No authentication token found");
          toast.error('Authentication required');
          router.push('/login');
          return;
        }
        
        // Fetch trainer data from cookies
        const fullName = await getCookie('fullName');
        const city = await getCookie('city');
        const status = await getCookie('status');
        const trainerId = await getCookie('trainerId');
        const email = await getCookie('email');
        
        // Update trainer data with values from cookies
        setTrainerData({
          fullName: fullName || '',
          city: city || '',
          status: status || '',
          trainerId: trainerId || '',
          email: email || ''
        });
        
        console.log("Authentication successful");
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Failed to load dashboard data');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { loading, trainerData };
} 