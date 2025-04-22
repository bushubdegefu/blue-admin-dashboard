import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scopeService } from "@/api/scopeService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { appService } from "@/api/appService";
import { userService } from "@/api/userService";
import { Link } from "react-router-dom";
import PageHeader  from "@/components/layout/PageHeader";

const ScopeDetailsPage = () => {
  const { scopeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newScopeName, setNewScopeName] = useState("");

  // Fetch scope details
  const { data: scope, isLoading: isScopeLoading, error: scopeError } = useQuery({
    queryKey: ["scope", scopeId],
    queryFn: () => scopeService.getScopeById(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch scopes users
  const { data: scopeUsers, isLoading: isScopeUsersLoading, error: scopeUsersError } = useQuery({
    queryKey: ["scope-users", scopeId],
    queryFn: () => userService.getAttachedUsersForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch scopes resources
  const { data: scopeResources, isLoading: isScopeResourcesLoading, error: scopeResourcesError } = useQuery({
    queryKey: ["scope-resources", scopeId],
    queryFn: () => scopeService.getAttachedResourcesForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch available apps for scope
  const { data: availableApps, isLoading: isAvailableAppsLoading, error: availableAppsError } = useQuery({
    queryKey: ["available-apps", scopeId],
    queryFn: () => appService.getAvailableAppsForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch attached apps for scope
  const { data: attachedApps, isLoading: isAttachedAppsLoading, error: attachedAppsError } = useQuery({
    queryKey: ["attached-apps", scopeId],
    queryFn: () => appService.getAttachedAppsForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch available users for scope
  const { data: availableUsers, isLoading: isAvailableUsersLoading, error: availableUsersError } = useQuery({
    queryKey: ["available-users", scopeId],
    queryFn: () => userService.getAvailableUsersForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch available resources for scope
  const { data: availableResources, isLoading: isAvailableResourcesLoading, error: availableResourcesError } = useQuery({
    queryKey: ["available-resources", scopeId],
    queryFn: () => scopeService.getAvailableResourcesForScope(scopeId || ""),
    enabled: !!scopeId,
  });

  // Mutations for adding and removing apps, users and resources
  const queryClientContext = useQueryClient();
  const addResourceMutation = useMutation(
    {
      mutationFn: (resourceId: string) => scopeService.addResourceScope({ scopeId: scopeId || "", resourceId }),
      onSuccess: () => {
        queryClientContext.invalidateQueries({ queryKey: ["scope-resources", scopeId] });
        queryClientContext.invalidateQueries({ queryKey: ["available-resources", scopeId] });
        toast.success("Resource added to scope");
      },
      onError: (error: any) => {
        toast.error(`Failed to add resource: ${error.message}`);
      },
    }
  );

  const removeResourceMutation = useMutation(
    {
      mutationFn: (resourceId: string) => scopeService.deleteResourceScope({ scopeId: scopeId || "", resourceId }),
      onSuccess: () => {
        queryClientContext.invalidateQueries({ queryKey: ["scope-resources", scopeId] });
        queryClientContext.invalidateQueries({ queryKey: ["available-resources", scopeId] });
        toast.success("Resource removed from scope");
      },
      onError: (error: any) => {
        toast.error(`Failed to remove resource: ${error.message}`);
      },
    }
  );


  const handleAddResource = async (resourceId: string) => {
    await addResourceMutation.mutateAsync(resourceId);
  };

  const handleRemoveResource = async (resourceId: string) => {
    await removeResourceMutation.mutateAsync(resourceId);
  };

  // Handler for updating scope name
  const handleNameUpdate = async () => {
    if (!newScopeName.trim()) {
      toast.error("Scope name cannot be empty");
      return;
    }

    try {
      await scopeService.updateScope({
        scopeId: scope?.id,
        scopeData: { name: newScopeName },
      });
      queryClient.invalidateQueries({ queryKey: ["scope", scopeId] });
      toast.success("Scope name updated");
      setIsEditingName(false);
    } catch (error: any) {
      toast.error(`Failed to update scope name: ${error.message}`);
    }
  };

  if (isScopeLoading) {
    return <div>Loading scope details...</div>;
  }

  if (scopeError) {
    return <div>Error: {scopeError.message}</div>;
  }

  if (!scope) {
    return <div>Scope not found</div>;
  }

  return (
    <>
      <PageHeader
        title="Scope Details"  description={scope.description || "No description provided"}
      >
        {/* {isEditingName ? (
            <div className="flex items-center">
              <input
                type="text"
                value={newScopeName}
                onChange={(e) => setNewScopeName(e.target.value)}
                className="border rounded px-2 py-1 mr-2"
              />
              <Button size="sm" onClick={handleNameUpdate}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              {scope.name}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditingName(true);
                  setNewScopeName(scope.name);
                }}
                className="ml-2"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )
        } */}
        <Button asChild>
          <Link to="/scopes">
            Back to Scopes
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              View scope details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">ID:</span>
                <span>{scope.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Name:</span>
                <span>{scope.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Description:</span>
                <span>{scope.description || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <RelatedItemsCard
          title={`Users (${scopeUsers?.length || 0})`}
          availableItems={availableUsers || []}
          attachedItems={scopeUsers || []}
          entityType="User"
          emptyMessage="No users assigned to this scope."
          onAddItems={null}
          onRemoveItem={null}
          canManage={true}
        />

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

      </div>
    </>
  );
};

export default ScopeDetailsPage;
