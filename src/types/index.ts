export interface User {
  id: string;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  disabled: boolean;
  date_registered: string;
  created_at: string;
  updated_at: string;
  groups: Group[];
  scopes: Scope[];
}

export interface Group {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  active: boolean;
  app?: App;
  users?: User[];
}

export interface Scope {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  active: boolean;
  resources?: Resource[];
  groups?: Group[];
  users?: User[];
}

export interface Resource {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  active: boolean;
  scopes?: Scope[];
}

export interface App {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  active: boolean;
  groups?: Group[];
}

export interface TableColumn<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (info: any) => React.ReactNode;
  enableSorting?: boolean;
}

export interface FilterOption {
  field: string;
  label: string;
  type: "text" | "select";
  options?: { label: string; value: string }[];
}

export interface Pagination {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// Add LoginCredentials type
export interface LoginCredentials {
  email: string;
  password: string;
  grant_type?: string;
  token_type?: string;
}
