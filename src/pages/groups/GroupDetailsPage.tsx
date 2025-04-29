
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Trash2, 
  PlusCircle,
  BackpackIcon,
  ArrowLeft
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedItemsCard, RelatedItemsCardUser } from "@/components/common/RelatedItemsCard";

import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { GroupForm } from "@/components/forms/GroupForm";
import { EntitySelector, EntitySelectorUser } from "@/components/common/EntitySelector";
import { groupService } from "@/api/groupService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/common/DataTable";
import GenericPagination from "@/components/common/Pagination";

const GroupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUsersDialogOpen, setIsAddUsersDialogOpen] = useState(false);
  const [isAddScopesDialogOpen, setIsAddScopesDialogOpen] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [scopesPage, setScopesPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch group details
  const { 
    data: groupResponse,
    isLoading,
    error 
  } = useQuery({
    queryKey: ["group", id],
    queryFn: () => groupService.getGroupById(id as string),
    enabled: !!id,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          toast.error(`Error loading group: ${(error as any).message}`);
        }
      }
    }
  });

  // Fetch users with pagination
  const {
    data: usersData,
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ["group_users", id, usersPage, pageSize],
    queryFn: () => groupService.getGroupUser({ groupId: id, page: usersPage, size: pageSize }),
    enabled: !!id && activeTab === "users"
  });

  // Fetch scopes with pagination
  const {
    data: scopesData,
    isLoading: isLoadingScopes
  } = useQuery({
    queryKey: ["group_scopes", id, scopesPage, pageSize],
    queryFn: () => groupService.getGroupScope({ groupId: id, page: scopesPage, size: pageSize }),
    enabled: !!id && activeTab === "scopes"
  });

  // Fetch available users for the group
  const { 
    data: availableUsersData,
    isLoading: isLoadingAvailableUsers
  } = useQuery({
    queryKey: ["available_users", id],
    queryFn: () => groupService.getAvailableUsersForGroup(id as string),
    enabled: !!id && isAddUsersDialogOpen
  });

  // Fetch available scopes for the group
  const { 
    data: availableScopesData,
    isLoading: isLoadingAvailableScopes
  } = useQuery({
    queryKey: ["available_scopes", id],
    queryFn: () => groupService.getAvailableScopesForGroup(id as string),
    enabled: !!id && isAddScopesDialogOpen
  });

   // Fetch available users for the group
   const { 
    data: attachedUsersData,
    isLoading: isLoadingAttachedUsers
  } = useQuery({
    queryKey: ["attached_users", id],
    queryFn: () => groupService.getAttachedUsersForGroup(id as string),
  });

  // Fetch available scopes for the group
  const { 
    data: attachedScopesData,
    isLoading: isLoadingAttachedScopes
  } = useQuery({
    queryKey: ["attached_scopes", id],
    queryFn: () => groupService.getAttachedScopesForGroup(id as string),
   
  });

  const group = groupResponse?.data;

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      toast.success(`Group "${group?.name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate("/groups");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete group: ${error.message}`);
      setIsDeleteDialogOpen(false);
    }
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: (data: any) => groupService.updateGroup({
      groupId: id as string,
      groupData: data
    }),
    onSuccess: () => {
      toast.success("Group updated successfully");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update group: ${error.message}`);
    }
  });

  // Add user to group mutation
  const addUserMutation = useMutation({
    mutationFn: (userId: string) => groupService.addUserGroup({
      userId,
      groupId: id as string
    }),
    onSuccess: () => {
      toast.success("User added to group successfully");
      queryClient.invalidateQueries({ queryKey: ["group_users", id] });
      queryClient.invalidateQueries({ queryKey: ["available_users", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add user: ${error.message}`);
    }
  });

  // Remove user from group mutation
  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => groupService.deleteUserGroup({
      userId,
      groupId: id as string
    }),
    onSuccess: () => {
      toast.success("User removed from group");
      queryClient.invalidateQueries({ queryKey: ["group_users", id] });
      queryClient.invalidateQueries({ queryKey: ["available_users", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove user: ${error.message}`);
    }
  });

  // Add scope to group mutation
  const addScopeMutation = useMutation({
    mutationFn: (scopeId: string) => groupService.addScopeGroup({
      scopeId,
      groupId: id as string
    }),
    onSuccess: () => {
      toast.success("Scope added to group successfully");
      queryClient.invalidateQueries({ queryKey: ["group_scopes", id] });
      queryClient.invalidateQueries({ queryKey: ["available_scopes", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add scope: ${error.message}`);
    }
  });

  // Remove scope from group mutation
  const removeScopeMutation = useMutation({
    mutationFn: (scopeId: string) => groupService.deleteScopeGroup({
      scopeId,
      groupId: id as string
    }),
    onSuccess: () => {
      toast.success("Scope removed from group");
      queryClient.invalidateQueries({ queryKey: ["group_scopes", id] });
      queryClient.invalidateQueries({ queryKey: ["available_scopes", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove scope: ${error.message}`);
    }
  });

  const handleDeleteGroup = () => {
    if (!id) return;
    deleteGroupMutation.mutate(id);
  };

  const handleUpdateGroup = async (formData: any) => {
    updateGroupMutation.mutate(formData);
  };

  const handleAddUser = (userId: string) => {
    addUserMutation.mutate(userId);
  };

  const handleRemoveUser = (userId: string) => {
    removeUserMutation.mutate(userId);
  };

  const handleAddScope = (scopeId: string) => {
    addScopeMutation.mutate(scopeId);
  };

  const handleRemoveScope = (scopeId: string) => {
    removeScopeMutation.mutate(scopeId);
  };

  const userColumns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => {
        const user = row.original;
        const userName = `${user.first_name || ''} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name || ''}`;
        return (
          <Link to={`/users/${user.id}`} className="font-medium text-blue-600 hover:underline">
            {userName || "Unknown User"}
          </Link>
        );
      }
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const user = row.original;
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleRemoveUser(user.id)}
            className="hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      }
    }
  ];

  const scopeColumns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => {
        const scope = row.original;
        return (
          <Link to={`/scopes/${scope.id}`} className="font-medium text-blue-600 hover:underline">
            {scope.name}
          </Link>
        );
      }
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge active={row.original.active} />
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const scope = row.original;
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleRemoveScope(scope.id)}
            className="hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      }
    }
  ];

  if (isLoading || !group) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
      </div>
    );
  }


  return (
    <>
      <PageHeader title={group.name} description={group.description || "No description"}>
        <div className="flex items-center gap-2">
        <Button variant="outline" className="shadow-xl" asChild>
           <Link to="/admin/groups">
           <ArrowLeft  /> Back Grops
           </Link>
        </Button>
        </div>
      </PageHeader>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">
              Users ({usersData?.data ?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="scopes">
              Scopes ({scopesData?.data?.length  || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <GroupForm
                    group={group}
                    apps={[]} // Pass an empty array or the appropriate apps data
                    onSave={handleUpdateGroup}
                    isLoading={updateGroupMutation.isPending}     
                    />
                </CardContent>
              </Card>

              <RelatedItemsCardUser 
                title="Associated Users"
                attachedItems={attachedUsersData?.data}
                availableItems={[]}
                entityType="User"
                emptyMessage="No users associated with this group"
                canManage={false}
              />
            </div>

            <RelatedItemsCard 
              title="Associated Scopes"
              attachedItems={attachedScopesData?.data}
              availableItems={[]}
              entityType="Scope"
              emptyMessage="No scopes associated with this group"
              canManage={false}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Users in this Group</CardTitle>
                  <CardDescription>Manage users associated with this group</CardDescription>
                </div>
                <Button 
                  onClick={() => setIsAddUsersDialogOpen(true)}
                  className="ml-auto"
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Users
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={userColumns}
                  data={usersData?.data || []}
                  isLoading={isLoadingUsers}
                  searchPlaceholder="Search users..."
                 />
                <GenericPagination 
                  totalItems={usersData?.total || 0}
                  pageSize={pageSize}
                  currentPage={usersPage}
                  queryKey="group_users"
                  onPageChange={setUsersPage}
                  onPageSizeChange={setPageSize}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scopes" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Scopes in this Group</CardTitle>
                  <CardDescription>Manage scopes associated with this group</CardDescription>
                </div>
                <Button 
                  onClick={() => setIsAddScopesDialogOpen(true)}
                  className="ml-auto"
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Scopes
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={scopeColumns}
                  data={scopesData?.data || []}
                  isLoading={isLoadingScopes}
                  searchPlaceholder="Search scopes..."
                />
                <GenericPagination 
                  totalItems={scopesData?.total || 0}
                  pageSize={pageSize}
                  currentPage={scopesPage}
                  queryKey="group_scopes"
                  onPageChange={setScopesPage}
                  onPageSizeChange={setPageSize}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Group"
        description={`Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteGroup}
        variant="destructive"
        isLoading={deleteGroupMutation.isPending}
      />

      <Dialog open={isAddUsersDialogOpen} onOpenChange={setIsAddUsersDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Users to Group</DialogTitle>
          </DialogHeader>
          <EntitySelectorUser
            title="Select Users"
            description="Choose which users to add to this group"
            availableItems={availableUsersData?.data || []}
            selectedItems={usersData?.data || []}
            isLoading={isLoadingAvailableUsers}
            onSelect={(user) => handleAddUser(user.id)}
            onRemove={(user) => handleRemoveUser(user.id)}
            emptyMessage="No more users available to add"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddScopesDialogOpen} onOpenChange={setIsAddScopesDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Scopes to Group</DialogTitle>
          </DialogHeader>
          <EntitySelector
            title="Select Scopes"
            description="Choose which scopes to add to this group"
            availableItems={availableScopesData?.data || []}
            selectedItems={scopesData?.data || []}
            isLoading={isLoadingAvailableScopes}
            onSelect={(scope) => handleAddScope(scope.id)}
            onRemove={(scope) => handleRemoveScope(scope.id)}
            emptyMessage="No more scopes available to add"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupDetailsPage;
