
import { toast } from "sonner";
import { LoginCredentials, LoginResponse, User } from "@/types";

// Define base API URL to match the server
const API_BASE_URL = "http://localhost:7500/api/v1";

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

// Login implementation
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // For real implementation with the API:
    const response = await fetch(`${API_BASE_URL}/blue_admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Login failed');
    }

    const responseData: LoginResponse = await response.json();
    
    if (responseData.success && responseData.data) {
      // Save tokens to localStorage
      saveTokens(responseData.data.access_token, responseData.data.refresh_token);
      
      // Save user info
      localStorage.setItem("user", JSON.stringify(responseData.data.access_token));
      
      return responseData;
    } else {
      throw new Error(responseData.details || 'Login failed');
    }
  } catch (error: any) {
    // If API is unreachable, fall back to mock login
    if (error.message === 'Failed to fetch' || error.message.includes('connect')) {
      console.warn('API server unreachable, falling back to mock login');
      return mockLogin(credentials);
    }
    
    return handleApiError(error);
  }
};

// Mock login for development/fallback
const mockLogin = (credentials: LoginCredentials): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    // Mock successful login
    if (credentials.email === "admin" && credentials.password === "password") {
      const mockToken = "mock-token-" + Math.random().toString(36).substring(2);
      const mockRefreshToken = "mock-refresh-token-" + Math.random().toString(36).substring(2);
      
      // Mock user that matches the UserGet model including required fields
      const mockUser: User = {
        id: "1",
        uuid: "mock-uuid-" + Math.random().toString(36).substring(2),
        username: credentials.email,
        email: "admin@example.com",
        first_name: "Admin",
        last_name: "User",
        middle_name: "",
        disabled: false,
        date_registered: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        groups: [],
        scopes: []
      };
      
      // Save tokens to localStorage
      saveTokens(mockToken, mockRefreshToken);
      
      // Save user info
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      const mockResponse: LoginResponse = {
        data: {
          access_token: mockToken,
          refresh_token: mockRefreshToken,
          
        },
        details: "Mock login successful",
        success: true
      };
      
      resolve(mockResponse);
    } else {
      reject(new Error("Invalid username or password"));
    }
  });
};

export const logout = () => {
  clearTokens();
};

export const isAuthenticated = (): boolean => {
  const { token } = getTokens();
  return token !== null;
};

export const getCurrentUser = (): User | null => {
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

export const getToken = (): string | null => {
  return localStorage.getItem("token");
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

// Export LoginCredentials type and functions
export type { LoginCredentials };

export const authService = {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  getToken
};
