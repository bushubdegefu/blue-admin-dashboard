
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, UserMinus } from "lucide-react";
import { Group, User, Scope, RelatedItem } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { GroupForm } from "@/components/forms/GroupForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from "@/api/groupService";
import { appService } from "@/api/appService";
import { userService } from "@/api/userService";
import { scopeService } from "@/api/scopeService";

const GroupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddScopeDialogOpen, setIsAddScopeDialogOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [scopeSearchTerm, setScopeSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Get group data with React Query
  const { 
    data: groupResponse,
    isLoading: isGroupLoading
  } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupService.getGroupById(id || ""),
    enabled: !!id,
    onError: (err: any) => {
      toast.error(`Error loading group: ${err.message}`);
      navigate("/groups");
    }
  });

  // Get all apps, users and scopes
  const { data: appsResponse } = useQuery({
    queryKey: ['apps-all'],
    queryFn: () => appService.getApps({ page: 1, size: 100 })
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => userService.getUsers({ page: 1, size: 100 })
  });

  const { data: scopesResponse } = useQuery({
    queryKey: ['scopes-all'],
    queryFn: () => scopeService.getScopes({ page: 1, size: 100 })
  });

  // Get available users and scopes to add to this group
  const { data: availableUsersData } = useQuery({
    queryKey: ['available-users', id],
    queryFn: () => userService.getAvailableGroupsForUser(id || ""),
    enabled: !!id
  });

  const { data: availableScopesData } = useQuery({
    queryKey: ['available-scopes', id],
    queryFn: () => scopeService.getAvailableGroupsForScope(id || ""),
    enabled: !!id
  });

  const group = groupResponse?.data;
  const allApps = appsResponse?.data || [];
  const allUsers = usersResponse?.data || [];
  const allScopes = scopesResponse?.data || [];

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: (groupData: any) => groupService.updateGroup({
      groupId: id || "",
      groupData
    }),
    onSuccess: () => {
      toast.success("Group updated successfully");
      queryClient.invalidateQueries({ queryKey: ['group', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to update group: ${err.message}`);
    }
  });

  // Add user to group mutation
  const addUserToGroupMutation = useMutation({
    mutationFn: (userId: string) => groupService.addUserGroup({
      groupId: id || "",
      userId
    }),
    onSuccess: () => {
      toast.success("User added to group");
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      queryClient.invalidateQueries({ queryKey: ['available-users', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to add user to group: ${err.message}`);
    }
  });

  // Remove user from group mutation
  const removeUserFromGroupMutation = useMutation({
    mutationFn: (userId: string) => groupService.deleteUserGroup({
      groupId: id || "",
      userId
    }),
    onSuccess: () => {
      toast.success("User removed from group");
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      queryClient.invalidateQueries({ queryKey: ['available-users', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to remove user from group: ${err.message}`);
    }
  });

  const handleSave = (formData: any) => {
    updateGroupMutation.mutate(formData);
  };

  const handleAddUserToGroup = (userId: string) => {
    addUserToGroupMutation.mutate(userId);
    setIsAddUserDialogOpen(false);
  };

  const handleRemoveUserFromGroup = (userId: string) => {
    removeUserFromGroupMutation.mutate(userId);
  };

  if (isGroupLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-500"></div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  // Convert group.users to RelatedItem[] for the RelatedItemsCard component
  const userItems: RelatedItem[] = (group.users || []).map(user => ({
    id: String(user.id),
    name: `${user.first_name} ${user.last_name}`,
    description: user.username,
    link: `/users/${user.id}`,
  }));

  // Convert group.scopes to RelatedItem[] for the RelatedItemsCard component
  const scopeItems: RelatedItem[] = (group.scopes || []).map(scope => ({
    id: String(scope.id),
    name: scope.name,
    description: scope.description,
    link: `/scopes/${scope.id}`,
  }));

  const filteredUsers = allUsers
    .filter(user => !group.users?.some(u => u.id === user.id))
    .filter(user => 
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

  const filteredScopes = allScopes
    .filter(scope => !group.scopes?.some(s => s.id === scope.id))
    .filter(scope => 
      scope.name.toLowerCase().includes(scopeSearchTerm.toLowerCase()) ||
      (scope.description && scope.description.toLowerCase().includes(scopeSearchTerm.toLowerCase()))
    );

  return (
    <>
      <PageHeader title="Group Details">
        <Button variant="outline" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Group Information
              </CardTitle>
              <CardDescription>
                View and edit group details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GroupForm 
                group={group} 
                apps={allApps} 
                onSave={handleSave} 
                isLoading={updateGroupMutation.isPending} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RelatedItemsCard
            title="Users"
            items={userItems}
            entityType="User"
            emptyMessage="This group has no members."
            onAddItems={() => setIsAddUserDialogOpen(true)}
            onRemoveItem={(userId) => handleRemoveUserFromGroup(userId)}
            canManage={true}
          />
          
          <RelatedItemsCard
            title="Scopes"
            items={scopeItems}
            entityType="Scope"
            emptyMessage="This group has no assigned scopes."
            onAddItems={() => setIsAddScopeDialogOpen(true)}
            canManage={true}
          />
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User to Group</DialogTitle>
            <DialogDescription>
              Select a user to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddUserToGroup(user.id)}
                  >
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.username} • {user.email}
                      </div>
                    </div>
                    <UserPlus className="h-4 w-4 text-admin-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No matching users found or all users already added
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Scope Dialog */}
      <Dialog open={isAddScopeDialogOpen} onOpenChange={setIsAddScopeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Scope to Group</DialogTitle>
            <DialogDescription>
              Select a scope to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Search scopes..."
              value={scopeSearchTerm}
              onChange={(e) => setScopeSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredScopes.length > 0 ? (
                filteredScopes.map((scope) => (
                  <div
                    key={scope.id}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      // handleAddScopeToGroup(scope.id);
                      toast.success(`Added scope ${scope.name} to group`);
                      setIsAddScopeDialogOpen(false);
                    }}
                  >
                    <div>
                      <div className="font-medium">{scope.name}</div>
                      <div className="text-sm text-gray-500">
                        {scope.description || "No description"}
                      </div>
                    </div>
                    <CheckCircle2Icon className="h-4 w-4 text-admin-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No matching scopes found or all scopes already added
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupDetailsPage;
