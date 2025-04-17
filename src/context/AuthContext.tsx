
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAuthenticated, login, logout, LoginCredentials, getTokens, getCurrentUser } from '@/services/authService';
import { User } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await login(credentials);
      
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        toast.success('Login successful');
        navigate('/');
      } else {
        toast.error(response.details || 'Login failed');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const value = {
    isAuthenticated: isUserAuthenticated,
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
