
import { User, Group, Scope, Resource, App } from "../types";
import { generateUUID } from "../lib/utils";

// Mock Resources
const resourcesMock: Resource[] = [
  {
    id: "r1",
    name: "User List",
    route_path: "/api/users",
    method: "GET",
    description: "Get list of all users",
    scope_id: "s1",
  },
  {
    id: "r2",
    name: "User Details",
    route_path: "/api/users/:id",
    method: "GET",
    description: "Get user by ID",
    scope_id: "s1",
  },
  {
    id: "r3",
    name: "Create User",
    route_path: "/api/users",
    method: "POST",
    description: "Create a new user",
    scope_id: "s2",
  },
  {
    id: "r4",
    name: "Update User",
    route_path: "/api/users/:id",
    method: "PUT",
    description: "Update existing user",
    scope_id: "s2",
  },
  {
    id: "r5",
    name: "Group List",
    route_path: "/api/groups",
    method: "GET",
    description: "Get all groups",
    scope_id: "s3",
  },
  {
    id: "r6",
    name: "App Management",
    route_path: "/api/apps",
    method: "GET",
    description: "Manage applications",
    scope_id: "s4",
  },
];

// Mock Scopes
const scopesMock: Scope[] = [
  {
    id: "s1",
    name: "user:read",
    description: "Read user information",
    active: true,
    resources: [],
    groups: [],
    users: [],
  },
  {
    id: "s2",
    name: "user:write",
    description: "Create or update user information",
    active: true,
    resources: [],
    groups: [],
    users: [],
  },
  {
    id: "s3",
    name: "group:read",
    description: "Read group information",
    active: true,
    resources: [],
    groups: [],
    users: [],
  },
  {
    id: "s4",
    name: "app:admin",
    description: "Administer applications",
    active: true,
    resources: [],
    groups: [],
    users: [],
  },
  {
    id: "s5",
    name: "system:admin",
    description: "Full system administration",
    active: true,
    resources: [],
    groups: [],
    users: [],
  },
];

// Mock Apps
const appsMock: App[] = [
  {
    id: "a1",
    uuid: generateUUID(),
    name: "Admin Portal",
    description: "Administrative portal for system management",
    active: true,
    groups: [],
  },
  {
    id: "a2",
    uuid: generateUUID(),
    name: "Customer Dashboard",
    description: "Customer-facing dashboard application",
    active: true,
    groups: [],
  },
  {
    id: "a3",
    uuid: generateUUID(),
    name: "API Gateway",
    description: "API access management",
    active: true,
    groups: [],
  },
  {
    id: "a4",
    uuid: generateUUID(),
    name: "Analytics Platform",
    description: "Data analytics and reporting",
    active: false,
    groups: [],
  },
];

// Mock Groups
const groupsMock: Group[] = [
  {
    id: "g1",
    name: "Administrators",
    description: "System administrators with full access",
    active: true,
    users: [],
    scopes: [],
    app_id: "a1",
  },
  {
    id: "g2",
    name: "User Managers",
    description: "Can manage user accounts",
    active: true,
    users: [],
    scopes: [],
    app_id: "a1",
  },
  {
    id: "g3",
    name: "Readers",
    description: "Read-only access to the system",
    active: true,
    users: [],
    scopes: [],
    app_id: "a2",
  },
  {
    id: "g4",
    name: "API Users",
    description: "External API access",
    active: true,
    users: [],
    scopes: [],
    app_id: "a3",
  },
  {
    id: "g5",
    name: "Reporting",
    description: "Access to reporting features",
    active: false,
    users: [],
    scopes: [],
    app_id: "a4",
  },
];

