export type UserRole = 'super_admin' | 'gym_admin' | 'trainer' | 'client';

export interface GymData {
  id: string;
  name: string;
  location: string;
  memberCount: number;
  trainerCount: number;
  rating: number;
  revenue: number;
  status: 'active' | 'inactive';
  nextPaymentDate: string;
  registeredDate: string;
}

export interface TrainerData {
  id: string;
  name: string;
  gym: string;
  clientCount: number;
  rating: number;
  specializations: string[];
  activePrograms: number;
  revenue: number;
  status: 'active' | 'inactive';
  nextPaymentDate: string;
  registeredDate: string;
}

export interface ClientData {
  id: string;
  name: string;
  program: string;
  trainer: string;
  progress: number;
  attendance: number;
  nextSession: string;
  subscriptionStatus: 'active' | 'expired' | 'pending';
  nextPaymentDate: string;
  registeredDate: string;
}

export interface DashboardStats {
  totalRevenue: number;
  activeMembers: number;
  totalTrainers: number;
  totalGyms: number;
  activePrograms: number;
  averageRating: number;
  pendingPayments: number;
  newRegistrations: number;
} 