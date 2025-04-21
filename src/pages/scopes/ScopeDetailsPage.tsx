import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge, Pencil, Trash2, Users, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ScopeForm } from "@/components/forms/ScopeForm";
import { scopeService } from "@/api/scopeService";
import { Scope, TableColumn, FilterOption } from "@/types";

const ScopeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch scope details
  const {
    data: scopeResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["scope", id],
    queryFn: () => scopeService.getScopeById(id as string),
    enabled: !!id,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          toast.error(`Error loading scope: ${(error as any).message}`);
        }
      },
    },
  });

  const scope = scopeResponse?.data;

  // Fetch complementary resources of scope
  const { data: resourceItemsAvailable } = useQuery({
    queryKey: ["scope_comp_resources", id],
    queryFn: () => scopeService.getAvailableGroupsForScope(id),
  });

  const { data: resourceItemsAttached } = useQuery({
    queryKey: ["scope_resources", id],
    queryFn: () => scopeService.getAttachedGroupsForUser(id),
  });

  // Delete scope mutation
  const deleteScopeMutation = useMutation({
    mutationFn: (scopeId: string) => scopeService.deleteScope(scopeId),
    onSuccess: () => {
      toast.success(`Scope "${scope?.name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["scopes"] });
      navigate("/scopes");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete scope: ${error.message}`);
      setIsDeleteDialogOpen(false);
    },
  });

  // Update scope mutation
  const updateScopeMutation = useMutation({
    mutationFn: (data: any) =>
      scopeService.updateScope({
        scopeId: id as string,
        scopeData: data,
      }),
    onSuccess: () => {
      toast.success("Scope updated successfully");
      queryClient.invalidateQueries({ queryKey: ["scope", id] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update scope: ${error.message}`);
    },
  });

  // Resource management mutations
  const addResourceMutation = useMutation({
    mutationFn: (resourceId: string) =>
      scopeService.addResourceScope({
        scopeId: id as string,
        resourceId,
      }),
    onSuccess: () => {
      toast.success("Resource added to scope successfully");
      queryClient.invalidateQueries({ queryKey: ["scope", id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to add resource: ${err.message}`);
    },
  });

  const removeResourceMutation = useMutation({
    mutationFn: (resourceId: string) =>
      scopeService.deleteResourceScope({
        scopeId: id as string,
        resourceId,
      }),
    onSuccess: () => {
      toast.success("Resource removed from scope successfully");
      queryClient.invalidateQueries({ queryKey: ["scope", id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to remove resource: ${err.message}`);
    },
  });

  const handleDeleteScope = () => {
    if (!id) return;
    deleteScopeMutation.mutate(id);
  };

  const handleUpdateScope = async (formData: any) => {
    updateScopeMutation.mutate(formData);
  };

  const handleAddResource = (resourceId: string) => {
    addResourceMutation.mutate(resourceId);
  };

  const handleRemoveResource = (resourceId: string) => {
    removeResourceMutation.mutate(resourceId);
  };

  if (isLoading || !scope) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  // Related items
  const resources = (scope.resources || []).map((resource) => ({
    id: resource.id,
    name: resource.name,
    description: `${resource.method} ${resource.route_path}`,
    link: `/resources/${resource.id}`,
  }));

  const groups = (scope.groups || []).map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description || "",
    link: `/groups/${group.id}`,
  }));

  const users = (scope.users || []).map((user) => ({
    id: user.id,
    name: `${user.first_name} ${
      user.middle_name ? user.middle_name + " " : ""
    }${user.last_name}`,
    description: user.email,
    link: `/users/${user.id}`,
  }));

  return (
    <>
      <PageHeader
        title={scope.name}
        description={scope.description || "No description"}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </PageHeader>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">
              Resources ({resources.length})
            </TabsTrigger>
            <TabsTrigger value="groups">Groups ({groups.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Name</div>
                    <div>{scope.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Description
                    </div>
                    <div>{scope.description || "No description"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <StatusBadge active={scope.active ?? true} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">ID</div>
                    <div className="font-mono text-xs">{scope.id}</div>
                  </div>
                </CardContent>
              </Card>

              <RelatedItemsCard
                title="Associated Resources"
                attachedItems={resourceItemsAttached?.data || []}
                availableItems={resourceItemsAvailable?.data || []}
                entityType="Resource"
                emptyMessage="No resources associated with this scope"
                onAddItems={() => setActiveTab("resources")}
                canManage={resources.length > 5}
              />
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RelatedItemsCard 
                title="Associated Groups"
                items={groups.slice(0, 5)}
                entityType="Group"
                emptyMessage="No groups associated with this scope"
                onAddItems={() => setActiveTab("groups")}
                canManage={groups.length > 5}
              />

              <RelatedItemsCard 
                title="Associated Users"
                items={users.slice(0, 5)}
                entityType="User"
                emptyMessage="No users associated with this scope"
                onAddItems={() => setActiveTab("users")}
                canManage={users.length > 5}
              />
            </div> */}
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Resources in this Scope</CardTitle>
                <CardDescription>
                  Manage resources associated with this scope
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resources.length > 0 ? (
                  <div className="space-y-4">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div>
                          <Link
                            to={resource.link || "#"}
                            className="font-medium text-admin-600 hover:underline"
                          >
                            {resource.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {resource.description}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveResource(resource.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No resources associated with this scope
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            {/* Groups display */}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {/* Users display */}
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Scope"
        description={`Are you sure you want to delete the scope "${scope.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteScope}
        variant="destructive"
        isLoading={deleteScopeMutation.isPending}
      />

      {isEditDialogOpen && (
        <ScopeForm
          defaultValues={scope}
          onSubmit={handleUpdateScope}
          isLoading={updateScopeMutation.isPending}
        />
      )}
    </>
  );
};

export default ScopeDetailsPage;
