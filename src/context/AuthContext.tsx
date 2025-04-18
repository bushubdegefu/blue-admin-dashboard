
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { authService } from "@/services/authService";
import type { LoginCredentials } from "@/services/authService";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          // Add created_at and updated_at if not present (for mock data)
          if (!currentUser.created_at) {
            currentUser.created_at = new Date().toISOString();
          }
          if (!currentUser.updated_at) {
            currentUser.updated_at = new Date().toISOString();
          }
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      const userData = response.data.user;
      
      // Add created_at and updated_at if not present (for mock data)
      if (!userData.created_at) {
        userData.created_at = new Date().toISOString();
      }
      if (!userData.updated_at) {
        userData.updated_at = new Date().toISOString();
      }
      
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
