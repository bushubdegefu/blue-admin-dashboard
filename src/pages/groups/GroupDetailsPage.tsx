
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Pencil, 
  Trash2, 
  Users, 
  CheckCircle2,
  ExternalLink,
  MapPin
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { PaginatedDataTable } from "@/components/common/PaginatedDataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { GroupForm } from "@/components/forms/GroupForm";
import { groupService } from "@/api/groupService";
import { Group, TableColumn, FilterOption } from "@/types";

const GroupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    queryFn: () => groupService.getGroupUsers(-{ groupId: id, page: usersPage, limit: pageSize }),
    enabled: !!id && activeTab === "users"
  });

  // Fetch scopes with pagination
  const {
    data: scopesData,
    isLoading: isLoadingScopes
  } = useQuery({
    queryKey: ["group_scopes", id, scopesPage, pageSize],
    queryFn: () => groupService.getGroupScope({groupId: id, page: scopesPage, limit: pageSize }),
    enabled: !!id && activeTab === "scopes"
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
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update group: ${error.message}`);
    }
  });

  // Remove user from group mutation
  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => groupService.removeUserFromGroup({
      groupId: id as string,
      userId
    }),
    onSuccess: () => {
      toast.success("User removed from group");
      queryClient.invalidateQueries({ queryKey: ["group_users", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove user: ${error.message}`);
    }
  });

  // Remove scope from group mutation
  const removeScopeMutation = useMutation({
    mutationFn: (scopeId: string) => groupService.removeScopeFromGroup({
      groupId: id as string,
      scopeId
    }),
    onSuccess: () => {
      toast.success("Scope removed from group");
      queryClient.invalidateQueries({ queryKey: ["group_scopes", id] });
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

  const handleRemoveUser = (userId: string) => {
    removeUserMutation.mutate(userId);
  };

  const handleRemoveScope = (scopeId: string) => {
    removeScopeMutation.mutate(scopeId);
  };

  const userColumns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
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
      cell: ({ row }) => {
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
      cell: ({ row }) => {
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
      cell: ({ row }) => <StatusBadge active={row.original.active} />
    },
    {
      id: "actions",
      cell: ({ row }) => {
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

  // Related items for overview
  const users = (group.users || []).slice(0, 5).map(user => ({
    id: user.id,
    name: `${user.first_name || ''} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name || ''}`,
    description: user.email,
  }));

  const scopes = (group.scopes || []).slice(0, 5).map(scope => ({
    id: scope.id,
    name: scope.name,
    description: scope.description || "",
  }));

  return (
    <>
      <PageHeader title={group.name} description={group.description || "No description"}>
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
            <TabsTrigger value="users">
              Users ({group.users?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="scopes">
              Scopes ({group.scopes?.length || 0})
            </TabsTrigger>
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
                    <div>{group.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Description</div>
                    <div>{group.description || "No description"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <StatusBadge active={group.active ?? true} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">ID</div>
                    <div className="font-mono text-xs">{group.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">UUID</div>
                    <div className="font-mono text-xs">{group.uuid}</div>
                  </div>
                  {group.app && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Application</div>
                      <Link 
                        to={`/apps/${group.app.id}`}
                        className="text-admin-600 hover:text-admin-800 hover:underline flex items-center"
                      >
                        {group.app.name}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <RelatedItemsCard 
                title="Associated Users"
                attachedItems={users}
                availableItems={[]}
                entityType="User"
                emptyMessage="No users associated with this group"
                canManage={false}
              />
            </div>

            <RelatedItemsCard 
              title="Associated Scopes"
              attachedItems={scopes}
              availableItems={[]}
              entityType="Scope"
              emptyMessage="No scopes associated with this group"
              canManage={false}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Users in this Group</CardTitle>
                <CardDescription>Manage users associated with this group</CardDescription>
              </CardHeader>
              <CardContent>
                <PaginatedDataTable
                  columns={userColumns}
                  data={usersData?.data || []}
                  isLoading={isLoadingUsers}
                  pageCount={usersData?.data.totalPages || 1}
                  totalItems={usersData?.data?.totalItems || 0}
                  currentPage={usersPage}
                  pageSize={pageSize}
                  onPageChange={(page) => setUsersPage(page)}
                  onPageSizeChange={(size) => setPageSize(size)}
                  searchPlaceholder="Search users..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scopes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scopes in this Group</CardTitle>
                <CardDescription>Manage scopes associated with this group</CardDescription>
              </CardHeader>
              <CardContent>
                <PaginatedDataTable
                  columns={scopeColumns}
                  data={scopesData?.data || []}
                  isLoading={isLoadingScopes}
                  pageCount={scopesData?.data?.totalPages || 1}
                  totalItems={scopesData?.data?.totalItems || 0}
                  currentPage={scopesPage}
                  pageSize={pageSize}
                  onPageChange={(page) => setScopesPage(page)}
                  onPageSizeChange={(size) => setPageSize(size)}
                  searchPlaceholder="Search scopes..."
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

      {isEditDialogOpen && (
        <GroupForm
          group={group}
          onSave={handleUpdateGroup}
          isLoading={updateGroupMutation.isPending}
          onCancel={() => setIsEditDialogOpen(false)}
        />
      )}
    </>
  );
};

export default GroupDetailsPage;
