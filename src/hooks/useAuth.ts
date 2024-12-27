import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin } from '../services/api';

interface LoginResponse {
  message: string;
  token: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      login: async (password: string) => {
        const response = await apiLogin(password) as LoginResponse;
        set({ 
          isAuthenticated: true,
          token: response.token
        });
      },
      logout: () => {
        set({ 
          isAuthenticated: false,
          token: null 
        });
        window.location.href = '/admin';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 