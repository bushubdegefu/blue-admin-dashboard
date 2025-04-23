
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scopeService } from "@/api/scopeService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { appService } from "@/api/appService";
import { userService } from "@/api/userService";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ScopeDetailsPage = () => {
  const { scopeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch scope details
  const { data: scope, isLoading: isScopeLoading, error: scopeError } = useQuery({
    queryKey: ["scope", scopeId],
    queryFn: () => scopeService.getScopeById(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch scopes users
  const { data: scopeUsers, isLoading: isScopeUsersLoading } = useQuery({
    queryKey: ["scope-users", scopeId],
    queryFn: () => userService.getAttachedUsersForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch scopes resources
  const { data: scopeResources, isLoading: isScopeResourcesLoading } = useQuery({
    queryKey: ["scope-resources", scopeId],
    queryFn: () => scopeService.getAttachedResourcesForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch available resources for scope
  const { data: availableResources, isLoading: isAvailableResourcesLoading } = useQuery({
    queryKey: ["available-resources", scopeId],
    queryFn: () => scopeService.getAvailableResourcesForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Mutations for adding and removing resources
  const addResourceMutation = useMutation({
    mutationFn: (resourceId: string) => 
      scopeService.addResourceScope({ scopeId: scopeId || "", resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scope-resources", scopeId] });
      queryClient.invalidateQueries({ queryKey: ["available-resources", scopeId] });
      toast.success("Resource added to scope");
    },
    onError: (error: any) => {
      toast.error(`Failed to add resource: ${error.message}`);
    },
  });

  const removeResourceMutation = useMutation({
    mutationFn: (resourceId: string) => 
      scopeService.deleteResourceScope({ scopeId: scopeId || "", resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scope-resources", scopeId] });
      queryClient.invalidateQueries({ queryKey: ["available-resources", scopeId] });
      toast.success("Resource removed from scope");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove resource: ${error.message}`);
    },
  });

  const handleAddResource = (resourceId: string) => {
    addResourceMutation.mutate(resourceId);
  };

  const handleRemoveResource = (resourceId: string) => {
    removeResourceMutation.mutate(resourceId);
  };

  if (isScopeLoading) {
    return <div className="p-6">Loading scope details...</div>;
  }

  if (scopeError) {
    return <div className="p-6">Error: {(scopeError as Error).message}</div>;
  }

  if (!scope) {
    return <div className="p-6">Scope not found</div>;
  }

  return (
    <>
      <PageHeader
        title="Scope Details" 
        description={scope.description || "No description provided"}
      >
        <Button asChild>
          <Link to="/scopes">
            Back to Scopes
          </Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="w-full mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                View scope details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">ID</div>
                    <div className="font-medium">{scope.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{scope.name}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="font-medium">{scope.description || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium">{scope.active ? "Active" : "Inactive"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <RelatedItemsCard
            title={`Resources (${scopeResources?.length || 0})`}
            availableItems={availableResources || []}
            attachedItems={scopeResources || []}
            entityType="Resource"
            emptyMessage="No resources assigned to this scope."
            onAddItems={handleAddResource}
            onRemoveItem={handleRemoveResource}
            canManage={true}
          />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <RelatedItemsCard
            title={`Users (${scopeUsers?.length || 0})`}
            availableItems={[]} 
            attachedItems={scopeUsers || []}
            entityType="User"
            emptyMessage="No users assigned to this scope."
            onAddItems={null}
            onRemoveItem={null}
            canManage={false}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ScopeDetailsPage;
