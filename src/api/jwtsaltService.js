
import { api } from "./client";

export const jwtsaltService = {
  // Get a paginated list of jwtsalts
  getJWTSalts: (params = {}) => {
    const { page = 1, size = 10 } = params;
    return api.get("/blue_admin/jwtsalt", params);
  },

  // Get a specific jwtsalt by ID
  getJWTSaltById: (jwtsaltId) => {
    return api.get(`/blue_admin/jwtsalt/${jwtsaltId}`);
  },

  // Create a new jwtsalt
  createJWTSalt: (jwtsaltData) => {
    return api.post("/blue_admin/jwtsalt", jwtsaltData);
  },

  // Update a jwtsalt
  updateJWTSalt: (data) => {
    return api.patch(`/blue_admin/jwtsalt/${data?.jwtsaltId}`, data?.jwtsaltData);
  },

  // Delete a jwtsalt
  deleteJWTSalt: (jwtsaltId) => {
    return api.delete(`/blue_admin/jwtsalt/${jwtsaltId}`);
  },

}

