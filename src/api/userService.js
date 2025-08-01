import { api } from "./client";

export const userService = {
  // Get a paginated list of users
  getUsers: (params = {}) => {
    const { page = 1, size = 10 } = params;
    return api.get("/blue_admin/user", params);
  },

  // Get a specific user by ID
  getUserById: (userId) => {
    return api.get(`/blue_admin/user/${userId}`);
  },

  // Create a new user
  createUser: (userData) => {
    return api.post("/blue_admin/user", userData);
  },

  // Update a user
  updateUser: (data) => {
    return api.patch(`/blue_admin/user/${data?.userId}`, data?.userData);
  },

  // Delete a user
  deleteUser: (userId) => {
    return api.delete(`/blue_admin/user/${userId}`);
  },
//###############################################
// Now realationshipQeury Endpoints(Many to Many)
//###############################################
	getUserGroup: (data)=>{
		return api.get(`/blue_admin/usergroup/${data?.userId}`,{ page: data?.page, size: data?.size });
	},

	// Get groups that can be assigned to a group
	getAvailableGroupsForUser: (userId) => {
	    return api.get(`/blue_admin/groupcomplementuser/${userId}`);
	},
	// Get permissions that can be assigned to a group
	getAttachedGroupsForUser: (userId) => {
	    return api.get(`/blue_admin/groupnoncomplementuser/${userId}`);
	},

	addGroupUser: (data) => {
		return api.post(`/blue_admin/usergroup/${data?.groupId}/${data?.userId}`);
	},

	deleteGroupUser: (data) => {
		return api.delete(`/blue_admin/usergroup/${data?.groupId}/${data?.userId}`);
	},
//###############################################
// Now realationshipQeury Endpoints(Many to Many)
//###############################################
	getUserScope: (data)=>{
		return api.get(`/blue_admin/userscope/${data?.userId}`,{ page: data?.page, size: data?.size });
	},

	// Get scopes that can be assigned to a scope
	getAvailableScopesForUser: (userId) => {
	    return api.get(`/blue_admin/scopecomplementuser/${userId}`);
	},
	// Get permissions that can be assigned to a scope
	getAttachedScopesForUser: (userId) => {
	    return api.get(`/blue_admin/scopenoncomplementuser/${userId}`);
	},

	addScopeUser: (data) => {
		return api.post(`/blue_admin/userscope/${data?.scopeId}/${data?.userId}`);
	},

	deleteScopeUser: (data) => {
		return api.delete(`/blue_admin/userscope/${data?.scopeId}/${data?.userId}`);
	},

}