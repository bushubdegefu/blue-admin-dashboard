
export interface ScopeFormProps {
  onSave: (data: any) => Promise<void> | void;
  isLoading: boolean;
  defaultValues?: any;
}
