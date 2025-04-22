
import { api } from "./client";

export const resourceService = {
  // Get a paginated list of resources
  getResources: (params = {}) => {
    const { page = 1, size = 10 } = params;
    return api.get("/blue_admin/resource", params);
  },

  // Get a specific resource by ID
  getResourceById: (resourceId) => {
    return api.get(`/blue_admin/resource/${resourceId}`);
  },

  // Create a new resource
  createResource: (resourceData) => {
    return api.post("/blue_admin/resource", resourceData);
  },

  // Update a resource
  updateResource: (data) => {
    return api.patch(`/blue_admin/resource/${data?.resourceId}`, data?.resourceData);
  },

  // Delete a resource
  deleteResource: (resourceId) => {
    return api.delete(`/blue_admin/resource/${resourceId}`);
  },

}

