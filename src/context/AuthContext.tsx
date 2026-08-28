import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  availableUsers: User[];
  isLoading: boolean;
  login: (email: string, role?: string) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  switchPersona: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsersList = async () => {
    try {
      const res = await api.getUsers();
      setAvailableUsers(res.users);
      return res.users;
    } catch (err) {
      console.error('Failed to load users:', err);
      return [];
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const users = await fetchUsersList();
      const savedUserId = localStorage.getItem('ecom_os_user_id');
      if (savedUserId) {
        const found = users.find(u => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
          setIsLoading(false);
          return;
        }
      }
      // Default to Demo Customer for immediate rich buyer experience
      const defaultUser = users.find(u => u.id === 'usr_cust_01') || users[0] || null;
      setCurrentUser(defaultUser);
      if (defaultUser) {
        localStorage.setItem('ecom_os_user_id', defaultUser.id);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const switchPersona = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await api.switchDemoPersona(userId);
      setCurrentUser(res.user);
      localStorage.setItem('ecom_os_user_id', res.user.id);
      localStorage.setItem('ecom_os_token', res.token);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, role);
      setCurrentUser(res.user);
      localStorage.setItem('ecom_os_user_id', res.user.id);
      localStorage.setItem('ecom_os_token', res.token);
      await fetchUsersList();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setCurrentUser(res.user);
      localStorage.setItem('ecom_os_user_id', res.user.id);
      localStorage.setItem('ecom_os_token', res.token);
      await fetchUsersList();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ecom_os_user_id');
    localStorage.removeItem('ecom_os_token');
  };

  const refreshUsers = async () => {
    await fetchUsersList();
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        isLoading,
        login,
        register,
        logout,
        switchPersona,
        refreshUsers,
        hasRole
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
