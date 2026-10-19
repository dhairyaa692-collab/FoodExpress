import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  adminToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fx_user_token'));
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('fx_admin_token'));
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Verify User Token on mount
  useEffect(() => {
    const checkUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem('fx_user_token');
        }
      } catch (err) {
        console.error('Failed to verify user token', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [token]);

  // Verify Admin Token on mount
  useEffect(() => {
    const checkAdmin = async () => {
      if (!adminToken) {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/verify', {
          headers: { 'x-admin-token': adminToken },
        });
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setAdminToken(null);
          localStorage.removeItem('fx_admin_token');
        }
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [adminToken]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to login' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('fx_user_token', data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error occurred during login' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone?: string; address?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to register' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('fx_user_token', data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error occurred during registration' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore errors on logout
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('fx_user_token');
  };

  const updateProfile = async (data: { name?: string; phone?: string; address?: string }) => {
    if (!token) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update profile' };
      }
      setUser(resData.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const loginAdmin = async (password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Incorrect admin password' };
      }
      setAdminToken(data.token);
      setIsAdmin(true);
      localStorage.setItem('fx_admin_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Admin login request failed' };
    }
  };

  const logoutAdmin = () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      }).catch(() => {});
    }
    setAdminToken(null);
    setIsAdmin(false);
    localStorage.removeItem('fx_admin_token');
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        adminToken,
        login,
        register,
        logout,
        updateProfile,
        loginAdmin,
        logoutAdmin,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
