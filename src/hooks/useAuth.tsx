
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser, updateUserProfile } from '@/services/authService';
import { AuthState, AuthUser, UserRole } from '@/types/app.types';

interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null; error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string, role?: UserRole) => Promise<{ user: AuthUser | null; error: any }>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();
        setAuthState({
          user,
          loading: false,
          initialized: true,
        });
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          initialized: true,
        });
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.user) {
      setAuthState({
        user: result.user,
        loading: false,
        initialized: true,
      });
    }
    return result;
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    phone: string,
    role: UserRole = 'patient'
  ) => {
    const result = await registerUser(email, password, firstName, lastName, phone, role);
    if (result.user) {
      setAuthState({
        user: result.user,
        loading: false,
        initialized: true,
      });
    }
    return result;
  };

  const signOut = () => {
    logoutUser();
    setAuthState({
      user: null,
      loading: false,
      initialized: true,
    });
  };

  const refreshUser = async () => {
    try {
      const user = await getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const updateProfile = async (userData: Partial<AuthUser>) => {
    try {
      const updatedUser = await updateUserProfile(userData);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, signIn, signUp, signOut, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
