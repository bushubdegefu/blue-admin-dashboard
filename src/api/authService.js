
import { api } from "./client";
import { authService as originalAuthService } from "../services/authService";

// Re-export the auth service methods
export const authService = {
  ...originalAuthService
};