// Mock Users
const usersMock: User[] = [
  {
    id: "u1",
    uuid: generateUUID(),
    username: "johndoe",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    disabled: false,
    date_registered: new Date("2023-01-15").toISOString(),
    groups: [],
    scopes: [],
  },
  {
    id: "u2",
    uuid: generateUUID(),
    username: "janedoe",
    email: "jane.doe@example.com",
    first_name: "Jane",
    middle_name: "Marie",
    last_name: "Doe",
    disabled: false,
    date_registered: new Date("2023-02-10").toISOString(),
    groups: [],
    scopes: [],
  },
  {
    id: "u3",
    uuid: generateUUID(),
    username: "bobsmith",
    email: "bob.smith@example.com",
    first_name: "Bob",
    last_name: "Smith",
    disabled: true,
    date_registered: new Date("2023-03-05").toISOString(),
    groups: [],
    scopes: [],
  },
  {
    id: "u4",
    uuid: generateUUID(),
    username: "alicejones",
    email: "alice.jones@example.com",
    first_name: "Alice",
    last_name: "Jones",
    disabled: false,
    date_registered: new Date("2023-04-20").toISOString(),
    groups: [],
    scopes: [],
  },
  {
    id: "u5",
    uuid: generateUUID(),
    username: "mikebrown",
    email: "mike.brown@example.com",
    first_name: "Michael",
    middle_name: "James",
    last_name: "Brown",
    disabled: false,
    date_registered: new Date("2023-05-12").toISOString(),
    groups: [],
    scopes: [],
  },
];

// Set up relationships
// Scopes -> Resources
scopesMock.forEach((scope) => {
  scope.resources = resourcesMock.filter((r) => r.scope_id === scope.id);
});

// Connect users to groups
groupsMock[0].users = [usersMock[0], usersMock[4]]; // Admins: John and Mike
groupsMock[1].users = [usersMock[1], usersMock[3]]; // User Managers: Jane and Alice
groupsMock[2].users = [usersMock[2], usersMock[3]]; // Readers: Bob and Alice
groupsMock[3].users = [usersMock[0], usersMock[4]]; // API Users: John and Mike
groupsMock[4].users = [usersMock[1]]; // Reporting: Jane

// Connect users to their groups
usersMock.forEach((user) => {
  user.groups = groupsMock.filter((group) => 
    group.users.some((u) => u.id === user.id)
  );
});

// Connect groups to scopes
groupsMock[0].scopes = [scopesMock[0], scopesMock[1], scopesMock[2], scopesMock[3], scopesMock[4]]; // Admins: all scopes
groupsMock[1].scopes = [scopesMock[0], scopesMock[1]]; // User Managers: user:read, user:write
groupsMock[2].scopes = [scopesMock[0], scopesMock[2]]; // Readers: user:read, group:read
groupsMock[3].scopes = [scopesMock[3]]; // API Users: app:admin
groupsMock[4].scopes = [scopesMock[0]]; // Reporting: user:read

// Connect scopes to groups
scopesMock.forEach((scope) => {
  scope.groups = groupsMock.filter((group) => 
    group.scopes.some((s) => s.id === scope.id)
  );
});

// Connect users to scopes (through their groups)
usersMock.forEach((user) => {
  const userScopesSet = new Set<string>();
  user.groups.forEach((group) => {
    group.scopes.forEach((scope) => userScopesSet.add(scope.id));
  });
  user.scopes = scopesMock.filter((scope) => userScopesSet.has(scope.id));
});

// Connect scopes to users
scopesMock.forEach((scope) => {
  scope.users = usersMock.filter((user) => 
    user.scopes.some((s) => s.id === scope.id)
  );
});

// Connect apps to groups
appsMock.forEach((app) => {
  app.groups = groupsMock.filter((group) => group.app_id === app.id);
});

// Connect groups to apps
groupsMock.forEach((group) => {
  if (group.app_id) {
    group.app = appsMock.find((app) => app.id === group.app_id);
  }
});

export const mockData = {
  users: usersMock,
  groups: groupsMock,
  scopes: scopesMock,
  resources: resourcesMock,
  apps: appsMock,
};
