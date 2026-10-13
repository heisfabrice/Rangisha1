import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from './api';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isFinder: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if an authenticated admin session token exists
    const adminToken = sessionStorage.getItem('rangisha_admin_token');
    const savedUserJson = localStorage.getItem('rangisha_user');

    if (savedUserJson) {
      try {
        const parsed = JSON.parse(savedUserJson);
        const isUserAdmin = parsed?.role === 'admin' || parsed?.role === 'super_admin';
        
        // Only keep admin user if the active session token exists
        if (isUserAdmin && !adminToken) {
          localStorage.removeItem('rangisha_user');
          setCurrentUser(null);
          return;
        }

        setCurrentUser(parsed);
        return;
      } catch (e) {
        localStorage.removeItem('rangisha_user');
      }
    }
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    const res = await api.login(email, password);
    const userRole = res.user.role;
    const isUserAdmin = userRole === 'admin' || userRole === 'super_admin';

    if (isUserAdmin) {
      sessionStorage.setItem('rangisha_admin_token', res.token);
    }

    setCurrentUser(res.user);
    localStorage.setItem('rangisha_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    sessionStorage.removeItem('rangisha_admin_token');
    localStorage.removeItem('rangisha_user');
    localStorage.removeItem('ranga_user');
    setCurrentUser(null);
  };

  const hasAdminToken = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('rangisha_admin_token'));
  const isAdmin = Boolean((currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && hasAdminToken);
  const isFinder = false;

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      login,
      logout,
      isAdmin,
      isFinder
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
