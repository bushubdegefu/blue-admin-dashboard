
import { App } from "@/types";

export interface GroupFormProps {
  apps: App[];
  onSave: (data: any) => Promise<void> | void;
  isLoading: boolean;
  defaultValues?: any;
}
