import { User, Group, Scope, Resource, App } from "@/types";

export const users: User[] = [
  {
    id: "1",
    uuid: "abc123-uuid-1",
    username: "john.doe",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    disabled: false,
    date_registered: "2023-01-15T10:00:00Z",
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2023-05-20T15:30:00Z",
    groups: [],
    scopes: [],
  },
  {
    id: "2",
    uuid: "abc123-uuid-2",
    username: "jane.smith",
    email: "jane.smith@example.com",
    first_name: "Jane",
    middle_name: "Marie",
    last_name: "Smith",
    disabled: false,
    date_registered: "2023-02-10T11:30:00Z",
    created_at: "2023-02-10T11:30:00Z",
    updated_at: "2023-06-15T09:45:00Z",
    groups: [],
    scopes: [],
  },
  {
    id: "3",
    uuid: "abc123-uuid-3",
    username: "mark.johnson",
    email: "mark.johnson@example.com",
    first_name: "Mark",
    last_name: "Johnson",
    disabled: true,
    date_registered: "2023-03-05T09:15:00Z",
    created_at: "2023-03-05T09:15:00Z",
    updated_at: "2023-07-20T14:20:00Z",
    groups: [],
    scopes: [],
  },
  {
    id: "4",
    uuid: "abc123-uuid-4",
    username: "sarah.williams",
    email: "sarah.williams@example.com",
    first_name: "Sarah",
    last_name: "Williams",
    disabled: false,
    date_registered: "2023-04-12T14:45:00Z",
    created_at: "2023-04-12T14:45:00Z",
    updated_at: "2023-08-10T10:10:00Z",
    groups: [],
    scopes: [],
  },
  {
    id: "5",
    uuid: "abc123-uuid-5",
    username: "david.brown",
    email: "david.brown@example.com",
    first_name: "David",
    middle_name: "Robert",
    last_name: "Brown",
    disabled: false,
    date_registered: "2023-05-20T16:30:00Z",
    created_at: "2023-05-20T16:30:00Z",
    updated_at: "2023-09-05T11:25:00Z",
    groups: [],
    scopes: [],
  }
];

export const groups: Group[] = [
  {
    id: "101",
    name: "Administrators",
    description: "Full access to the system",
    active: true,
  },
  {
    id: "102",
    name: "Editors",
    description: "Can create and edit content",
    active: true,
  },
  {
    id: "103",
    name: "Viewers",
    description: "Read-only access",
    active: true,
  },
];

export const scopes: Scope[] = [
  {
    id: "201",
    name: "read:content",
    description: "Allows reading content",
    active: true,
  },
  {
    id: "202",
    name: "edit:content",
    description: "Allows editing content",
    active: true,
  },
  {
    id: "203",
    name: "delete:content",
    description: "Allows deleting content",
    active: false,
  },
];

export const resources: Resource[] = [
  {
    id: "301",
    name: "Get Content",
    route_path: "/content/{id}",
    method: "GET",
    description: "Retrieves content by ID",
  },
  {
    id: "302",
    name: "Update Content",
    route_path: "/content/{id}",
    method: "PUT",
    description: "Updates content by ID",
  },
  {
    id: "303",
    name: "Delete Content",
    route_path: "/content/{id}",
    method: "DELETE",
    description: "Deletes content by ID",
  },
];

export const apps: App[] = [
  {
    id: "401",
    name: "Content Management System",
    description: "Manage website content",
    active: true,
  },
  {
    id: "402",
    name: "User Dashboard",
    description: "User account management",
    active: true,
  },
];
