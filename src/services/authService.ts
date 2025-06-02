
import { apiRequest } from "./api";
import { AuthUser, UserRole } from "@/types/app.types";

export const loginUser = async (email: string, password: string) => {
  console.log('Attempting login with:', email);
  
  try {
    // Login request to get token
    const data = await apiRequest('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    console.log('Login response received:', data);
    
    if (!data.token) {
      throw new Error('No authentication token received');
    }
    
    // Store the token with both keys for compatibility
    localStorage.setItem('token', data.token);
    localStorage.setItem('auth_token', data.token);
    
    // Get user data
    const userData = await getCurrentUser();
    return { user: userData, error: null };
  } catch (error: any) {
    console.error('Login failed:', error);
    return { user: null, error };
  }
};

export const registerUser = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string, 
  phone: string,
  role: UserRole = 'patient'
) => {
  console.log('Registering new user:', { email, firstName, lastName, phone, role });
  
  try {
    // Register request
    const data = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        firstName, 
        lastName, 
        phone,
        role 
      })
    });
    
    console.log('Registration response received:', data);
    
    if (!data.token) {
      throw new Error('No authentication token received');
    }
    
    // Store the token with both keys for compatibility
    localStorage.setItem('token', data.token);
    localStorage.setItem('auth_token', data.token);
    
    // Get user data
    const userData = await getCurrentUser();
    return { user: userData, error: null };
  } catch (error: any) {
    console.error('Registration failed:', error);
    return { user: null, error };
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    console.log('Fetching current user data');
    const data = await apiRequest('/auth');
    
    console.log('User data received:', data);
    
    if (data && data._id) {
      return {
        id: data._id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone:data.phone,
        kycStatus: data.kycStatus || 'pending',
        kycData: data.kycData || null,
        uhid: data.uhid || '',
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Failed to get current user:', error);
    // Clear invalid token
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    return null;
  }
};

export const logoutUser = () => {
  console.log('Logging out user');
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
};

export const checkAuthToken = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};
