'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiActivity, FiDollarSign, FiStar, FiMapPin, FiPlus,
  FiCalendar, FiToggleLeft, FiToggleRight, FiClock, FiAlertCircle,
  FiMail, FiPhone, FiLock, FiImage, FiSearch, FiFilter, FiDownload,
  FiTrendingUp, FiBarChart2, FiPieChart, FiSettings, FiRefreshCw,
  FiLogOut, FiUser, FiChevronDown, FiBell
} from 'react-icons/fi';
import type { GymData, TrainerData, ClientData, DashboardStats } from '@/types/dashboard';
import { useRouter } from 'next/navigation';
import { registerGym, adminCreateTrainer, adminCreateUser, getTrainerList, getGymList, getAdminUsers, getTotalRevenue } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import ActivitySection from '@/components/dashboard/shared/ActivitySection';


// Sample data
const stats: DashboardStats = {
  totalRevenue: 0,
  activeMembers: 1200,
  totalTrainers: 45,
  totalGyms: 8,
  activePrograms: 24,
  averageRating: 4.8,
  pendingPayments: 15,
  newRegistrations: 28
};

const latestGyms: GymData[] = [

];

const latestTrainers: TrainerData[] = [

];

const latestClients: ClientData[] = [

];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'payments'>('overview');
  const [registerType, setRegisterType] = useState<'gym' | 'trainer' | 'client'>('gym');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'revenue'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  

  interface GymForm {
    gymName: string;
    location: string;
    email: string;
    phone: string;
    desc: string;
    monthlyFee: string;
    membership: string;
    password: string;
    roleType: string;
  }

  // Form states
  const [gymForm, setGymForm] = useState<GymForm>({
    gymName: '',
    location: '',
    email: '',
    phone: '',
    desc: '',
    monthlyFee: '',
    membership: '',
    password: '',
    roleType: 'ROLE_GYM',
  });

  const [trainerForm, setTrainerForm] = useState({
    name: '',
    email: '',
    phone: '',
    specializations: '',
    experience: '',
    certifications: '',
    gym: '',
    monthlyFee: '',
    image: null as File | null
  });

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    trainer: '',
    program: '',
    nic: '',
    password: '',
    city: '',
    height: '',
    weight: '',
    injuries: '',
    gymId: '',
    image: null as File | null
  });

  // Trainer options for Assigned Trainer dropdown (loaded from API)
  const [trainerOptions, setTrainerOptions] = useState<Array<{ id: number; name: string; govId?: number }>>([]);
  const [gymOptions, setGymOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [userOptions, setUserOptions] = useState<Array<{ id: number; name: string; email?: string }>>([]);

  useEffect(() => {
    (async () => {
      const res = await getTotalRevenue();
      if ((res as any)?.success) {
        setTotalRevenue((res as any).data.total);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTrainerList();
        console.log('getTrainerList result:', res);
        if (res && (res as any).success) {
          const rawList = ((res as any).data as any[]) || [];
          console.log('raw trainer list:', rawList);
          const mapped = rawList
            .map((t: any) => ({
              id: Number(t.gov_id ?? t.trainerId ?? t.id ?? t.govId ?? 0),
              govId: Number(t.gov_id ?? t.trainerId ?? t.id ?? t.govId ?? 0),
              name: String(t.full_name ?? t.name ?? t.trainerName ?? t.fullName ?? 'Trainer')
            }))
            .filter((t: any) => !!t.id);
          console.log('mapped trainer options:', mapped);
          setTrainerOptions(mapped);
        } else {
          const message = (res as any)?.message || 'Failed to load trainers';
          toast.error(message);
        }
      } catch (e) {
        toast.error('Failed to load trainers');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getGymList();
        console.log('getGymList result:', res);
        if ((res as any)?.success) {
          const raw = ((res as any).data as any[]) || [];
          const mapped = raw
            .map((g: any) => ({
              id: Number(g.id ?? g.gymId ?? g.gym_id ?? 0),
              name: String(g.name ?? g.gymName ?? g.gym_name ?? 'Gym')
            }))
            .filter((g: any) => !!g.id);
          setGymOptions(mapped);
          console.log('mapped gym options:', mapped);
        } else {
          toast.error((res as any)?.message || 'Failed to load gyms');
        }
      } catch (e) {
        toast.error('Failed to load gyms');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminUsers();
        console.log('getAdminUsers result:', res);
        if ((res as any)?.success) {
          const raw = ((res as any).data as any[]) || [];
          const mapped = raw.map((u: any) => ({
            id: Number(u.id ?? u.userId ?? 0),
            name: String(u.full_name ?? u.fullName ?? u.name ?? u.email ?? 'User'),
            email: String(u.email ?? '')
          })).filter((u: any) => !!u.id);
          setUserOptions(mapped);
        } else {
          toast.error((res as any)?.message || 'Failed to load users');
        }
      } catch (e) {
        toast.error('Failed to load users');
      }
    })();
  }, []);

  const toggleStatus = async (type: string, id: string, currentStatus: string) => {
    try {
      setLoading(true);
      // TODO: Implement API call to toggle status
      console.log(`Toggling ${type} ${id} from ${currentStatus}`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update UI optimistically
      // TODO: Add proper error handling and rollback
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Submitting gym form:", gymForm);
      setLoading(true);
      const result = await registerGym({
        gymName: gymForm.gymName,
        location: gymForm.location,
        email: gymForm.email,
        phone: gymForm.phone,
        desc: gymForm.desc,
        monthlyFee: gymForm.monthlyFee,
        membership: gymForm.membership,
        password: gymForm.password,
        roleType: "ROLE_GYM",

      })

      if (result.success) {
        toast.success(result.message || "Gym registered successfully");
        setGymForm({
          gymName: '',
          location: '',
          email: '',
          phone: '',
          desc: '',
          monthlyFee: '',
          membership: '',
          password: '',
          roleType: 'ROLE_GYM',
        });
      } else {
        toast.error(result.message || "Gym registration failed");
      }
    } catch (error) {
      console.error('Error registering gym:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        email: trainerForm.email,
        mobile: trainerForm.phone,
        nic: '',
        fullName: trainerForm.name,
        password: '',
        city: '',
        height: '',
        weight: '',
        profile: trainerForm.specializations,
        servicePeriod: '',
        trainerGovId: 0,
        gymId: Number(trainerForm.gym) || 0,
      } as const;

      const result = await adminCreateTrainer(payload);
      if (result.success) {
        toast.success(result.message || 'Trainer created successfully');
        setTrainerForm({
          name: '',
          email: '',
          phone: '',
          specializations: '',
          experience: '',
          certifications: '',
          gym: '',
          monthlyFee: '',
          image: null
        });
      } else {
        toast.error(result.message || 'Trainer creation failed');
      }
    } catch (error) {
      console.error('Error registering trainer:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        email: clientForm.email,
        mobile: clientForm.phone,
        nic: clientForm.nic,
        fullName: clientForm.name,
        password: clientForm.password,
        city: clientForm.city,
        height: clientForm.height,
        weight: clientForm.weight,
        injuries: clientForm.injuries,
        trainerGovId: Number(clientForm.trainer) || 0,
        gymId: Number(clientForm.gymId) || 0,
      } as const;

      const result = await adminCreateUser(payload);
      if (result.success) {
        toast.success(result.message || 'User created successfully');
        setClientForm({
          name: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          trainer: '',
          program: '',
          nic: '',
          password: '',
          city: '',
          height: '',
          weight: '',
          injuries: '',
          gymId: '',
          image: null
        });
      } else {
        toast.error(result.message || 'User creation failed');
      }
    } catch (error) {
      console.error('Error registering client:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File, type: 'gym' | 'trainer' | 'client') => {
    if (file) {
      switch (type) {
        case 'gym':
          setGymForm(prev => ({ ...prev, image: file }));
          break;
        case 'trainer':
          setTrainerForm(prev => ({ ...prev, image: file }));
          break;
        case 'client':
          setClientForm(prev => ({ ...prev, image: file }));
          break;
      }
    }
  };

  const renderRegistrationForm = () => {
    switch (registerType) {
      case 'gym':
        return (
          <form onSubmit={handleGymSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gym Name</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={gymForm.gymName}
                    onChange={(e) => setGymForm(prev => ({ ...prev, gymName: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={gymForm.location}
                    onChange={(e) => setGymForm(prev => ({ ...prev, location: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    value={gymForm.email}
                    onChange={(e) => setGymForm(prev => ({ ...prev, email: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 relative">
                  <input
                    type="tel"
                    value={gymForm.phone}
                    onChange={(e) => setGymForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Package Type</label>
                <div className="mt-1 relative">
                  <select
                    value={gymForm.monthlyFee} // Bind the selected value to the state
                    onChange={(e) => setGymForm(prev => ({ ...prev, monthlyFee: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Package Type</option>
                    <option value="basic">Basic - 6/month</option>
                    <option value="standard">Standard - 12/month</option>
                    <option value="premium">Premium - 36/month</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fee</label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    value={gymForm.membership}
                    onChange={(e) => setGymForm(prev => ({ ...prev, membership: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">password</label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    value={gymForm.password}
                    onChange={(e) => setGymForm(prev => ({ ...prev, password: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? 'Registering...' : 'Register Gym'}
              </button>
            </div>
          </form>
        );

      case 'trainer':
        return (
          <form onSubmit={handleTrainerSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={trainerForm.name}
                    onChange={(e) => setTrainerForm(prev => ({ ...prev, name: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={trainerForm.email}
                    onChange={(e) => setTrainerForm(prev => ({ ...prev, email: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1">
                  <input
                    type="tel"
                    value={trainerForm.phone}
                    onChange={(e) => setTrainerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specializations</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={trainerForm.specializations}
                    onChange={(e) => setTrainerForm(prev => ({ ...prev, specializations: e.target.value }))}
                    placeholder="e.g., Weight Loss, Strength Training"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    value={trainerForm.experience}
                    onChange={(e) => setTrainerForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Certifications</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={trainerForm.certifications}
                    onChange={(e) => setTrainerForm(prev => ({ ...prev, certifications: e.target.value }))}
                    placeholder="e.g., ACE, NASM"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Gym</label>
                <div className="mt-1">
                  <select
                    value={trainerForm.gym}
                    onChange={(e) => setTrainerForm(prev => ({ ...prev, gym: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gym</option>
                    {gymOptions.map(gym => (
                      <option key={gym.id} value={String(gym.id)}>{gym.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Fee</label>
                <div className="mt-1">
                  <input
                    type="number"
                    value={trainerForm.monthlyFee}
                    onChange={(e) => setTrainerForm(prev => ({ ...prev, monthlyFee: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

    
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? 'Registering...' : 'Register Trainer'}
              </button>
            </div>
          </form>
        );

      case 'client':
        return (
          <form onSubmit={handleClientSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={clientForm.name}
                    onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1">
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="mt-1">
                  <input
                    type="date"
                    value={clientForm.dateOfBirth}
                    onChange={(e) => setClientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Trainer</label>
                <div className="mt-1">
                  <select
                    value={clientForm.trainer}
                    onChange={(e) => setClientForm(prev => ({ ...prev, trainer: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Trainer</option>
                    {trainerOptions.map((t) => (
                      <option key={t.id} value={String(t.govId ?? t.id)}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Program</label>
                <div className="mt-1">
                  <select
                    value={clientForm.program}
                    onChange={(e) => setClientForm(prev => ({ ...prev, program: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Program</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="strength">Strength Training</option>
                    <option value="cardio">Cardio Fitness</option>
                    <option value="flexibility">Flexibility & Yoga</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">NIC</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={clientForm.nic}
                    onChange={(e) => setClientForm(prev => ({ ...prev, nic: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    value={clientForm.password}
                    onChange={(e) => setClientForm(prev => ({ ...prev, password: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={(e) => setClientForm(prev => ({ ...prev, city: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Height (e.g., 165cm)</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={clientForm.height}
                    onChange={(e) => setClientForm(prev => ({ ...prev, height: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (e.g., 60kg)</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={clientForm.weight}
                    onChange={(e) => setClientForm(prev => ({ ...prev, weight: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Injuries</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={clientForm.injuries}
                    onChange={(e) => setClientForm(prev => ({ ...prev, injuries: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Gym</label>
                <div className="mt-1">
                  <select
                    value={clientForm.gymId}
                    onChange={(e) => setClientForm(prev => ({ ...prev, gymId: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gym</option>
                    {gymOptions.map(gym => (
                      <option key={gym.id} value={String(gym.id)}>{gym.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? 'Registering...' : 'Register Client'}
              </button>
            </div>
          </form>
        );
    }
  };

  const filteredGyms = latestGyms.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : gym.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTrainers = latestTrainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.gym.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : trainer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleLogout = async () => {
    try {
      // TODO: Implement logout API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  FitPro
                </span>
              </div>
              <div className="hidden md:block ml-6">
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Admin Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">


              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <FiBell className="w-6 h-6" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  3
                </span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">SA</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">Super Admin</p>
                    <p className="text-xs text-gray-500">admin@fitpro.com</p>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showProfileMenu ? 'transform rotate-180' : ''
                    }`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiUser className="w-4 h-4 mr-3" />
                      Your Profile
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiSettings className="w-4 h-4 mr-3" />
                      Settings
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: FiPieChart },
                { id: 'register', label: 'Register', icon: FiPlus },
                { id: 'payments', label: 'Payments', icon: FiDollarSign }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Sub Header - Actions and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiFilter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <FiDownload className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegisterType('gym');
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add New
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="revenue">Revenue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setSortBy('date');
                    setDateRange({ start: '', end: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                    <p className="mt-1 text-sm text-green-600 flex items-center">
                      <FiTrendingUp className="w-4 h-4 mr-1" />
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <FiDollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeMembers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <FiUsers className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayments}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <FiAlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Registrations</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.newRegistrations}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <FiPlus className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="space-y-4">
                {[...latestGyms, ...latestTrainers, ...latestClients]
                  .sort((a, b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime())
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {'location' in item ? (
                            <FiMapPin className="w-5 h-5 text-blue-600" />
                          ) : 'specializations' in item ? (
                            <FiActivity className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FiUsers className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {'location' in item ? `New gym registered in ${item.location}` :
                            'specializations' in item ? `New trainer joined ${item.gym}` :
                              `New client assigned to ${item.trainer}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.registeredDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${'status' in item
                          ? item.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}>
                          {'status' in item ? item.status : 'subscriptionStatus' in item ? item.subscriptionStatus : 'New'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                  <select className="text-sm border-gray-300 rounded-lg focus:ring-blue-500">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                {/* Add Chart Component Here */}
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Revenue Chart Placeholder</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Member Distribution</h3>
                  <button className="text-blue-600 hover:text-blue-700">
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {/* Add Chart Component Here */}
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Distribution Chart Placeholder</p>
                </div>
              </div>
            </div>

            {/* Gyms & Trainers (Overview) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gyms */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Gyms</h3>
                  <span className="text-sm text-gray-500">{gymOptions.length} total</span>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {gymOptions.slice(0, 6).map((g) => (
                    <div key={g.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                          <FiMapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{g.name}</p>
                          <p className="text-xs text-gray-500">ID: {g.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {gymOptions.length === 0 && (
                    <div className="col-span-full text-sm text-gray-500">No gyms found.</div>
                  )}
                </div>
              </div>

              {/* Trainers */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Trainers</h3>
                  <span className="text-sm text-gray-500">{trainerOptions.length} total</span>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {trainerOptions.slice(0, 6).map((t) => (
                    <div key={t.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-md bg-green-50 text-green-600">
                          <FiActivity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">GovID: {String(t.govId ?? t.id)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {trainerOptions.length === 0 && (
                    <div className="col-span-full text-sm text-gray-500">No trainers found.</div>
                  )}
                </div>
              </div>

              {/* Users */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                  <span className="text-sm text-gray-500">{userOptions.length} total</span>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {userOptions.slice(0, 6).map((u) => (
                    <div key={u.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-md bg-purple-50 text-purple-600">
                          <FiUsers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {userOptions.length === 0 && (
                    <div className="col-span-full text-sm text-gray-500">No users found.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <ActivitySection 
              title="System Activity" 
              adminType="super-admin"
              maxItems={7}
            />
          </div>
        )}

        {activeTab === 'register' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-4">
                {['gym', 'trainer', 'client'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setRegisterType(type as any)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${registerType === type
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {type === 'gym' && <FiMapPin className="w-4 h-4 mr-2" />}
                    {type === 'trainer' && <FiActivity className="w-4 h-4 mr-2" />}
                    {type === 'client' && <FiUsers className="w-4 h-4 mr-2" />}
                    Register {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              {renderRegistrationForm()}
            </div>
          </div>
        )}

        {/* Rest of the tabs with similar enhancements */}
        {/* ... existing tabs code with enhanced styling ... */}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2024 FitPro Admin Portal. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <FiSettings className="w-5 h-5" />
              </button>
              <button className="text-gray-600 hover:text-gray-900">Help</button>
              <button className="text-gray-600 hover:text-gray-900">Privacy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 