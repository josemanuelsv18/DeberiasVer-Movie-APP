'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { UserInfo } from '@/lib/types';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (nombreUsuario: string, contrasena: string) => Promise<{ success: boolean; message: string }>;
  register: (nombreUsuario: string, contrasena: string, edad: number) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (nombreUsuario: string, contrasena: string) => {
    try {
      const response = await authApi.login({ nombreUsuario, contrasena });
      if (response.success && response.token && response.usuario) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.usuario);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al iniciar sesión' };
    }
  };

  const register = async (nombreUsuario: string, contrasena: string, edad: number) => {
    try {
      const response = await authApi.register({ nombreUsuario, contrasena, edad });
      if (response.success && response.token && response.usuario) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.usuario);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al registrarse' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await authApi.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch {
        // Silently fail
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
