
export interface User {
  id: string | number;
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
  last_login?: string;
  groups?: Group[];
  scopes?: Scope[];
}

export interface Group {
  id: string | number;
  name: string;
  description: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  users?: User[];
  scopes?: Scope[];
  app_id?: string | number;
  app?: App;
}

export interface Scope {
  id: string | number;
  name: string;
  description: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  resources?: Resource[];
  groups?: Group[];
  users?: User[];
}

export interface Resource {
  id: string | number;
  name: string;
  route_path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  created_at?: string;
  updated_at?: string;
  scope_id?: string | number;
  scope?: Scope;
}

export interface App {
  id: string | number;
  uuid?: string;
  name: string;
  description: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  groups?: Group[];
}

export interface TableColumn<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (info: any) => JSX.Element | string | null | undefined;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

export interface FilterOption {
  field: string;
  label: string;
  type: 'text' | 'boolean' | 'select' | 'date';
  options?: { label: string; value: string | boolean }[];
}

// Response types based on the API definitions
export interface ResponseHTTP<T = any> {
  data: T;
  details: string;
  success: boolean;
}

export interface ResponsePagination<T = any> extends ResponseHTTP<T> {
  page: number;
  pages: number;
  size: number;
  total: number;
}

export interface DBStats {
  total_apps: number;
  total_groups: number;
  total_jwtsalts: number;
  total_resources: number;
  total_scopes: number;
  total_users: number;
}
