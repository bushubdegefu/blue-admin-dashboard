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
  last_login?: string;
  groups?: Group[];
  scopes?: Scope[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  users?: User[];
  scopes?: Scope[];
  app_id?: string;
  app?: App;
}

export interface Scope {
  id: string;
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
  id: string;
  name: string;
  route_path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  created_at?: string;
  updated_at?: string;
  scope_id?: string;
  scope?: Scope;
}

export interface App {
  id: string;
  uuid?: string;
  name: string;
  description: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  groups?: Group[];
}

export interface RelatedItem {
  id: string;
  name: string;
  description: string;
  link?: string;
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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    refresh_token: string;
    user: User;
  };
  details: string;
  success: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

export namespace ApiModels {
  export interface UserGet {
    id: number;
    uuid: string;
    username: string;
    email: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    disabled: boolean;
    date_registered: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
  }
  
  export interface UserPost {
    username: string;
    email: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    disabled?: boolean;
    date_registered?: string;
  }
  
  export interface UserPatch {
    username?: string;
    email?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    disabled?: boolean;
    date_registered?: string;
  }

  export interface AppGet {
    id: number;
    uuid: string;
    name: string;
    description: string;
    active: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface AppPost {
    name: string;
    description: string;
  }

  export interface AppPatch {
    name?: string;
    description?: string;
    active?: boolean;
  }

  export interface GroupGet {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  }

  export interface GroupPost {
    name: string;
    description: string;
  }

  export interface GroupPatch {
    name?: string;
    description?: string;
  }

  export interface ScopeGet {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  }

  export interface ScopePost {
    name: string;
    description: string;
  }

  export interface ScopePatch {
    name?: string;
    description?: string;
  }

  export interface ResourceGet {
    id: number;
    name: string;
    route_path: string;
    method: string;
    description: string;
    created_at: string;
    updated_at: string;
  }

  export interface ResourcePost {
    name: string;
    route_path: string;
    method: string;
    description: string;
  }

  export interface ResourcePatch {
    name?: string;
    route_path?: string;
    method?: string;
    description?: string;
  }
}
