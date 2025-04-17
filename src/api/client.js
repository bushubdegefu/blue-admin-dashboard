
import { toast } from "sonner";
import { authService } from "./authService";

const API_BASE_URL = "/api/v1";

// Default headers for all requests
const defaultHeaders = {
  "Content-Type": "application/json",
};

// Add auth token if available
const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { "X-APP-TOKEN": token } : {};
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...defaultHeaders,
      ...getAuthHeaders(),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      // Handle unauthorized specifically to redirect to login
      if (response.status === 401) {
        authService.logout();
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }

      throw new Error(isJson ? data.details || "An error occurred" : "An error occurred");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    toast.error(error.message || "Failed to connect to the server");
    throw error;
  }
};

export const api = {
  get: (endpoint, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return apiRequest(url, { method: "GET" });
  },

  post: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  patch: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: (endpoint) => {
    return apiRequest(endpoint, { method: "DELETE" });
  },
};

