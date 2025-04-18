
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Group, App } from "@/types";
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

const groupFormSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  app_id: z.string().optional(),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

interface GroupFormProps {
  group?: Group;
  apps: App[];
  onSave: (values: GroupFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function GroupForm({ 
  group, 
  apps, 
  onSave, 
  isLoading = false 
}: GroupFormProps) {
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
     },
  });

  const handleSubmit = async (values: GroupFormValues) => {
    try {
      await onSave(values);
      if (!group) {
        form.reset();
      }
      toast.success(group ? "Group updated successfully" : "Group created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save group");
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
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="Administrators" {...field} />
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
                    placeholder="Describe the purpose of this group" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : group ? "Update Group" : "Create Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
