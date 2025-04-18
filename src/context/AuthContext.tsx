
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginCredentials } from "@/types";
import { authService } from "@/api/authService";
import { toast } from "sonner";

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
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            if (!currentUser.created_at) {
              currentUser.created_at = new Date().toISOString();
            }
            if (!currentUser.updated_at) {
              currentUser.updated_at = new Date().toISOString();
            }
          }
          setUser(currentUser);
        }
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
      
      if (response && response.success && response.data) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        toast.success("Login successful");
      } else {
        throw new Error(response?.details || "Login failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
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
