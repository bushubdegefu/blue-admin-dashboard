
import { User, Group, Scope, Resource, App } from "@/types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    date_registered: "2022-01-15T10:30:00Z",
    active: true
  },
  {
    id: "2",
    uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    date_registered: "2022-02-20T14:45:00Z",
    active: true
  },
  {
    id: "3",
    uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    email: "mark.johnson@example.com",
    first_name: "Mark",
    last_name: "Johnson",
    date_registered: "2022-03-10T09:15:00Z",
    active: false
  },
  {
    id: "4",
    uuid: "d4e5f6a7-b8c9-0123-defg-234567890123",
    email: "sarah.wilson@example.com",
    first_name: "Sarah",
    last_name: "Wilson",
    date_registered: "2022-04-05T11:20:00Z",
    active: true
  },
  {
    id: "5",
    uuid: "e5f6a7b8-c9d0-1234-efgh-345678901234",
    email: "robert.brown@example.com",
    first_name: "Robert",
    last_name: "Brown",
    date_registered: "2022-05-18T16:30:00Z",
    active: true
  }
];

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: "1",
    uuid: "f6a7b8c9-d0e1-2345-fghi-456789012345",
    name: "Administrators",
    description: "System administrators with full access",
    active: true
  },
  {
    id: "2",
    uuid: "g7b8c9d0-e1f2-3456-ghij-567890123456",
    name: "Managers",
    description: "Company managers with elevated permissions",
    active: true
  },
  {
    id: "3",
    uuid: "h8c9d0e1-f2g3-4567-hijk-678901234567",
    name: "Users",
    description: "Standard system users",
    active: true
  }
];

// Mock Scopes
export const mockScopes: Scope[] = [
  {
    id: "1",
    uuid: "i9d0e1f2-g3h4-5678-ijkl-789012345678",
    name: "user:read",
    description: "Read user data",
    active: true
  },
  {
    id: "2",
    uuid: "j0e1f2g3-h4i5-6789-jklm-890123456789",
    name: "user:write",
    description: "Create and update user data",
    active: true
  },
  {
    id: "3",
    uuid: "k1f2g3h4-i5j6-7890-klmn-901234567890",
    name: "admin:all",
    description: "All administrative functions",
    active: false
  }
];

// Mock Resources
export const mockResources: Resource[] = [
  {
    id: "1",
    uuid: "l2g3h4i5-j6k7-8901-lmno-012345678901",
    name: "Get User Details",
    route_path: "/api/v1/users/{id}",
    method: "GET",
    description: "Retrieve details for a specific user",
    active: true
  },
  {
    id: "2",
    uuid: "m3h4i5j6-k7l8-9012-mnop-123456789012",
    name: "Create User",
    route_path: "/api/v1/users",
    method: "POST",
    description: "Create a new user",
    active: true
  },
  {
    id: "3",
    uuid: "n4i5j6k7-l8m9-0123-nopq-234567890123",
    name: "Delete User",
    route_path: "/api/v1/users/{id}",
    method: "DELETE",
    description: "Delete a user",
    active: true
  }
];

// Mock Applications
export const mockApps: App[] = [
  {
    id: "1",
    uuid: "o5j6k7l8-m9n0-1234-opqr-345678901234",
    name: "Admin Portal",
    description: "Administrative interface for system management",
    active: true
  },
  {
    id: "2",
    uuid: "p6k7l8m9-n0o1-2345-pqrs-456789012345",
    name: "Customer Dashboard",
    description: "User-facing dashboard for customers",
    active: true
  }
];

// Relationships
mockUsers[0].groups = [mockGroups[0]];
mockUsers[1].groups = [mockGroups[1]];
mockUsers[2].groups = [mockGroups[2]];

mockUsers[0].scopes = [mockScopes[0], mockScopes[1], mockScopes[2]];
mockUsers[1].scopes = [mockScopes[0], mockScopes[1]];

mockGroups[0].users = [mockUsers[0]];
mockGroups[1].users = [mockUsers[1]];
mockGroups[2].users = [mockUsers[2]];

mockGroups[0].scopes = [mockScopes[0], mockScopes[1], mockScopes[2]];
mockGroups[1].scopes = [mockScopes[0], mockScopes[1]];

mockScopes[0].resources = [mockResources[0]];
mockScopes[1].resources = [mockResources[1], mockResources[2]];
