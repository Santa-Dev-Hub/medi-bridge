import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../lib/axios';

interface User {
  id: string | number;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin' | 'user';
  specialization?: string; // For doctors
  age?: number; // For patients
  height?: number; // For patients
  weight?: number; // For patients
  gender?: string; // For patients
  medicalHistory?: string[];
  lastVisit?: string;
  nextAppointment?: string;
  bmi?: number;
  experience?: number; // For doctors
  availableSlots?: Record<string, string[]>; // For doctors
  department?: string; // For admins
  joinDate?: string; // For admins
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: User['role']) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: User['role'];
    specialization?: string;
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userJson && token) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: User['role']) => {
    try {
      const backendRole = role === 'patient' ? 'user' : role;
      const response = await axios.post(`/${backendRole}/signin`, { email, password });
      console.log('LOGIN RESPONSE', response.data);
      let userObj = null;
      if (backendRole === 'doctor') userObj = response.data.doctor;
      else if (backendRole === 'admin') userObj = response.data.admin;
      else if (backendRole === 'user') userObj = response.data.user || response.data.data;
      if (backendRole === 'user' && userObj) userObj.role = 'patient';
      if (backendRole === 'doctor' && userObj) userObj.role = 'doctor';
      if (backendRole === 'admin' && userObj) userObj.role = 'admin';
      console.log('SETTING USER IN CONTEXT:', userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(userObj);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role: User['role'];
    specialization?: string;
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
  }) => {
    try {
      const backendRole = userData.role === 'patient' ? 'user' : userData.role;
      const { role, ...registrationData } = userData;
      const response = await axios.post(`/${backendRole}/signup`, registrationData);
      console.log('REGISTER RESPONSE', response.data);
      let userObj = null;
      if (backendRole === 'doctor') userObj = response.data.doctor;
      else if (backendRole === 'admin') userObj = response.data.admin;
      else if (backendRole === 'user') userObj = response.data.user || response.data.data;
      if (backendRole === 'user' && userObj) userObj.role = 'patient';
      if (backendRole === 'doctor' && userObj) userObj.role = 'doctor';
      if (backendRole === 'admin' && userObj) userObj.role = 'admin';
      console.log('SETTING USER IN CONTEXT:', userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(userObj);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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