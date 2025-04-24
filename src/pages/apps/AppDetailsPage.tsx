
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appService } from "@/api/appService";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { InlineEditFormWrapper } from "@/components/common/InlineEditFormWrapper";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import GenericFilterCard from "@/components/common/GenricFilterCard";
import GenericPagination from "@/components/common/Pagination";

const AppDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const {
    data: app,
    isLoading,
    error
  } = useQuery({
    queryKey: ['app', id],
    queryFn: () => appService.getAppById(id as string),
  });

  const updateAppMutation = useMutation({
    mutationFn: (data: any) => appService.updateApp({ appId: id, appData: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app', id] });
      toast.success("App updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update app: ${error.message}`);
    }
  });

  const deleteAppMutation = useMutation({
    mutationFn: () => appService.deleteApp(id as string),
    onSuccess: () => {
      toast.success("App deleted successfully");
      navigate("/apps");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete app: ${error.message}`);
    }
  });

  const handleUpdateField = async (field: string, value: any) => {
    const updateData = { [field]: value };
    await updateAppMutation.mutate(updateData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading app details</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={app.data.name}
        description="View and manage app details"
      >
        <Button
          variant="destructive"
          onClick={() => setConfirmDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete App
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b">
          <TabsTrigger value="overview" className="px-6">Overview</TabsTrigger>
          <TabsTrigger value="groups" className="px-6">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InlineEditFormWrapper
              label="Name"
              value={app.data.name}
              fieldName="name"
              onSave={(value) => handleUpdateField("name", value)}
              type="text"
              className="md:col-span-2"
            />
            
            <InlineEditFormWrapper
              label="Description"
              value={app.data.description || ""}
              fieldName="description"
              onSave={(value) => handleUpdateField("description", value)}
              type="textarea"
              className="md:col-span-2"
            />

            <InlineEditFormWrapper
              label="Status"
              value={app.data.active}
              fieldName="active"
              onSave={(value) => handleUpdateField("active", value)}
              type="boolean"
            />
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 pt-4">
          <RelatedItemsCard
            title="Assigned Groups"
            description="Groups that have access to this app"
            queryKey={['appGroups', id]}
            queryFn={() => appService.getAppGroup({ appId: id })}
            complementQueryFn={() => appService.getAvailableGroupsForApp(id as string)}
            addItemFn={(groupId) => appService.addGroupApp({ groupId, appId: id })}
            removeItemFn={(groupId) => appService.deleteGroupApp({ groupId, appId: id })}
            nameField="name"
            itemType="group"
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete App"
        description={`Are you sure you want to delete the app "${app.data.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteAppMutation.mutate()}
        variant="destructive"
        isLoading={deleteAppMutation.isPending}
      />
    </div>
  );
};

export default AppDetailsPage;
