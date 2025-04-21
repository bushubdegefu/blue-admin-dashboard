
export interface LoginCredentials {
  email: string;
  password: string;
  grant_type: string;
  token: string;
}

export interface User {
  id: string;
  uuid: string;
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_registered?: string;
  active: boolean;
  groups?: Group[];
  scopes?: Scope[];
}

export interface Group {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  active: boolean;
  app?: App;
  users?: User[];
  scopes?: Scope[];
}

export interface Scope {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  active: boolean;
  groups?: Group[];
  users?: User[];
  resources?: Resource[];
}

export interface Resource {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  route_path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  active: boolean;
  scopes?: Scope[];
}

export interface App {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  groups?: Group[];
  roles?: Role[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface TableColumn {
  id: string;
  header: string;
  accessorKey?: string;
  cell?: (args: any) => React.ReactNode;
}

export interface FilterOption {
  field: string;
  label: string;
  type: 'select' | 'boolean' | 'text';
  options?: Array<{
    value: string;
    label: string;
  }>;
}

export interface ErrorInfo {
  componentStack: string;
}

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export interface GroupFormProps {
  group?: Group;
  onSave: (values: any) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export interface ScopeFormProps {
  scope?: Scope;
  onSave: (values: any) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export interface ResourceFormProps {
  resource?: Resource;
  onSave: (values: any) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  scopes?: Scope[];
}
