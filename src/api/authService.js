
import { api } from "./client";

// Re-export the auth service methods
export const authService = {
  login: async (credentials) => {
    try {
      // Transform credentials to match API expectations
      const loginPayload = {
        email: credentials.email,
        password: credentials.password,
        grant_type: credentials.grant_type || "authorization_code",
        token_type: credentials.token_type || "Bearer"
      };

      // Call the API endpoint
      const response = await api.post('/blue_admin/login', loginPayload);
      const user = await api.post("/blue_admin/login", {
        "email":"tokendecode@mail.com",
        "password":"123456",
        "grant_type":"token_decode",
        "token":response.data.access_token
      });

     
      if (response?.success && response?.data) {
        // Store tokens and user data
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("app-token", response.data.access_token);
        localStorage.setItem("refresh-token", response.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(user?.data));
        
        return response;
      } else {
        throw new Error(response?.details || "Invalid response from server");
      }
    } catch (error) {
      console.log('Using mock login due to API error:', error);
      // Fall back to mock service if API fails
      throw error; // Re-throw the error to be handled by the caller
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
    const user =  localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
    
  },

  getToken: () => {
    return localStorage.getItem("app-token");
  },

  getRefreshToken: () => {
    return localStorage.getItem("refresh-token");
  }
};
