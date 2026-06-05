import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAuthToken, type UserItem } from '../lib/api-client';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  roles: string[];
  status: string;
  phone?: string;
  address?: string;
  dob?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    dob?: string;
    roles?: string[];
    password?: string;
  }) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${require('../lib/config').BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Tên tài khoản hoặc mật khẩu không chính xác.');
      }
      
      const payload = data.data || data;
      setAuthToken(payload.accessToken);
      
      // Parse user model
      const userData: AuthUser = {
        id: payload.user._id || payload.user.id,
        fullName: payload.user.fullName,
        email: payload.user.email,
        avatar: payload.user.avatar,
        roles: payload.user.roles || [],
        status: payload.user.status,
        phone: payload.user.phone,
        address: payload.user.address,
        dob: payload.user.dob,
      };

      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setAuthToken(null);
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    dob?: string;
    roles?: string[];
    password?: string;
  }): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${require('../lib/config').BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký tài khoản thất bại.');
      }

      const payloadData = data.data || data;
      setAuthToken(payloadData.accessToken);

      const userData: AuthUser = {
        id: payloadData.user._id || payloadData.user.id,
        fullName: payloadData.user.fullName,
        email: payloadData.user.email,
        avatar: payloadData.user.avatar,
        roles: payloadData.user.roles || [],
        status: payloadData.user.status,
        phone: payloadData.user.phone,
        address: payloadData.user.address,
        dob: payloadData.user.dob,
      };

      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
}
