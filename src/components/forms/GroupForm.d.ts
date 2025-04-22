
export interface GroupFormProps {
  group?: any;
  onSave: (formData: any) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void; // Make onCancel optional
}
