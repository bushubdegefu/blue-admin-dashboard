
import { api } from "./client";
import { authService as originalAuthService } from "../services/authService";

// Re-export the auth service methods
export const authService = {
  ...originalAuthService,
  login: async (credentials) => {
    try {
      // Try to call the API
      return await api.post('/auth/login', credentials);
    } catch (error) {
      console.log('Using mock login due to API error:', error);
      // Fall back to mock service if API fails
      return originalAuthService.login(credentials);
    }
  }
};
