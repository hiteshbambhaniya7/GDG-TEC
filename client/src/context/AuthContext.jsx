import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_PERSONAS = [
  {
    key: 'citizen',
    label: 'Citizen (Hardik Patel)',
    phone: '9898000001',
    role: 'citizen',
    department: 'Citizen',
    description: 'Report issues, track live status, rate resolutions'
  },
  {
    key: 'pwd_officer',
    label: 'PWD Engineer (Rajesh Vaghela)',
    phone: '9898000002',
    role: 'officer',
    department: 'Roads & Buildings (PWD)',
    description: 'Triage road potholes, assign crews, upload proof'
  },
  {
    key: 'swm_officer',
    label: 'SWM Officer (Meena Trivedi)',
    phone: '9898000003',
    role: 'officer',
    department: 'Solid Waste Management',
    description: 'Dispatch sanitation compactors, clear dumps'
  },
  {
    key: 'commissioner',
    label: 'Municipal Commissioner',
    phone: '9898000004',
    role: 'admin',
    department: 'General Administration',
    description: 'City-wide civic intelligence, heatmaps, SLAs'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smart_bhavnagar_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smart_bhavnagar_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.data);
        } catch {
          localStorage.removeItem('smart_bhavnagar_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginWithCredentials = async (phone, password) => {
    const res = await api.login(phone, password);
    localStorage.setItem('smart_bhavnagar_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const switchPersona = async (personaKey) => {
    const persona = DEMO_PERSONAS.find(p => p.key === personaKey);
    if (!persona) return;
    try {
      const res = await api.login(persona.phone, 'password123');
      localStorage.setItem('smart_bhavnagar_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error('Failed to switch persona:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('smart_bhavnagar_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        loading,
        login: loginWithCredentials,
        logout,
        switchPersona,
        personas: DEMO_PERSONAS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
