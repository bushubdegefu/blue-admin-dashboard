
import { api } from "./client";
import { toast } from "sonner";

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post("/blue_admin/login", {
        email: username, // Using email field for username
        password: password,
        grant_type: "authorization_code"
      });
      
      if (response && response.data) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("app-token", response.data.access_token);
        localStorage.setItem("refresh-token", response.data.refresh_token);
        
        // Store basic user info
        localStorage.setItem("user", JSON.stringify({ username }));
        
        return { success: true };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
      throw error;
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
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem("app-token");
  },

  getRefreshToken: () => {
    return localStorage.getItem("refresh-token");
  }
};
