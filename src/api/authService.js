
import { api } from "./client";
import { authService as originalAuthService } from "../services/authService";

// Re-export the auth service methods
export const authService = {
  ...originalAuthService,
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
      
      if (response?.success && response?.data) {
        // Store tokens and user data
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("app-token", response.data.access_token);
        localStorage.setItem("refresh-token", response.data.refresh_token);
        
        return response;
      } else {
        throw new Error(response?.details || "Invalid response from server");
      }
    } catch (error) {
      console.log('Using mock login due to API error:', error);
      // Fall back to mock service if API fails
      return originalAuthService.login(credentials);
    }
  }
};
