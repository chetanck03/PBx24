import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
import config from '../config/env.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      // If we have stored user data, use it immediately
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Only use stored data if it has anonymousId (required for seller features)
          if (userData.anonymousId) {
            setUser(userData);
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }

      // Then verify with server
      try {
        const response = await api.get(config.endpoints.auth.me);
        if (response.data.success) {
          setUser(response.data.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
      } catch (error) {
        // If server check fails but we have token, keep the stored user
        console.error('Server auth check failed:', error);
        if (!storedUser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (googleData) => {
    try {
      const response = await api.post(config.endpoints.auth.google, {
        googleId: googleData.sub,
        email: googleData.email,
        name: googleData.name,
        avatar: googleData.picture
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorData = error.response?.data?.error;
      
      if (errorData?.code === 'ACCOUNT_NOT_FOUND') {
        return { 
          success: false, 
          error: errorData.message,
          requiresRegistration: true,
          userData: errorData.userData
        };
      }
      
      if (errorData?.code === 'KYC_REQUIRED') {
        return { 
          success: false, 
          error: errorData.message,
          requiresKyc: true,
          userData: errorData.userData
        };
      }
      
      return { success: false, error: errorData?.message || 'Login failed' };
    }
  };

  const registerWithGoogle = async (googleData) => {
    try {
      const response = await api.post('/auth/google/register', {
        googleId: googleData.sub,
        email: googleData.email,
        name: googleData.name,
        avatar: googleData.picture,
        governmentIdProof: googleData.governmentIdProof,
        governmentIdType: googleData.governmentIdType
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { 
          success: true, 
          requiresKyc: response.data.data.requiresKyc,
          message: response.data.data.message
        };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.response?.data?.error?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Refresh user data from server (useful after admin approves KYC)
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await api.get(config.endpoints.auth.me);
      if (response.data.success) {
        const freshUser = response.data.data.user;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        console.log('[AUTH] User data refreshed, kycStatus:', freshUser.kycStatus);
        return freshUser;
      }
    } catch (error) {
      console.error('[AUTH] Failed to refresh user:', error);
    }
    return null;
  };

  const value = {
    user,
    loading,
    login,
    registerWithGoogle,
    logout,
    updateUser,
    checkAuth,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};