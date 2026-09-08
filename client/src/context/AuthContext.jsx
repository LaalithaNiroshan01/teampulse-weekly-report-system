import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wrg_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('wrg_token');
      const storedUser = localStorage.getItem('wrg_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('wrg_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('wrg_token', newToken);
    localStorage.setItem('wrg_user', JSON.stringify(newUser));
    return newUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('wrg_token', newToken);
    localStorage.setItem('wrg_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wrg_token');
    localStorage.removeItem('wrg_user');
  };

  const isManager = user?.role === 'manager';
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isManager,
        isMember,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
