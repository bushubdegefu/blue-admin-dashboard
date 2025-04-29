
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scope } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const scopeFormSchema = z.object({
  name: z.string().min(1, "Scope name is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type ScopeFormValues = z.infer<typeof scopeFormSchema>;

interface ScopeFormProps {
  scope?: Scope;
  onSave: (values: ScopeFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ScopeForm({ 
  scope, 
  onSave, 
  isLoading = false 
}: ScopeFormProps) {
  const form = useForm<ScopeFormValues>({
    resolver: zodResolver(scopeFormSchema),
    defaultValues: {
      name: scope?.name || "",
      description: scope?.description || "",
      active: scope?.active ?? true,
    },
  });

  const handleSubmit = async (values: ScopeFormValues) => {
    try {
      await onSave(values);
      if (!scope) {
        form.reset();
      }
      toast.success(scope ? "Scope updated successfully" : "Scope created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save scope");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {scope?.id && (
          <div className="w-full">
            <div className="p-4 border rounded-md bg-gray-50">
              <div className="text-sm font-medium">User ID</div>
              <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
                {scope?.id}
              </div>
            </div>           
          </div>
          )}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scope Name</FormLabel>
                <FormControl>
                  <Input placeholder="user:read" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the purpose of this scope" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {field.value
                      ? "This scope is active"
                      : "This scope is inactive and cannot be used"}
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button className="shadow-xl" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : scope ? "Update Scope" : "Create Scope"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
