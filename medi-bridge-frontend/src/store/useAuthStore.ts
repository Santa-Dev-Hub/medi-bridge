import { create } from 'zustand';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'doctor';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string, role: 'user' | 'admin' | 'doctor') => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female' | 'other';
  role?: 'user' | 'admin' | 'doctor';
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  login: async (email, password, role) => {
    const response = await api.post('/auth/login', { email, password, role });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    set({ user });
  },

  register: async (data) => {
    const response = await api.post('/auth/register', {
      ...data,
      role: data.role || 'user',
    });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null });
        return;
      }

      const response = await api.get('/user/me');
      set({ user: response.data.user });
    } catch (error) {
      set({ user: null });
      localStorage.removeItem('token');
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAuthStore; 