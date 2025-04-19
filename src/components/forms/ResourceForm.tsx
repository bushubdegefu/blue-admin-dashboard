
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resource } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const resourceFormSchema = z.object({
  name: z.string().min(1, "Resource name is required"),
  description: z.string().optional(),
  route_path: z.string().min(1, "Route path is required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  active: z.boolean().default(true),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

interface ResourceFormProps {
  resource?: Resource;
  onSave?: (values: ResourceFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function ResourceForm({ 
  resource, 
  onSave, 
  isLoading = false,
  onCancel
}: ResourceFormProps) {
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: resource?.name || "",
      description: resource?.description || "",
      route_path: resource?.route_path || "",
      method: resource?.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE" || "GET",
      active: resource?.active ?? true,
    },
  });

  const handleSubmit = async (values: ResourceFormValues) => {
    try {
      if (onSave) {
        await onSave(values);
      }
      if (!resource) {
        form.reset();
      }
      toast.success(resource ? "Resource updated successfully" : "Resource created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save resource");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Name</FormLabel>
                <FormControl>
                  <Input placeholder="Get User" {...field} />
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
                    placeholder="Describe what this resource does" 
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
            name="route_path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route Path</FormLabel>
                <FormControl>
                  <Input placeholder="/api/v1/users" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HTTP Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select HTTP Method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
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
                      ? "This resource is active and available"
                      : "This resource is inactive and unavailable"}
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

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : resource ? "Update Resource" : "Create Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
