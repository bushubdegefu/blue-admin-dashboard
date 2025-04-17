
import { mockData } from "../data/mockData";
import { User, Group, Scope, Resource, App } from "../types";
import { generateUUID } from "../lib/utils";

// Helper for deep cloning objects
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Generic delay to simulate API latency
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// USERS
export const getUsers = async (): Promise<User[]> => {
  await delay();
  return deepClone(mockData.users);
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  await delay();
  const user = mockData.users.find(u => u.id === id);
  return user ? deepClone(user) : undefined;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  await delay();
  const newUser: User = {
    id: `u${mockData.users.length + 1}`,
    uuid: generateUUID(),
    username: userData.username || '',
    email: userData.email || '',
    first_name: userData.first_name || '',
    middle_name: userData.middle_name,
    last_name: userData.last_name || '',
    disabled: userData.disabled || false,
    date_registered: new Date().toISOString(),
    groups: [],
    scopes: []
  };
  
  mockData.users.push(newUser);
  return deepClone(newUser);
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | undefined> => {
  await delay();
  const userIndex = mockData.users.findIndex(u => u.id === id);
  
  if (userIndex === -1) return undefined;
  
  const updatedUser = {
    ...mockData.users[userIndex],
    ...userData,
    id: mockData.users[userIndex].id, // Preserve ID
    uuid: mockData.users[userIndex].uuid, // Preserve UUID
    date_registered: mockData.users[userIndex].date_registered, // Preserve registration date
  };
  
  mockData.users[userIndex] = updatedUser;
  return deepClone(updatedUser);
};

// GROUPS
export const getGroups = async (): Promise<Group[]> => {
  await delay();
  return deepClone(mockData.groups);
};

export const getGroupById = async (id: string): Promise<Group | undefined> => {
  await delay();
  const group = mockData.groups.find(g => g.id === id);
  return group ? deepClone(group) : undefined;
};

export const createGroup = async (groupData: Partial<Group>): Promise<Group> => {
  await delay();
  const newGroup: Group = {
    id: `g${mockData.groups.length + 1}`,
    name: groupData.name || '',
    description: groupData.description || '',
    active: groupData.active || true,
    users: [],
    scopes: [],
    app_id: groupData.app_id,
    app: groupData.app_id ? mockData.apps.find(a => a.id === groupData.app_id) : undefined
  };
  
  mockData.groups.push(newGroup);
  return deepClone(newGroup);
};

export const updateGroup = async (id: string, groupData: Partial<Group>): Promise<Group | undefined> => {
  await delay();
  const groupIndex = mockData.groups.findIndex(g => g.id === id);
  
  if (groupIndex === -1) return undefined;
  
  const updatedGroup = {
    ...mockData.groups[groupIndex],
    ...groupData,
    id: mockData.groups[groupIndex].id, // Preserve ID
  };
  
  mockData.groups[groupIndex] = updatedGroup;
  return deepClone(updatedGroup);
};

export const deleteGroup = async (id: string): Promise<boolean> => {
  await delay();
  const groupIndex = mockData.groups.findIndex(g => g.id === id);
  
  if (groupIndex === -1) return false;
  
  mockData.groups.splice(groupIndex, 1);
  return true;
};

// Add/remove users from group
export const addUserToGroup = async (groupId: string, userId: string): Promise<boolean> => {
  await delay();
  const group = mockData.groups.find(g => g.id === groupId);
  const user = mockData.users.find(u => u.id === userId);
  
  if (!group || !user) return false;
  
  if (!group.users.some(u => u.id === userId)) {
    group.users.push(user);
    user.groups.push(group);
  }
  
  return true;
};

export const removeUserFromGroup = async (groupId: string, userId: string): Promise<boolean> => {
  await delay();
  const group = mockData.groups.find(g => g.id === groupId);
  const user = mockData.users.find(u => u.id === userId);
  
  if (!group || !user) return false;
  
  group.users = group.users.filter(u => u.id !== userId);
  user.groups = user.groups.filter(g => g.id !== groupId);
  
  return true;
};

// SCOPES
export const getScopes = async (): Promise<Scope[]> => {
  await delay();
  return deepClone(mockData.scopes);
};

export const getScopeById = async (id: string): Promise<Scope | undefined> => {
  await delay();
  const scope = mockData.scopes.find(s => s.id === id);
  return scope ? deepClone(scope) : undefined;
};

export const createScope = async (scopeData: Partial<Scope>): Promise<Scope> => {
  await delay();
  const newScope: Scope = {
    id: `s${mockData.scopes.length + 1}`,
    name: scopeData.name || '',
    description: scopeData.description || '',
    active: scopeData.active || true,
    resources: [],
    groups: [],
    users: []
  };
  
  mockData.scopes.push(newScope);
  return deepClone(newScope);
};

export const updateScope = async (id: string, scopeData: Partial<Scope>): Promise<Scope | undefined> => {
  await delay();
  const scopeIndex = mockData.scopes.findIndex(s => s.id === id);
  
  if (scopeIndex === -1) return undefined;
  
  const updatedScope = {
    ...mockData.scopes[scopeIndex],
    ...scopeData,
    id: mockData.scopes[scopeIndex].id, // Preserve ID
  };
  
  mockData.scopes[scopeIndex] = updatedScope;
  return deepClone(updatedScope);
};

export const deleteScope = async (id: string): Promise<boolean> => {
  await delay();
  const scopeIndex = mockData.scopes.findIndex(s => s.id === id);
  
  if (scopeIndex === -1) return false;
  
  mockData.scopes.splice(scopeIndex, 1);
  return true;
};

// RESOURCES
export const getResources = async (): Promise<Resource[]> => {
  await delay();
  return deepClone(mockData.resources);
};

export const getResourceById = async (id: string): Promise<Resource | undefined> => {
  await delay();
  const resource = mockData.resources.find(r => r.id === id);
  return resource ? deepClone(resource) : undefined;
};

export const createResource = async (resourceData: Partial<Resource>): Promise<Resource> => {
  await delay();
  const newResource: Resource = {
    id: `r${mockData.resources.length + 1}`,
    name: resourceData.name || '',
    route_path: resourceData.route_path || '',
    method: resourceData.method || 'GET',
    description: resourceData.description || '',
    scope_id: resourceData.scope_id
  };
  
  mockData.resources.push(newResource);
  return deepClone(newResource);
};

export const updateResource = async (id: string, resourceData: Partial<Resource>): Promise<Resource | undefined> => {
  await delay();
  const resourceIndex = mockData.resources.findIndex(r => r.id === id);
  
  if (resourceIndex === -1) return undefined;
  
  const updatedResource = {
    ...mockData.resources[resourceIndex],
    ...resourceData,
    id: mockData.resources[resourceIndex].id, // Preserve ID
  };
  
  mockData.resources[resourceIndex] = updatedResource;
  return deepClone(updatedResource);
};

export const deleteResource = async (id: string): Promise<boolean> => {
  await delay();
  const resourceIndex = mockData.resources.findIndex(r => r.id === id);
  
  if (resourceIndex === -1) return false;
  
  mockData.resources.splice(resourceIndex, 1);
  return true;
};

// APPS
export const getApps = async (): Promise<App[]> => {
  await delay();
  return deepClone(mockData.apps);
};

export const getAppById = async (id: string): Promise<App | undefined> => {
  await delay();
  const app = mockData.apps.find(a => a.id === id);
  return app ? deepClone(app) : undefined;
};

export const createApp = async (appData: Partial<App>): Promise<App> => {
  await delay();
  const newApp: App = {
    id: `a${mockData.apps.length + 1}`,
    uuid: generateUUID(),
    name: appData.name || '',
    description: appData.description || '',
    active: appData.active || true,
    groups: []
  };
  
  mockData.apps.push(newApp);
  return deepClone(newApp);
};

export const updateApp = async (id: string, appData: Partial<App>): Promise<App | undefined> => {
  await delay();
  const appIndex = mockData.apps.findIndex(a => a.id === id);
  
  if (appIndex === -1) return undefined;
  
  const updatedApp = {
    ...mockData.apps[appIndex],
    ...appData,
    id: mockData.apps[appIndex].id, // Preserve ID
    uuid: mockData.apps[appIndex].uuid, // Preserve UUID
  };
  
  mockData.apps[appIndex] = updatedApp;
  return deepClone(updatedApp);
};

export const deleteApp = async (id: string): Promise<boolean> => {
  await delay();
  const appIndex = mockData.apps.findIndex(a => a.id === id);
  
  if (appIndex === -1) return false;
  
  mockData.apps.splice(appIndex, 1);
  return true;
};
