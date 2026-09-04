import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifiant: string, motDePasse: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isMaraicher: boolean;
  isExpert: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('casa_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('casa_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const refreshUser = async () => {
    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
      localStorage.setItem('casa_user', JSON.stringify(response.data));
    } catch (err) {
      console.error('Erreur lors du rafraîchissement du profil utilisateur', err);
      logout();
    }
  };

  const login = async (identifiant: string, motDePasse: string) => {
    const response = await api.post('/auth/login', { identifiant, motDePasse });
    const { token: jwt, ...userData } = response.data;
    setToken(jwt);
    setUser(userData as User);
    localStorage.setItem('casa_token', jwt);
    localStorage.setItem('casa_user', JSON.stringify(userData));
  };

  const register = async (formData: any) => {
    const response = await api.post('/auth/register', formData);
    const { token: jwt, ...userData } = response.data;
    setToken(jwt);
    setUser(userData as User);
    localStorage.setItem('casa_token', jwt);
    localStorage.setItem('casa_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('casa_token');
    localStorage.removeItem('casa_user');
  };

  const isAuthenticated = !!token && !!user;
  const isMaraicher = user?.roles?.includes('ROLE_MARAICHER') ?? false;
  const isExpert = user?.roles?.includes('ROLE_EXPERT') ?? false;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated,
        isMaraicher,
        isExpert,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé au sein d’un AuthProvider');
  }
  return context;
};