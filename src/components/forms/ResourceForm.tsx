
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Define form schema with Zod
const resourceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url_pattern: z.string().optional(),
  enabled: z.boolean().default(true),
});

export interface ResourceFormProps {
  resource?: any;
  onSave: (resourceData: any) => Promise<void>;
  isLoading?: boolean;
}

const ResourceForm = ({ resource, onSave, isLoading = false }: ResourceFormProps) => {
  const [saveError, setSaveError] = useState<string | null>(null);

  // Set up form with defaultValues
  const form = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: resource?.name || "",
      description: resource?.description || "",
      url_pattern: resource?.url_pattern || "",
      enabled: resource?.enabled !== false, // Default to true if not specified
    },
  });

  // Define submit handler
  const handleSubmit = async (values: z.infer<typeof resourceFormSchema>) => {
    try {
      setSaveError(null);
      await onSave({
        ...values,
        id: resource?.id,
      });
    } catch (error: any) {
      setSaveError(error.message || "Failed to save resource");
      console.error("Error saving resource:", error);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4 pt-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resource name" {...field} />
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
                      placeholder="Enter resource description"
                      className="resize-none"
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
              name="url_pattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Pattern</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter URL pattern (e.g., /api/resources/*)"
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
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enabled</FormLabel>
                    <p className="text-sm text-gray-500">
                      If enabled, this resource can be accessed by users with appropriate permissions.
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {saveError && (
              <div className="text-red-500 text-sm mt-2">{saveError}</div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Resource"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ResourceForm;
