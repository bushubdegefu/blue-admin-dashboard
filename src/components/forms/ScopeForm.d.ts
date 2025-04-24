

export interface ScopeFormProps {
  scope?: any;
  onSave: (values: any) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}
