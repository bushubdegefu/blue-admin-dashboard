
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appService } from "@/api/appService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import GenericPagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntitySelector } from "@/components/common/EntitySelector";

const AppDetailsPage = () => {
  const { id: appId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddGroupDialogOpen,setIsAddGroupDialogOpen] = useState(false)
  const [groupPage, setGroupPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  // Fetch app details
  const { data: app, isLoading: isAppLoading, error: appError } = useQuery({
    queryKey: ["app", appId],
    queryFn: () => appService.getAppById(appId || ""),
    enabled: !!appId,
  });

  // Fetch attached groups for app paginated
  const { data: appGroups, isLoading: isAppGroupsLoading } = useQuery({
    queryKey: ["app-groups", appId],
    queryFn: () => appService.getAppGroup({appId : appId || "", page: groupPage, size: pageSize}),
    
  });
  
  // Fetch attached groups for app
  const { data: attachedGroups, isLoading: isAttachedGroupsLoading } = useQuery({
    queryKey: ["attached-groups", appId],
    queryFn: () => appService.getAttachedGroupsForApp(appId || ""),
  });

  // Fetch available groups for app
  const { data: availableGroups, isLoading: isAvailableGroupsLoading } = useQuery({
    queryKey: ["available-groups", appId],
    queryFn: () => appService.getAvailableGroupsForApp(appId || ""),
  });

  // Mutations for adding and removing groups
  const addGroupMutation = useMutation({
    mutationFn: (groupId: string) => 
      appService.addGroupApp({ groupId, appId: appId || "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-groups", appId] });
      queryClient.invalidateQueries({ queryKey: ["attached-groups", appId] });
      queryClient.invalidateQueries({ queryKey: ["available-groups", appId] });
      toast.success("Group added to app");
    },
    onError: (error: any) => {
      toast.error(`Failed to add group: ${error.message}`);
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: (groupId: string) => 
      appService.deleteGroupApp({ groupId, appId: appId || "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-groups", appId] });
      queryClient.invalidateQueries({ queryKey: ["attached-groups", appId] });
      queryClient.invalidateQueries({ queryKey: ["available-groups", appId] });
      toast.success("Group removed from app");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove group: ${error.message}`);
    },
  });

  const handleAddGroup = (groupId: string) => {
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


  if (isAppLoading) {
    return <div className="p-6">Loading app details...</div>;
  }

  if (appError) {
    return <div className="p-6">Error: {(appError as Error).message}</div>;
  }

 

  return (
    <>
      <PageHeader title="App Details" description={app.description || "No description provided"}>
        <Button asChild>
          <Link to="/apps">Back to Apps</Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="w-full mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>View app details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">ID</div>
                    <div className="font-medium">{app?.data?.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{app?.data?.name}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="font-medium">{app?.data?.description || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Client ID</div>
                    <div className="font-medium">{app?.data?.UUID || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium">{app?.data?.active ? "Active" : "Inactive"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
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
                    Add Groups
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
                    queryKey="app-groups"
                    onPageChange={setGroupPage}
                    onPageSizeChange={setPageSize}
                  />
                </CardContent>
              </Card>
          {/* <RelatedItemsCard
            title={`Groups (${attachedGroups?.length || 0})`}
            availableItems={availableGroups || []}
            attachedItems={attachedGroups || []}
            entityType="Group"
            emptyMessage="No groups assigned to this app."
            onAddItems={handleAddGroup}
            onRemoveItem={handleRemoveGroup}
            canManage={true}
          /> */}
        </TabsContent>
      </Tabs>

      <Dialog
        open={isAddGroupDialogOpen}
        onOpenChange={setIsAddGroupDialogOpen}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Groups to App</DialogTitle>
          </DialogHeader>
          <EntitySelector
            title="Add Groups"
            description="Choose which group to add to this app"
            availableItems={availableGroups?.data || []}
            selectedItems={attachedGroups?.data || []}
            isLoading={isAvailableGroupsLoading}
            onSelect={(group) => handleAddGroup(group.id)}
            onRemove={(group) => handleRemoveGroup(group.id)}
            emptyMessage="No more groups available to add"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppDetailsPage;
