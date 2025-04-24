
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { App } from "@/types";
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

const appFormSchema = z.object({
  name: z.string().min(1, "App name is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type AppFormValues = z.infer<typeof appFormSchema>;

interface AppFormProps {
  app?: App;
  onSave: (values: AppFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function AppForm({ 
  app, 
  onSave, 
  isLoading = false 
}: AppFormProps) {
  const form = useForm<AppFormValues>({
    resolver: zodResolver(appFormSchema),
    defaultValues: {
      name: app?.name || "",
      description: app?.description || "",
      active: app?.active ?? true,
    },
  });

  const handleSubmit = async (values: AppFormValues) => {
    try {
      await onSave(values);
      if (!app) {
        form.reset();
      }
      toast.success(app ? "App updated successfully" : "App created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save app");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {app?.id && (
          <div className="w-full">
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="text-sm font-medium">App ID</div>
            <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
              {app?.id}
            </div>
          </div>           
        </div>
        )}
        {app?.uuid && (
          <div className="w-full">
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="text-sm font-medium">APP UUID</div>
            <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
              {app?.uuid}
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
                <FormLabel>App Name</FormLabel>
                <FormControl>
                  <Input placeholder="Admin Portal" {...field} />
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
                    placeholder="Describe the purpose of this application" 
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
                      ? "This app is active and available"
                      : "This app is inactive and unavailable"}
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : app ? "Update App" : "Create App"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
