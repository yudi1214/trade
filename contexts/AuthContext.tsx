// contexts/AuthContext.tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Defina os tipos para o usuário e o contexto
interface User {
  id: string;
  name: string;
  email: string;
  accountType: string;
  realBalance: number;
  demoBalance: number;
  bonusBalance: number;
  verified: boolean;
  kycApproved: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  // Adicione outros métodos conforme necessário
}

// Crie o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | null>(null);

// Props para o AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há um token no localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Erro ao analisar dados do usuário:', error);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, message: 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}