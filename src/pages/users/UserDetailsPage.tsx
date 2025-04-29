import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCog } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { UserForm } from "@/components/forms/UserForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from "@/api/userService";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { 
    data: userResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id || ""),
    enabled: !!id,
    meta: {
      onError: (err: any) => {
        toast.error(`Error loading user: ${err.message}`);
        navigate("/users");
      }
    }
  });

  const user = userResponse?.data;

  const { data: groupItemsAvailable } = useQuery({
    queryKey: ["user_comp_groups", id],
    queryFn: () => userService.getAvailableGroupsForUser(id),
  });

  const { data: groupItemsAttached } = useQuery({
    queryKey: ["user_groups", id],
    queryFn: () => userService.getAttachedGroupsForUser(id),
  });

  const { data: scopeItemsAvailable } = useQuery({
    queryKey: ["user_comp_scopes", id],
    queryFn: () => userService.getAvailableScopesForUser(id),
  });

  const { data: scopeItemsAttached } = useQuery({
    queryKey: ["user_scopes", id],
    queryFn: () => userService.getAttachedScopesForUser(id),
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: any) => userService.updateUser(userData),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to update user: ${err.message}`);
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    console.log({userId: id, userData: JSON.parse(JSON.stringify(formData))});
    updateUserMutation.mutate({userId: id, userData: JSON.parse(JSON.stringify(formData))});
  };

  const addGroupMutation = useMutation({
    mutationFn: (groupId: string) => userService.addGroupUser({
      userId: id || "",
      groupId
    }),
    onSuccess: () => {
      toast.success("Group added to user successfully");
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['user_comp_groups', id] });
      queryClient.invalidateQueries({ queryKey: ['user_groups', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to add group: ${err.message}`);
    }
  });

  const removeGroupMutation = useMutation({
    mutationFn: (groupId: string) => userService.deleteGroupUser({
      userId: id || "",
      groupId
    }),
    onSuccess: () => {
      toast.success("Group removed from user successfully");
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['user_comp_groups', id] });
      queryClient.invalidateQueries({ queryKey: ['user_groups', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to remove group: ${err.message}`);
    }
  });

  const addScopeMutation = useMutation({
    mutationFn: (scopeId: string) => userService.addScopeUser({
      userId: id || "",
      scopeId
    }),
    onSuccess: () => {
      toast.success("Scope added to user successfully");
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['user_comp_scopes', id] });
      queryClient.invalidateQueries({ queryKey: ['user_scopes', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to add scope: ${err.message}`);
    }
  });

  const removeScopeMutation = useMutation({
    mutationFn: (scopeId: string) => userService.deleteScopeUser({
      userId: id || "",
      scopeId
    }),
    onSuccess: () => {
      toast.success("Scope removed from user successfully");
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['user_comp_scopes', id] });
      queryClient.invalidateQueries({ queryKey: ['user_scopes', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to remove scope: ${err.message}`);
    }
  });

  const handleAddGroup = (groupId: string) => {
    addGroupMutation.mutate(groupId);
  };

  const handleRemoveGroup = (groupId: string) => {
    removeGroupMutation.mutate(groupId);
  };

  const handleAddScope = (scopeId: string) => {
    addScopeMutation.mutate(scopeId);
  };

  const handleRemoveScope = (scopeId: string) => {
    removeScopeMutation.mutate(scopeId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <PageHeader title="User Details">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCog className="h-5 w-5 mr-2" />
                User Information
              </CardTitle>
              <CardDescription>
                View and edit user details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">User Details</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <UserForm user={user} onSave={handleSave} isLoading={isSaving} />
                </TabsContent>
                <TabsContent value="security">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="text-sm font-medium">User ID</div>
                        <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
                          {user.id}
                        </div>
                      </div>
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="text-sm font-medium">UUID</div>
                        <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded break-all">
                          {user.uuid}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="text-sm font-medium">GoogleID</div>
                        <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
                          {user?.google_id}
                        </div>
                      </div>
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="text-sm font-medium">MicrosoftID</div>
                        <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded break-all">
                          {user?.microsoft_d}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="text-sm font-medium">Registration Date</div>
                      <div className="mt-1">
                        {formatDate(user.date_registered)}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RelatedItemsCard
            title="Groups"
            attachedItems={groupItemsAttached?.data || []}
            availableItems={groupItemsAvailable?.data || []}
            entityType="Group"
            emptyMessage="This user is not a member of any groups."
            onAddItems={handleAddGroup}
            onRemoveItem={handleRemoveGroup}
            canManage={true}
          />
          
          <RelatedItemsCard
            title="Scopes"
            availableItems={scopeItemsAvailable?.data || []}
            attachedItems={scopeItemsAttached?.data || []}
            entityType="Scope"
            emptyMessage="This user has no assigned scopes."
            onAddItems={handleAddScope}
            onRemoveItem={handleRemoveScope}
            canManage={true}
          />
        </div>
      </div>
    </>
  );
};

export default UserDetailsPage;
