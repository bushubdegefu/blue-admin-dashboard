
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appService } from "@/api/appService";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { InlineEditFormWrapper } from "@/components/common/InlineEditFormWrapper";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import GenericFilterCard from "@/components/common/GenricFilterCard";
import GenericPagination from "@/components/common/Pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusBadge from "@/components/common/StatusBadge";
import { EntitySelector } from "@/components/common/EntitySelector";
import { AppForm } from "@/components/forms/AppForm";

const AppDetailsPage = () => {
  const { id :appId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [groupPage, setGroupPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: app,
    isLoading,
    error
  } = useQuery({
    queryKey: ['app', appId],
    queryFn: () => appService.getAppById(appId as string),
  });


  // Fetch scopes users
  const { data: appGroups, isLoading: isAppGroupsLoading } = useQuery({
    queryKey: ["app_groups", appId,groupPage, pageSize],
    queryFn: () => appService.getAppGroup({appId, page: groupPage, size: pageSize}),
  
  }); 
  
  // Fetch scopes attached users
  const { data: appAttachedGroups, isLoading: isAppAttachedGroupsLoading } = useQuery({
    queryKey: ["app_attached_groups", appId],
    queryFn: () => appService.getAttachedGroupsForApp(appId || ""),
  
  });

  // Fetch scopes resources paginated
  const { data: appAvailableGroups, isLoading: isAppAvailableGroupsLoading } = useQuery({
    queryKey: ["app_available_groups", appId],
    queryFn: () => appService.getAvailableGroupsForApp(appId || ""),
  
  });


  const updateAppMutation = useMutation({
    mutationFn: (data: any) => appService.updateApp({ appId, appData: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app', appId] });
      toast.success("App updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update app: ${error.message}`);
    }
  });

  const deleteAppMutation = useMutation({
    mutationFn: () => appService.deleteApp(appId as string),
    onSuccess: () => {
      toast.success("App deleted successfully");
      navigate("/apps");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete app: ${error.message}`);
    }
  });

  // Mutations for adding and removing groups
const addGroupMutation = useMutation({
  mutationFn: (groupId: string) =>
    appService.addGroupApp({ appId: appId, groupId }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["app_groups", appId] });
    queryClient.invalidateQueries({
      queryKey: ["app_attached_groups", appId],
    });
    queryClient.invalidateQueries({
      queryKey: ["app_available_groups", appId],
    });
    toast.success("Group added to app");
  },
  onError: (error: any) => {
    toast.error(`Failed to add Group: ${error.message}`);
  },
});

const removeGroupMutation = useMutation({
  mutationFn: (groupId: string) =>
    appService.deleteGroupApp({ appId: appId, groupId }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["app_groups", appId] });
    queryClient.invalidateQueries({
      queryKey: ["app_attached_groups", appId],
    });
    queryClient.invalidateQueries({
      queryKey: ["app_available_groups", appId],
    });
    toast.success("Group removed from app");
  },
  onError: (error: any) => {
    toast.error(`Failed to remove group: ${error.message}`);
  },
});


  const handleUpdateApp = async (formData: any) => {
    
    updateAppMutation.mutate(formData);
  };

  const handleAddGroup= (groupId: string) => {
    addGroupMutation.mutate(groupId);
  };

  const handleRemoveGroup = (groupId: string) => {
    removeGroupMutation.mutate(groupId);
  };


  const groupColumns = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (info: any) => (
        <div>
          <div className="font-medium">{info.getValue() as string}</div>
          <div className="text-xs text-gray-500">
            ID: {info.row.original.id}
          </div>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: (info: any) => (
        <div className="max-w-xs truncate">
          {(info.getValue() as string) || (
            <span className="text-gray-400 text-xs">No description</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "active",
      cell: (info: any) => <StatusBadge active={info.getValue() as boolean} />,
    },
    
  ];

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
            <AppForm
              app={app?.data}// Pass an empty array or the appropriate apps data
              onSave={handleUpdateApp}
              isLoading={updateAppMutation.isPending}     
            />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 pt-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Groups in this App</CardTitle>
                <CardDescription>
                  Manage Groups associated with this App
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsAddGroupDialogOpen(true)}
                className="ml-auto"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={groupColumns}
                data={appGroups?.data || []}
                isLoading={isAppGroupsLoading}
                searchPlaceholder="Search app groups..."
              />
              <GenericPagination
                totalItems={appGroups?.total || 0}
                pageSize={pageSize}
                currentPage={groupPage}
                queryKey="app_group"
                onPageChange={setGroupPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

       {/* Groups dialog box */}
        <Dialog
        open={isAddGroupDialogOpen}
        onOpenChange={setIsAddGroupDialogOpen}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Group to Scope</DialogTitle>
          </DialogHeader>
          <EntitySelector
            title="Add Group"
            description="Choose which groups to add to this app"
            availableItems={appAvailableGroups?.data || []}
            selectedItems={appAttachedGroups?.data || []}
            isLoading={isAppAvailableGroupsLoading}
            onSelect={(group) => handleAddGroup(group.id)}
            onRemove={(group) => handleRemoveGroup(group.id)}
            emptyMessage="No more resources available to add"
          />
        </DialogContent>
      </Dialog>

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
