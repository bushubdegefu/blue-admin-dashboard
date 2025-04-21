
import { api } from "./client";

export const groupService = {
  // Get a paginated list of groups
  getGroups: (data) => {
    return api.get("/blue_admin/group", { page: data?.page, size: data?.size });
  },

  // Get a specific group by ID
  getGroupById: (groupId) => {
    return api.get(`/blue_admin/group/${groupId}`);
  },

  // Create a new group
  createGroup: (groupData) => {
    return api.post("/blue_admin/group", groupData);
  },

  // Update a group
  updateGroup: (data) => {
    return api.patch(`/blue_admin/group/${data?.groupId}`, data?.groupData);
  },

  // Delete a group
  deleteGroup: (groupId) => {
    return api.delete(`/blue_admin/group/${groupId}`);
  },
//###############################################
// Now realationshipQeury Endpoints(Many to Many)
//###############################################
	getGroupUsers: (data) => {
		return api.get(`/blue_admin/usergroup/${data?.groupId}`, { page: data?.page, size: data?.size });
	},

	// Get users that can be assigned to a group
	getAvailableUsersForGroup: (groupId) => {
	    return api.get(`/blue_admin/usercomplementgroup/${groupId}`);
	},
	// Get users already assigned to a group
	getAttachedUsersForGroup: (groupId) => {
	    return api.get(`/blue_admin/usernoncomplementgroup/${groupId}`);
	},

	addUserToGroup: (data) => {
		return api.post(`/blue_admin/usergroup/${data?.userId}/${data?.groupId}`);
	},

	deleteUserFromGroup: (data) => {
		return api.delete(`/blue_admin/usergroup/${data?.userId}/${data?.groupId}`);
	},
//###############################################
// Scope-Group relationship endpoints (Many to Many)
//###############################################
	getGroupScopes: (data) => {
		return api.get(`/blue_admin/scopegroup/${data?.groupId}`, { page: data?.page, size: data?.size });
	},

	// Get scopes that can be assigned to a group
	getAvailableScopesForGroup: (groupId) => {
	    return api.get(`/blue_admin/scopecomplementgroup/${groupId}`);
	},
	// Get scopes already assigned to a group
	getAttachedScopesForGroup: (groupId) => {
	    return api.get(`/blue_admin/scopenoncomplementgroup/${groupId}`);
	},

	addScopeToGroup: (data) => {
		return api.post(`/blue_admin/scopegroup/${data?.scopeId}/${data?.groupId}`);
	},

	removeScopeFromGroup: (data) => {
		return api.delete(`/blue_admin/scopegroup/${data?.scopeId}/${data?.groupId}`);
	},

}
