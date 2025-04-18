
import { toast } from "sonner";
import { User, LoginCredentials } from "@/types";

// Mock user data for login
const mockUser: User = {
  id: "1",
  uuid: "123e4567-e89b-12d3-a456-426614174000",
  username: "admin",
  email: "admin@example.com",
  first_name: "Admin",
  last_name: "User",
  disabled: false,
  date_registered: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  groups: [],
  scopes: []
};

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      // Transform credentials to match API expectations
      const loginPayload = {
        email: credentials.email,
        password: credentials.password,
        grant_type: credentials.grant_type || "authorization_code",
        token_type: credentials.token_type || "Bearer"
      };

      console.log("Attempting login with:", loginPayload);

      // We're simulating a successful login for development
      // In production, this would make an actual API call
      const mockResponse = {
        success: true,
        data: {
          access_token: "mock-jwt-token-" + Math.random().toString(36).substring(2),
          refresh_token: "mock-refresh-token-" + Math.random().toString(36).substring(2)
        },
        details: "Login successful"
      };

      // Store tokens and user info in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("app-token", mockResponse.data.access_token);
      localStorage.setItem("refresh-token", mockResponse.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(mockUser));

      return mockResponse;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
      throw new Error("Login failed");
    }
  },

  logout: () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("app-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("user");
    return { success: true };
  },

  isAuthenticated: () => {
    return localStorage.getItem("isAuthenticated") === "true";
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem("app-token");
  },

  getRefreshToken: () => {
    return localStorage.getItem("refresh-token");
  }
};
