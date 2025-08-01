import { api } from "./client";

export const groupService = {
  // Get a paginated list of groups
  getGroups: (params = {}) => {
    const { page = 1, size = 10 } = params;
    return api.get("/blue_admin/group", params);
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
	getGroupUser: (data)=>{
		return api.get(`/blue_admin/groupuser/${data?.groupId}`,{ page: data?.page, size: data?.size });
	},

	// Get users that can be assigned to a user
	getAvailableUsersForGroup: (groupId) => {
	    return api.get(`/blue_admin/usercomplementgroup/${groupId}`);
	},
	// Get permissions that can be assigned to a user
	getAttachedUsersForGroup: (groupId) => {
	    return api.get(`/blue_admin/usernoncomplementgroup/${groupId}`);
	},

	addUserGroup: (data) => {
		return api.post(`/blue_admin/groupuser/${data?.userId}/${data?.groupId}`);
	},

	deleteUserGroup: (data) => {
		return api.delete(`/blue_admin/groupuser/${data?.userId}/${data?.groupId}`);
	},
//###############################################
// Now realationshipQeury Endpoints(Many to Many)
//###############################################
	getGroupScope: (data)=>{
		return api.get(`/blue_admin/groupscope/${data?.groupId}`,{ page: data?.page, size: data?.size });
	},

	// Get scopes that can be assigned to a scope
	getAvailableScopesForGroup: (groupId) => {
	    return api.get(`/blue_admin/scopecomplementgroup/${groupId}`);
	},
	// Get permissions that can be assigned to a scope
	getAttachedScopesForGroup: (groupId) => {
	    return api.get(`/blue_admin/scopenoncomplementgroup/${groupId}`);
	},

	addScopeGroup: (data) => {
		return api.post(`/blue_admin/groupscope/${data?.scopeId}/${data?.groupId}`);
	},

	deleteScopeGroup: (data) => {
		return api.delete(`/blue_admin/groupscope/${data?.scopeId}/${data?.groupId}`);
	},

}