import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../lib/api-client';
import { BASE_URL } from '../lib/config';

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
const AUTH_STORAGE_KEY = 'horsetrack.auth';

type StoredAuth = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

function getStorage() {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null;
  }
}

function toAuthUser(raw: any): AuthUser {
  return {
    id: raw._id || raw.id,
    fullName: raw.fullName,
    email: raw.email,
    avatar: raw.avatar,
    roles: raw.roles || [],
    status: raw.status,
    phone: raw.phone,
    address: raw.address,
    dob: raw.dob,
  };
}

function readStoredAuth(): StoredAuth | null {
  const raw = getStorage()?.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.accessToken || !parsed.user) return null;
    return parsed;
  } catch {
    getStorage()?.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function saveStoredAuth(auth: StoredAuth) {
  getStorage()?.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearStoredAuth() {
  getStorage()?.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = readStoredAuth();
    if (storedAuth) {
      setAuthToken(storedAuth.accessToken);
      setUser(storedAuth.user);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
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
      
      const userData = toAuthUser(payload.user);

      setUser(userData);
      saveStoredAuth({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: userData,
      });
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setAuthToken(null);
    clearStoredAuth();
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
      const response = await fetch(`${BASE_URL}/auth/register`, {
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

      const userData = toAuthUser(payloadData.user);

      setUser(userData);
      saveStoredAuth({
        accessToken: payloadData.accessToken,
        refreshToken: payloadData.refreshToken,
        user: userData,
      });
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
