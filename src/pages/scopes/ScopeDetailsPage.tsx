
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Key } from "lucide-react";
import { Scope, RelatedItem } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { ScopeForm } from "@/components/forms/ScopeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scopeService } from "@/api/scopeService";

const ScopeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Get scope data with React Query
  const { 
    data: scopeResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['scope', id],
    queryFn: () => scopeService.getScopeById(id || ""),
    enabled: !!id,
    onError: (err: any) => {
      toast.error(`Error loading scope: ${err.message}`);
      navigate("/scopes");
    }
  });

  const scope = scopeResponse?.data;

  // Update scope mutation
  const updateScopeMutation = useMutation({
    mutationFn: (scopeData: any) => scopeService.updateScope({
      scopeId: id || "",
      scopeData
    }),
    onSuccess: () => {
      toast.success("Scope updated successfully");
      queryClient.invalidateQueries({ queryKey: ['scope', id] });
    },
    onError: (err: any) => {
      toast.error(`Failed to update scope: ${err.message}`);
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    updateScopeMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-500"></div>
      </div>
    );
  }

  if (!scope) {
    return null;
  }

  // Convert scope.resources to RelatedItem[] for the RelatedItemsCard component
  const resourceItems: RelatedItem[] = (scope.resources || []).map(resource => ({
    id: String(resource.id),
    name: resource.name,
    description: `${resource.method} ${resource.route_path}`,
  }));

  // Convert scope.users to RelatedItem[] for the RelatedItemsCard component
  const userItems: RelatedItem[] = (scope.users || []).map(user => ({
    id: String(user.id),
    name: `${user.first_name} ${user.last_name}`,
    description: user.username,
    link: `/users/${user.id}`,
  }));

  // Convert scope.groups to RelatedItem[] for the RelatedItemsCard component
  const groupItems: RelatedItem[] = (scope.groups || []).map(group => ({
    id: String(group.id),
    name: group.name,
    description: group.description,
    link: `/groups/${group.id}`,
  }));

  return (
    <>
      <PageHeader title="Scope Details">
        <Button variant="outline" onClick={() => navigate("/scopes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scopes
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Scope Information
              </CardTitle>
              <CardDescription>
                View and edit scope details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScopeForm 
                scope={scope} 
                onSave={handleSave} 
                isLoading={isSaving} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="resources">
            <TabsList className="w-full">
              <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
              <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
              <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources">
              <RelatedItemsCard
                title="Resources"
                items={resourceItems}
                entityType="Resource"
                emptyMessage="No resources assigned to this scope."
                canManage={true}
                onAddItems={() => navigate("/resources/new")}
              />
            </TabsContent>
            
            <TabsContent value="groups">
              <RelatedItemsCard
                title="Groups"
                items={groupItems}
                entityType="Group"
                emptyMessage="No groups have this scope."
                canManage={false}
              />
            </TabsContent>
            
            <TabsContent value="users">
              <RelatedItemsCard
                title="Users"
                items={userItems}
                entityType="User"
                emptyMessage="No users have this scope."
                canManage={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ScopeDetailsPage;
