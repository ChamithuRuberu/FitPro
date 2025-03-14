// Common API Response structure
export interface ApiResponse<T = any> {
  code: string;
  title: string;
  message: string;
  data: T;
}

// Form Data interfaces
export interface TrainerProfileData {
  username: string;
  name: string;
  city: string;
  password: string;
  role_type: string;
  servicePeriod: string;
  weight: string;
  height: string;
  profile: string;
}

export interface UserProfileData {
  username: string;
  name: string;
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
  profile: string;
} 