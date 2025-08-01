import { api } from "./client";

export const appService = {
  // Get a paginated list of apps
  getApps: (params = {}) => {
    const { page = 1, size = 10 } = params;
    return api.get("/blue_admin/app", params);
  },

  // Get a specific app by ID
  getAppById: (appId) => {
    return api.get(`/blue_admin/app/${appId}`);
  },

  // Create a new app
  createApp: (appData) => {
    return api.post("/blue_admin/app", appData);
  },

  // Update a app
  updateApp: (data) => {
    return api.patch(`/blue_admin/app/${data?.appId}`, data?.appData);
  },

  // Delete a app
  deleteApp: (appId) => {
    return api.delete(`/blue_admin/app/${appId}`);
  },
//###############################################
// Now realationshipQeury Endpoints(one to Many)
//###############################################
	getAppGroup: (data)=>{
		return api.get(`/blue_admin/appgroup/${data?.appId}`,{ page: data?.page, size: data?.size });
	},

	// Get groups that can be assigned to a group
	getAvailableGroupsForApp: (appId) => {
	    return api.get(`/blue_admin/groupcomplementapp/${appId}`);
	},
	// Get permissions that can be assigned to a group
	getAttachedGroupsForApp: (appId) => {
	    return api.get(`/blue_admin/groupnoncomplementapp/${appId}`);
	},

	addGroupApp: (data) => {
		return api.post(`/blue_admin/appgroup/${data?.groupId}/${data?.appId}`);
	},

	deleteGroupApp: (data) => {
		return api.delete(`/blue_admin/appgroup/${data?.groupId}/${data?.appId}`);
	},

}