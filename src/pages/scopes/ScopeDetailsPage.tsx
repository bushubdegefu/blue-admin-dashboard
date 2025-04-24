import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scopeService } from "@/api/scopeService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { PlusCircle } from "lucide-react";
import GenericPagination from "@/components/common/Pagination";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EntitySelector,
  EntitySelectorUser,
} from "@/components/common/EntitySelector";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";
import { ScopeForm } from "@/components/forms/ScopeForm";

const ScopeDetailsPage = () => {
  const { id: scopeId } = useParams();
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(10);
  const [usersPage, setUsersPage] = useState(1);
  const [groupsPage, setGroupsPage] = useState(1);
  const [resourcePage, setResourcePage] = useState(1);
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);

  // Fetch scope details
  const {
    data: scopeData,
    isLoading: isScopeLoading,
    error: scopeError,
  } = useQuery({
    queryKey: ["scope", scopeId],
    queryFn: () => scopeService.getScopeById(scopeId || ""),
    enabled: !!scopeId,
  });

  // Fetch scopes users
  const { data: scopeUsers, isLoading: isScopeUsersLoading } = useQuery({
    queryKey: ["scope-users", scopeId, usersPage, pageSize],
    queryFn: () =>
      scopeService.getScopeUser({
        scopeId: scopeId,
        page: usersPage,
        size: pageSize,
      }),
  });

  // Fetch scopes attached users
  const { data: scopeAttachedUsers, isLoading: isScopeAttachedUsersLoading } =
    useQuery({
      queryKey: ["scope_attached_users", scopeId],
      queryFn: () => scopeService.getAttachedUsersForScope(scopeId || ""),
    });

  // Fetch scopes resources paginated
  const { data: scopeAvailableUsers, isLoading: isScopeAvailableUsersLoading } =
    useQuery({
      queryKey: ["scope_available_users", scopeId],
      queryFn: () => scopeService.getAvailableUsersForScope(scopeId || ""),
    });

  // Fetch scopes groups
  const { data: scopeGroups, isLoading: isScopeGroupsLoading } = useQuery({
    queryKey: ["scope-groups", scopeId, groupsPage, pageSize],
    queryFn: () =>
      scopeService.getScopeGroup({
        scopeId: scopeId,
        page: usersPage,
        size: pageSize,
      }),
  });

  // Fetch scopes attached groups
  const { data: scopeAttachedGroups, isLoading: isScopeAttachedGroupsLoading } =
    useQuery({
      queryKey: ["scope_attached_groups", scopeId],
      queryFn: () => scopeService.getAttachedGroupsForScope(scopeId || ""),
    });

  // Fetch scopes groups available
  const {
    data: scopeAvailableGroups,
    isLoading: isScopeAvailableGroupsLoading,
  } = useQuery({
    queryKey: ["scope_available_groups", scopeId],
    queryFn: () => scopeService.getAvailableGroupsForScope(scopeId || ""),
  });

  // Fetch scopes resources paginated
  const { data: scopeResources, isLoading: isScopeResourcesLoading } = useQuery(
    {
      queryKey: ["scope_resources", scopeId, resourcePage, pageSize],
      queryFn: () =>
        scopeService.getScopeResource({
          scopeId: scopeId,
          page: resourcePage,
          size: pageSize,
        }),
    }
  ); // Fetch scopes resources
  const { data: attachedResources, isLoading: isAttachedResourcesLoading } =
    useQuery({
      queryKey: ["scope_attached_resources", scopeId],
      queryFn: () => scopeService.getAttachedResourcesForScope(scopeId || ""),
    });

  // Fetch available resources for scope
  const { data: availableResources, isLoading: isAvailableResourcesLoading } =
    useQuery({
      queryKey: ["scope_comp_resources", scopeId],
      queryFn: () => scopeService.getAvailableResourcesForScope(scopeId || ""),
    });

  // Update Scope mutation
  const updateScopeMutation = useMutation({
    mutationFn: (data: any) =>
      scopeService.updateScope({
        scopeId: scopeId as string,
        scopeData: data,
      }),
    onSuccess: () => {
      toast.success("Scope updated successfully");
      queryClient.invalidateQueries({ queryKey: ["scope", scopeId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update Scope: ${error.message}`);
    },
  });

  // Mutations for adding and removing resources
  const addResourceMutation = useMutation({
    mutationFn: (resourceId: string) =>
      scopeService.addResourceScope({ scopeId: scopeId, resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scope_resources", scopeId] });
      queryClient.invalidateQueries({
        queryKey: ["scope_attached_resources", scopeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["scope_comp_resources", scopeId],
      });
      toast.success("Resource added to scope");
    },
    onError: (error: any) => {
      toast.error(`Failed to add resource: ${error.message}`);
    },
  });

  const removeResourceMutation = useMutation({
    mutationFn: (resourceId: string) =>
      scopeService.deleteResourceScope({ scopeId: scopeId, resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scope_resources", scopeId] });
      queryClient.invalidateQueries({
        queryKey: ["scope_attached_resources", scopeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["scope_comp_resources", scopeId],
      });
      toast.success("Resource removed from scope");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove resource: ${error.message}`);
    },
  });

  // Mutations for adding and removing resources
  const addUserMutation = useMutation({
    mutationFn: (userId: string) =>
      scopeService.addUserScope({ scopeId: scopeId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scope-users", scopeId] });
      queryClient.invalidateQueries({
        queryKey: ["scope_available_users", scopeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["scope_attached_users", scopeId],
      });
      toast.success("User added to scope");
    },
    onError: (error: any) => {
      toast.error(`Failed to add user: ${error.message}`);
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId: string) =>
      scopeService.deleteUserScope({ scopeId: scopeId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scope-users", scopeId] });
      queryClient.invalidateQueries({
        queryKey: ["scope_attached_users", scopeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["scope_available_users", scopeId],
      });
      toast.success("User removed from scope");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove User: ${error.message}`);
    },
  });

  // Mutations for adding and removing groups
  const addGroupMutation = useMutation({
    mutationFn: (groupId: string) =>
      scopeService.addGroupScope({ scopeId: scopeId, groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scope-groups", scopeId] });
      queryClient.invalidateQueries({
        queryKey: ["scope_attached_groups", scopeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["scope_available_groups", scopeId],
      });
      toast.success("Group added to scope");
    },
    onError: (error: any) => {
      toast.error(`Failed to add Group: ${error.message}`);
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: (groupId: string) =>
      scopeService.deleteGroupScope({ scopeId: scopeId, groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scope-groups", scopeId] });
      queryClient.invalidateQueries({
        queryKey: ["scope_attached_groups", scopeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["scope_available_groups", scopeId],
      });
      toast.success("Group removed from scope");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove group: ${error.message}`);
    },
  });

  const handleUpdateScope = async (formData: any) => {
    updateScopeMutation.mutate(formData);
  };

  const handleAddResource = (resourceId: string) => {
    addResourceMutation.mutate(resourceId);
  };

  const handleRemoveResource = (resourceId: string) => {
    removeResourceMutation.mutate(resourceId);
  };

  const handleAddUser = (userId: string) => {
    addUserMutation.mutate(userId);
  };

  const handleRemoveUser = (userId: string) => {
    removeUserMutation.mutate(userId);
  };

  const handleAddGroup = (groupId: string) => {
    addGroupMutation.mutate(groupId);
  };

  const handleRemoveGroup = (groupId: string) => {
    removeGroupMutation.mutate(groupId);
  };

  const resourceColumns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (info) => (
        <div>
          <div className="font-medium">{info.getValue() as string}</div>
          <div className="text-xs text-gray-500">
            ID: {info.row.original.id}
          </div>
        </div>
      ),
    },
    {
      header: "Route Path",
      accessorKey: "route_path",
      cell: (info) => (
        <div className="font-mono text-xs">{info.getValue() as string}</div>
      ),
    },
    {
      header: "Method",
      accessorKey: "method",
      cell: (info) => {
        const method = info.getValue() as string;
        let color = "";

        switch (method) {
          case "GET":
            color = "bg-green-100 text-green-800";
            break;
          case "POST":
            color = "bg-blue-100 text-blue-800";
            break;
          case "PUT":
            color = "bg-yellow-100 text-yellow-800";
            break;
          case "PATCH":
            color = "bg-purple-100 text-purple-800";
            break;
          case "DELETE":
            color = "bg-red-100 text-red-800";
            break;
          default:
            color = "bg-gray-100 text-gray-800";
        }

        return (
          <Badge variant="outline" className={`${color} font-mono`}>
            {method}
          </Badge>
        );
      },
    },
  ];

  const userColumns = [
    {
      header: "Username",
      accessorKey: "username",
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
      header: "Name",
      accessorKey: "first_name",
      cell: (info: any) => {
        const user = info.row.original;
        const fullName = `${user.first_name} ${
          user.middle_name ? user.middle_name + " " : ""
        }${user.last_name}`;
        return fullName;
      },
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Status",
      accessorKey: "disabled",
      cell: (info: any) => (
        <StatusBadge
          active={!(info.getValue() as boolean)}
          activeText="Active"
          inactiveText="Disabled"
        />
      ),
    },

    {
      header: "Registered",
      accessorKey: "date_registered",
      cell: (info: any) => formatDate(info.getValue() as string, "PP"),
    },
  ];

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

  if (isScopeLoading) {
    return <div className="p-6">Loading scope details...</div>;
  }

  if (scopeError) {
    return <div className="p-6">Error: {(scopeError as Error).message}</div>;
  }

  return (
    <>
      <PageHeader
        title="Scope Details"
        description={scopeData?.description || "No description provided"}
      >
        <Button asChild>
          <Link to="/scopes">Back to Scopes</Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="w-full mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>View scope details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScopeForm
                scope={scopeData?.data}
                onSave={handleUpdateScope}
                isLoading={updateScopeMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Resources in this Scope</CardTitle>
                <CardDescription>
                  Manage Resources associated with this scope
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsAddResourceDialogOpen(true)}
                className="ml-auto"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Resources
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={resourceColumns}
                data={scopeResources?.data || []}
                isLoading={isScopeResourcesLoading}
                searchPlaceholder="Search scope resources..."
              />
              <GenericPagination
                totalItems={scopeResources?.total || 0}
                pageSize={pageSize}
                currentPage={resourcePage}
                queryKey="scope_resources"
                onPageChange={setResourcePage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Users in this Scope</CardTitle>
                <CardDescription>
                  Manage Users associated with this Scope
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsAddUserDialogOpen(true)}
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
                data={scopeUsers?.data || []}
                isLoading={isScopeResourcesLoading}
                searchPlaceholder="Search scope users..."
              />
              <GenericPagination
                totalItems={scopeUsers?.total || 0}
                pageSize={pageSize}
                currentPage={usersPage}
                queryKey="scope-users"
                onPageChange={setUsersPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Groups in this Scope</CardTitle>
                <CardDescription>
                  Manage Groups associated with this Scope
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
                data={scopeGroups?.data || []}
                isLoading={isScopeGroupsLoading}
                searchPlaceholder="Search scope groups..."
              />
              <GenericPagination
                totalItems={scopeGroups?.total || 0}
                pageSize={pageSize}
                currentPage={groupsPage}
                queryKey="scope-groups"
                onPageChange={setGroupsPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resource dialog box */}
      <Dialog
        open={isAddResourceDialogOpen}
        onOpenChange={setIsAddResourceDialogOpen}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Resources to Scope</DialogTitle>
          </DialogHeader>
          <EntitySelector
            title="Add Resources"
            description="Choose which resources to add to this scope"
            availableItems={availableResources?.data || []}
            selectedItems={attachedResources?.data || []}
            isLoading={isAvailableResourcesLoading}
            onSelect={(resource) => handleAddResource(resource.id)}
            onRemove={(resource) => handleRemoveResource(resource.id)}
            emptyMessage="No more resources available to add"
          />
        </DialogContent>
      </Dialog>

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
            description="Choose which rgroups to add to this scope"
            availableItems={scopeAvailableGroups?.data || []}
            selectedItems={scopeAttachedGroups?.data || []}
            isLoading={isScopeAvailableGroupsLoading}
            onSelect={(group) => handleAddGroup(group.id)}
            onRemove={(group) => handleRemoveGroup(group.id)}
            emptyMessage="No more resources available to add"
          />
        </DialogContent>
      </Dialog>

      {/* User dialog box */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add User to Scope</DialogTitle>
          </DialogHeader>
          <EntitySelectorUser
            title="Add User"
            description="Choose which user to add to this scope"
            availableItems={scopeAvailableUsers?.data}
            selectedItems={scopeAttachedUsers?.data}
            isLoading={isScopeAvailableUsersLoading}
            onSelect={(user) => handleAddUser(user.id)}
            onRemove={(user) => handleRemoveUser(user.id)}
            emptyMessage="No more Users available to add"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScopeDetailsPage;
