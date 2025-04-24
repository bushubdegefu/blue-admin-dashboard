import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define form schema with Zod
const resourceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  route_path: z.string().optional(),
  method: z.enum(["GET", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD"], {
    required_error: "Method is required",
    invalid_type_error: "Invalid HTTP method",
  }),
});

export interface ResourceFormProps {
  resource?: any;
  onSave: (resourceData: any) => Promise<void>;
  isLoading?: boolean;
}

export function ResourceForm({ 
  resource, 
  onSave, 
  isLoading = false 
}: ResourceFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null);

  // Set up form with defaultValues
  const form = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: resource?.name || "",
      description: resource?.description || "",
      route_path: resource?.url_pattern || "",
      method: resource?.enabled || "GET", // Default to true if not specified
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
                    <Input 
                      placeholder="Enter resource name" 
                      {...field} 
                      className="font-medium"
                    />
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
                      className="resize-none min-h-[100px]"
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
                  <FormLabel>URL Path (Pattern)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter URL pattern (e.g., /api/resources/*)"
                      {...field}
                      className="font-mono text-sm"
                      value={field.value || ""}
                    />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="font-mono">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["GET", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD"].map((method) => (
                        <SelectItem key={method} value={method} className="font-mono">
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the HTTP method for the resource.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {saveError && (
              <div className="text-red-500 text-sm mt-2">{saveError}</div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-gray-50/50 px-6 py-4">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : resource ? "Update Resource" : "Create Resource"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default ResourceForm;
