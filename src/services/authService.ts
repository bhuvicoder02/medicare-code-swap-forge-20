
import { apiRequest } from './api';
import { AuthUser, UserRole } from '@/types/app.types';

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      return { user: response.user, error: null };
    }
    
    return { user: null, error: response };
  } catch (error) {
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
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, phone, role })
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      return { user: response.user, error: null };
    }
    
    return { user: null, error: response };
  } catch (error) {
    return { user: null, error };
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await apiRequest('/auth');
    return response;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

export const updateUserProfile = async (userData: Partial<AuthUser>): Promise<AuthUser> => {
  return apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
};
