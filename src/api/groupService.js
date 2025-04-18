
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

}

