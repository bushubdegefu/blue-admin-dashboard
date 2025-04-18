
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCog } from "lucide-react";
import { User, RelatedItem } from "@/types";
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

  // Get user data with React Query
  const { 
    data: userResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id || ""),
    enabled: !!id,
  });
  
  if (isError) {
    toast.error(`Error loading user: ${(error as any).message}`);
    navigate("/users");
  }

  const user = userResponse?.data;

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData: any) => userService.updateUser({
      userId: id || "",
      userData
    }),
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
    updateUserMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Convert user.groups to RelatedItem[] for the RelatedItemsCard component
  const groupItems: RelatedItem[] = (user.groups || []).map(group => ({
    id: String(group.id),
    name: group.name,
    description: group.description,
    link: `/groups/${group.id}`,
  }));

  // Convert user.scopes to RelatedItem[] for the RelatedItemsCard component
  const scopeItems: RelatedItem[] = (user.scopes || []).map(scope => ({
    id: String(scope.id),
    name: scope.name,
    description: scope.description,
    link: `/scopes/${scope.id}`,
  }));

  return (
    <>
      <PageHeader title="User Details">
        <Button variant="outline" onClick={() => navigate("/users")}>
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
                <TabsList className="mb-4 bg-secondary">
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
                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="text-sm font-medium">Registration Date</div>
                      <div className="mt-1">
                        {formatDate(user.date_registered, "PPpp")}
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
            items={groupItems}
            entityType="Group"
            emptyMessage="This user is not a member of any groups."
          />
          
          <RelatedItemsCard
            title="Scopes"
            items={scopeItems}
            entityType="Scope"
            emptyMessage="This user has no assigned scopes."
          />
        </div>
      </div>
    </>
  );
};

export default UserDetailsPage;
