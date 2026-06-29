import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  bio?: string;
  avatar?: string;
  isVerified: boolean;
  settings: {
    theme: 'light' | 'dark';
    language: string;
    privacy: {
      shareData: boolean;
      anonymousAI: boolean;
    };
    notifications: {
      dailyReminder: boolean;
      journalReminder: boolean;
      waterReminder: boolean;
      studyReminder: boolean;
      meditationReminder: boolean;
      sleepReminder: boolean;
    };
  };
  stats: {
    points: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: string;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    badgeUrl?: string;
  }>;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (credentials: any, rememberMe?: boolean) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserType>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { ...credentials, rememberMe });
      const { accessToken, refreshToken, user: loggedUser } = response.data;

      if (rememberMe) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        sessionStorage.setItem('token', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
      }

      setUser(loggedUser);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', userData);
      const { accessToken, refreshToken, user: loggedUser } = response.data;

      // Default to session storage on registration
      sessionStorage.setItem('token', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);

      setUser(loggedUser);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<UserType>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } as UserType : null));
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
