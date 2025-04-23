
import { Scope } from "@/types";

export interface ScopeFormProps {
  scope?: Scope;
  onSave: (values: any) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}
