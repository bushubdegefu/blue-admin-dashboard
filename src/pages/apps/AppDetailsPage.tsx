
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

const AppDetailsPage = () => {
  const { id: appId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch app details
  const { data: app, isLoading: isAppLoading, error: appError } = useQuery({
    queryKey: ["app", appId],
    queryFn: () => appService.getAppById(appId || ""),
    enabled: !!appId,
  });

  // Fetch attached groups for app
  const { data: attachedGroups, isLoading: isAttachedGroupsLoading } = useQuery({
    queryKey: ["attached-groups", appId],
    queryFn: () => appService.getAttachedGroupsForApp(appId || ""),
    enabled: !!appId,
  });

  // Fetch available groups for app
  const { data: availableGroups, isLoading: isAvailableGroupsLoading } = useQuery({
    queryKey: ["available-groups", appId],
    queryFn: () => appService.getAvailableGroupsForApp(appId || ""),
    enabled: !!appId,
  });

  // Mutations for adding and removing groups
  const addGroupMutation = useMutation({
    mutationFn: (groupId: string) => 
      appService.addGroupApp({ groupId, appId: appId || "" }),
    onSuccess: () => {
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

  if (isAppLoading) {
    return <div className="p-6">Loading app details...</div>;
  }

  if (appError) {
    return <div className="p-6">Error: {(appError as Error).message}</div>;
  }

  if (!app) {
    return <div className="p-6">App not found</div>;
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
                    <div className="font-medium">{app.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{app.name}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="font-medium">{app.description || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Client ID</div>
                    <div className="font-medium">{app.clientId || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium">{app.active ? "Active" : "Inactive"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <RelatedItemsCard
            title={`Groups (${attachedGroups?.length || 0})`}
            availableItems={availableGroups || []}
            attachedItems={attachedGroups || []}
            entityType="Group"
            emptyMessage="No groups assigned to this app."
            onAddItems={handleAddGroup}
            onRemoveItem={handleRemoveGroup}
            canManage={true}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AppDetailsPage;
