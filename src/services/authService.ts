
import { toast } from "sonner";

// Define base API URL to match the server
const API_BASE_URL = "http://localhost:7500/api/v1";

// Types for authentication based on swagger definitions
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: any | null;
}

// Common response type based on swagger definitions
interface ResponseHTTP<T = any> {
  data: T;
  details: string;
  success: boolean;
}

// Function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  let errorMessage = "An unexpected error occurred";
  
  if (error.response) {
    errorMessage = error.response.data?.details || "Server error";
  } else if (error.request) {
    errorMessage = "No response from server";
  } else {
    errorMessage = error.message;
  }
  
  toast.error(errorMessage);
  return Promise.reject(errorMessage);
};

// Token management
export const saveTokens = (token: string, refreshToken: string) => {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getTokens = (): { token: string | null, refreshToken: string | null } => {
  return {
    token: localStorage.getItem("token"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
};

// Mock login for development
// In real implementation, this would call the actual login endpoint
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // For now, we'll use mock login since we don't have the actual login API endpoint specified
    // In a real implementation, this would be an actual API call to the auth endpoint
    
    // Mock successful login
    if (credentials.username === "admin" && credentials.password === "password") {
      const mockResponse = {
        token: "mock-token-" + Math.random().toString(36).substring(2),
        refreshToken: "mock-refresh-token-" + Math.random().toString(36).substring(2)
      };
      
      // Save tokens to localStorage
      saveTokens(mockResponse.token, mockResponse.refreshToken);
      
      // Save basic user info that matches the UserGet model
      localStorage.setItem("user", JSON.stringify({
        id: 1,
        uuid: "mock-uuid-" + Math.random().toString(36).substring(2),
        username: credentials.username,
        email: "admin@example.com",
        first_name: "Admin",
        last_name: "User",
        middle_name: "",
        disabled: false,
        date_registered: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }));
      
      return mockResponse;
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    return handleApiError(error);
  }
};

export const logout = () => {
  clearTokens();
};

export const isAuthenticated = (): boolean => {
  const { token } = getTokens();
  return token !== null;
};

export const getCurrentUser = () => {
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// API request with authentication that matches the API structure
export const authenticatedRequest = async (
  endpoint: string, 
  method: string = 'GET', 
  body?: any,
  queryParams?: Record<string, string | number>
) => {
  const { token, refreshToken } = getTokens();
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-APP-TOKEN': token
  };
  
  if (refreshToken) {
    headers['X-REFRESH-TOKEN'] = refreshToken;
  }
  
  // Build URL with query params if provided
  let url = `${API_BASE_URL}${endpoint}`;
  if (queryParams) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    url += `?${params.toString()}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear tokens and redirect to login
        clearTokens();
        window.location.href = "/login";
        throw new Error("Authentication failed. Please login again.");
      }
      
      const errorData = await response.json();
      throw new Error(errorData.details || "API request failed");
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
