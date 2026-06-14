import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken, setUnauthorizedHandler } from '../lib/api-client';
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

async function readStoredAuth(): Promise<StoredAuth | null> {
  let raw: string | null = null;
  if (Platform.OS === 'web') {
    raw = localStorage.getItem(AUTH_STORAGE_KEY);
  } else {
    try {
      raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    } catch {
      raw = null;
    }
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.accessToken || !parsed.user) return null;
    return parsed;
  } catch {
    await clearStoredAuth();
    return null;
  }
}

async function saveStoredAuth(auth: StoredAuth) {
  const value = JSON.stringify(auth);
  if (Platform.OS === 'web') {
    localStorage.setItem(AUTH_STORAGE_KEY, value);
  } else {
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, value);
  }
}

async function clearStoredAuth() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    try {
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    } catch {
      // Fail silently on native if delete fails
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const clearSession = async () => {
      setUser(null);
      setAuthToken(null);
      await clearStoredAuth();
    };

    setUnauthorizedHandler(() => {
      clearSession();
    });

    const restore = async () => {
      try {
        const storedAuth = await readStoredAuth();
        if (!storedAuth || !active) return;
        setAuthToken(storedAuth.accessToken);
        const response = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedAuth.accessToken}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Unauthorized');
        const userData = toAuthUser(data.data || data);
        if (active) {
          setUser(userData);
          await saveStoredAuth({ ...storedAuth, user: userData });
        }
      } catch {
        await clearSession();
      } finally {
        if (active) setIsLoading(false);
      }
    };

    restore();

    return () => {
      active = false;
      setUnauthorizedHandler(null);
    };
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
      await saveStoredAuth({
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
    await clearStoredAuth();
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
      await saveStoredAuth({
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
