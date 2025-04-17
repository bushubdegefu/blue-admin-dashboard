
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
  groups: Group[];
  scopes: Scope[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  active: boolean;
  users: User[];
  scopes: Scope[];
  app_id?: string;
  app?: App;
}

export interface Scope {
  id: string;
  name: string;
  description: string;
  active: boolean;
  resources: Resource[];
  groups: Group[];
  users: User[];
}

export interface Resource {
  id: string;
  name: string;
  route_path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  scope_id?: string;
  scope?: Scope;
}

export interface App {
  id: string;
  uuid: string;
  name: string;
  description: string;
  active: boolean;
  groups: Group[];
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
