import { api } from "./client";

export const scopeService = {
  // Get a paginated list of scopes
  getScopes: (params = {}) => {
    const { page = 1, size = 10 } = params;
    return api.get("/blue_admin/scope", params);
  },

  // Get a specific scope by ID
  getScopeById: (scopeId) => {
    return api.get(`/blue_admin/scope/${scopeId}`);
  },

  // Create a new scope
  createScope: (scopeData) => {
    return api.post("/blue_admin/scope", scopeData);
  },

  // Update a scope
  updateScope: (data) => {
    return api.patch(`/blue_admin/scope/${data?.scopeId}`, data?.scopeData);
  },

  // Delete a scope
  deleteScope: (scopeId) => {
    return api.delete(`/blue_admin/scope/${scopeId}`);
  },
//###############################################
// Now realationshipQeury Endpoints(Many to Many)
//###############################################
	getScopeGroup: (data)=>{
		return api.get(`/blue_admin/scopegroup/${data?.scopeId}`,{ page: data?.page, size: data?.size });
	},

	// Get groups that can be assigned to a group
	getAvailableGroupsForScope: (scopeId) => {
	    return api.get(`/blue_admin/groupcomplementscope/${scopeId}`);
	},
	// Get permissions that can be assigned to a group
	getAttachedGroupsForScope: (scopeId) => {
	    return api.get(`/blue_admin/groupnoncomplementscope/${scopeId}`);
	},

	addGroupScope: (data) => {
		return api.post(`/blue_admin/scopegroup/${data?.groupId}/${data?.scopeId}`);
	},

	deleteGroupScope: (data) => {
		return api.delete(`/blue_admin/scopegroup/${data?.groupId}/${data?.scopeId}`);
	},
//###############################################
// Now realationshipQeury Endpoints(Many to Many)
//###############################################
	getScopeUser: (data)=>{
		return api.get(`/blue_admin/scopeuser/${data?.scopeId}`,{ page: data?.page, size: data?.size });
	},

	// Get users that can be assigned to a user
	getAvailableUsersForScope: (scopeId) => {
	    return api.get(`/blue_admin/usercomplementscope/${scopeId}`);
	},
	// Get permissions that can be assigned to a user
	getAttachedUsersForScope: (scopeId) => {
	    return api.get(`/blue_admin/usernoncomplementscope/${scopeId}`);
	},

	addUserScope: (data) => {
		return api.post(`/blue_admin/scopeuser/${data?.userId}/${data?.scopeId}`);
	},

	deleteUserScope: (data) => {
		return api.delete(`/blue_admin/scopeuser/${data?.userId}/${data?.scopeId}`);
	},
//###############################################
// Now realationshipQeury Endpoints(one to Many)
//###############################################
	getScopeResource: (data)=>{
		return api.get(`/blue_admin/scoperesource/${data?.scopeId}`,{ page: data?.page, size: data?.size });
	},

	// Get resources that can be assigned to a resource
	getAvailableResourcesForScope: (scopeId) => {
	    return api.get(`/blue_admin/resourcecomplementscope/${scopeId}`);
	},
	// Get permissions that can be assigned to a resource
	getAttachedResourcesForScope: (scopeId) => {
	    return api.get(`/blue_admin/resourcenoncomplementscope/${scopeId}`);
	},

	addResourceScope: (data) => {
		return api.post(`/blue_admin/scoperesource/${data?.resourceId}/${data?.scopeId}`);
	},

	deleteResourceScope: (data) => {
		return api.delete(`/blue_admin/scoperesource/${data?.resourceId}/${data?.scopeId}`);
	},

}