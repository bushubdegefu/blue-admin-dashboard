
import { User } from "@/types";

// Included required properties for User type
export const mockUser: User = {
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

// Mock login response
export const mockLoginResponse = {
  success: true,
  data: {
    access_token: "mock-access-token-xxxx",
    refresh_token: "mock-refresh-token-xxxx"
  },
  details: "Login successful"
};

// Mock function to simulate API call delay
export const mockApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Create mock data with required User properties
export const mockUserData: User = {
  id: "user1",
  uuid: "uuid-user1",
  username: "johndoe",
  email: "john.doe@example.com",
  first_name: "John",
  middle_name: "Robert",
  last_name: "Doe",
  disabled: false,
  date_registered: "2023-01-01T00:00:00Z",
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  groups: [],
  scopes: []
};
