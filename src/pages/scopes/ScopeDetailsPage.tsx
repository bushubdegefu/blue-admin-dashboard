
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge, Pencil, Trash2, Users, CheckCircle2, PlusCircle } from "lucide-react";
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
import { PaginatedDataTable } from "@/components/common/PaginatedDataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ScopeForm } from "@/components/forms/ScopeForm";
import { scopeService } from "@/api/scopeService";
import { Scope, TableColumn } from "@/types";
import { EntitySelector } from "@/components/common/EntitySelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InlineEdit } from "@/components/common/InlineEdit";

const ScopeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddResourcesDialogOpen, setIsAddResourcesDialogOpen] = useState(false);
  const [isAddGroupsDialogOpen, setIsAddGroupsDialogOpen] = useState(false);
  const [resourcesPage, setResourcesPage] = useState(1);
  const [groupsPage, setGroupsPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Fetch resources with pagination
  const {
    data: resourcesData,
    isLoading: isLoadingResources
  } = useQuery({
    queryKey: ["scope_resources", id, resourcesPage, pageSize],
    queryFn: () => scopeService.getScopeResource({ scopeId: id, page: resourcesPage, size: pageSize }),
    enabled: !!id && activeTab === "resources"
  });

  // Fetch groups with pagination
  const {
    data: groupsData,
    isLoading: isLoadingGroups
  } = useQuery({
    queryKey: ["scope_groups", id, groupsPage, pageSize],
    queryFn: () => scopeService.getScopeGroup({ scopeId: id, page: groupsPage, size: pageSize }),
    enabled: !!id && activeTab === "groups"
  });

  // Fetch available resources
  const { 
    data: availableResourcesData,
    isLoading: isLoadingAvailableResources
  } = useQuery({
    queryKey: ["available_resources", id],
    queryFn: () => scopeService.getAvailableResourcesForScope(id as string),
    enabled: !!id && isAddResourcesDialogOpen
  });

  // Fetch available groups
  const { 
    data: availableGroupsData,
    isLoading: isLoadingAvailableGroups
  } = useQuery({
    queryKey: ["available_groups", id],
    queryFn: () => scopeService.getAvailableGroupsForScope(id as string),
    enabled: !!id && isAddGroupsDialogOpen
  });

  const scope = scopeResponse?.data;

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

  // Update scope field mutation
  const updateScopeFieldMutation = useMutation({
    mutationFn: ({ field, value }: { field: string, value: any }) =>
      scopeService.updateScope({
        scopeId: id as string,
        scopeData: { [field]: value },
      }),
    onSuccess: () => {
      toast.success("Scope updated successfully");
      queryClient.invalidateQueries({ queryKey: ["scope", id] });
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
      queryClient.invalidateQueries({ queryKey: ["scope_resources", id] });
      queryClient.invalidateQueries({ queryKey: ["available_resources", id] });
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
      queryClient.invalidateQueries({ queryKey: ["scope_resources", id] });
      queryClient.invalidateQueries({ queryKey: ["available_resources", id] });
      queryClient.invalidateQueries({ queryKey: ["scope", id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to remove resource: ${err.message}`);
    },
  });

  // Group management mutations
  const addGroupMutation = useMutation({
    mutationFn: (groupId: string) =>
      scopeService.addGroupScope({
        scopeId: id as string,
        groupId,
      }),
    onSuccess: () => {
      toast.success("Group added to scope successfully");
      queryClient.invalidateQueries({ queryKey: ["scope_groups", id] });
      queryClient.invalidateQueries({ queryKey: ["available_groups", id] });
      queryClient.invalidateQueries({ queryKey: ["scope", id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to add group: ${err.message}`);
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: (groupId: string) =>
      scopeService.deleteGroupScope({
        scopeId: id as string,
        groupId,
      }),
    onSuccess: () => {
      toast.success("Group removed from scope successfully");
      queryClient.invalidateQueries({ queryKey: ["scope_groups", id] });
      queryClient.invalidateQueries({ queryKey: ["available_groups", id] });
      queryClient.invalidateQueries({ queryKey: ["scope", id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to remove group: ${err.message}`);
    },
  });

  const handleDeleteScope = () => {
    if (!id) return;
    deleteScopeMutation.mutate(id);
  };

  const handleUpdateScope = async (formData: any) => {
    updateScopeMutation.mutate(formData);
  };

  const handleUpdateScopeField = async (field: string, value: any) => {
    updateScopeFieldMutation.mutate({ field, value });
  };

  const handleAddResource = (resourceId: string) => {
    addResourceMutation.mutate(resourceId);
  };

  const handleRemoveResource = (resourceId: string) => {
    removeResourceMutation.mutate(resourceId);
  };

  const handleAddGroup = (groupId: string) => {
    addGroupMutation.mutate(groupId);
  };

  const handleRemoveGroup = (groupId: string) => {
    removeGroupMutation.mutate(groupId);
  };

  const resourceColumns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <Link to={`/resources/${row.original.id}`} className="font-medium text-admin-600 hover:underline">
          {row.original.name}
        </Link>
      )
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }: any) => (
        <Badge variant="outline" className={`${getBadgeColorForMethod(row.original.method)}`}>
          {row.original.method}
        </Badge>
      )
    },
    {
      accessorKey: "route_path",
      header: "Path"
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveResource(row.original.id)}
          className="hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  const groupColumns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <Link to={`/groups/${row.original.id}`} className="font-medium text-admin-600 hover:underline">
          {row.original.name}
        </Link>
      )
    },
    {
      accessorKey: "description",
      header: "Description"
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge active={row.original.active} />
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveGroup(row.original.id)}
          className="hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  const getBadgeColorForMethod = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-800";
      case "POST": return "bg-blue-100 text-blue-800";
      case "PUT":
      case "PATCH": return "bg-orange-100 text-orange-800";
      case "DELETE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading || !scope) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  // Related items
  const resources = (scope.resources || []).slice(0, 5).map((resource) => ({
    id: resource.id,
    name: resource.name,
    description: `${resource.method} ${resource.route_path}`,
  }));

  const groups = (scope.groups || []).slice(0, 5).map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description || "",
  }));

  const users = (scope.users || []).slice(0, 5).map((user) => ({
    id: user.id,
    name: `${user.first_name} ${
      user.middle_name ? user.middle_name + " " : ""
    }${user.last_name}`,
    description: user.email,
  }));

  return (
    <>
      <PageHeader
        title={
          <InlineEdit 
            value={scope.name} 
            onSave={(value) => handleUpdateScopeField('name', value)}
            isLoading={updateScopeFieldMutation.isPending}
          />
        }
        description={
          <InlineEdit 
            value={scope.description || ''} 
            onSave={(value) => handleUpdateScopeField('description', value)} 
            multiline
            placeholder="Add a description..."
            isLoading={updateScopeFieldMutation.isPending}
          />
        }
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
              Resources ({scope.resources?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="groups">Groups ({scope.groups?.length || 0})</TabsTrigger>
            <TabsTrigger value="users">Users ({scope.users?.length || 0})</TabsTrigger>
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
                attachedItems={resources}
                availableItems={[]}
                entityType="Resource"
                emptyMessage="No resources associated with this scope"
                canManage={false}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RelatedItemsCard 
                title="Associated Groups"
                attachedItems={groups}
                availableItems={[]}
                entityType="Group"
                emptyMessage="No groups associated with this scope"
                canManage={false}
              />

              <RelatedItemsCard 
                title="Associated Users"
                attachedItems={users}
                availableItems={[]}
                entityType="User"
                emptyMessage="No users associated with this scope"
                canManage={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Resources in this Scope</CardTitle>
                  <CardDescription>
                    Manage resources associated with this scope
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsAddResourcesDialogOpen(true)}
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Resources
                </Button>
              </CardHeader>
              <CardContent>
                <PaginatedDataTable
                  columns={resourceColumns}
                  data={resourcesData?.data || []}
                  isLoading={isLoadingResources}
                  pageCount={resourcesData?.pages || 1}
                  totalItems={resourcesData?.total || 0}
                  currentPage={resourcesPage}
                  pageSize={pageSize}
                  onPageChange={(page) => setResourcesPage(page)}
                  onPageSizeChange={(size) => setPageSize(size)}
                  searchPlaceholder="Search resources..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Groups in this Scope</CardTitle>
                  <CardDescription>
                    Manage groups associated with this scope
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsAddGroupsDialogOpen(true)}
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Groups
                </Button>
              </CardHeader>
              <CardContent>
                <PaginatedDataTable
                  columns={groupColumns}
                  data={groupsData?.data || []}
                  isLoading={isLoadingGroups}
                  pageCount={groupsData?.pages || 1}
                  totalItems={groupsData?.total || 0}
                  currentPage={groupsPage}
                  pageSize={pageSize}
                  onPageChange={(page) => setGroupsPage(page)}
                  onPageSizeChange={(size) => setPageSize(size)}
                  searchPlaceholder="Search groups..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {/* Users display - to be implemented */}
            <Card>
              <CardHeader>
                <CardTitle>Users with this Scope</CardTitle>
                <CardDescription>
                  Users are assigned to this scope through their groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  User management is handled through their assigned groups.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
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
          scope={scope}
          onSave={handleUpdateScope}
          isLoading={updateScopeMutation.isPending}
          onCancel={() => setIsEditDialogOpen(false)}
        />
      )}

      <Dialog open={isAddResourcesDialogOpen} onOpenChange={setIsAddResourcesDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Resources to Scope</DialogTitle>
          </DialogHeader>
          <EntitySelector
            title="Select Resources"
            description="Choose which resources to add to this scope"
            availableItems={availableResourcesData?.data || []}
            selectedItems={resourcesData?.data || []}
            isLoading={isLoadingAvailableResources}
            onSelect={(resource) => handleAddResource(resource.id)}
            onRemove={(resource) => handleRemoveResource(resource.id)}
            emptyMessage="No more resources available to add"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddGroupsDialogOpen} onOpenChange={setIsAddGroupsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Groups to Scope</DialogTitle>
          </DialogHeader>
          <EntitySelector
            title="Select Groups"
            description="Choose which groups to add to this scope"
            availableItems={availableGroupsData?.data || []}
            selectedItems={groupsData?.data || []}
            isLoading={isLoadingAvailableGroups}
            onSelect={(group) => handleAddGroup(group.id)}
            onRemove={(group) => handleRemoveGroup(group.id)}
            emptyMessage="No more groups available to add"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScopeDetailsPage;
