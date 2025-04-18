
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge, Pencil, Trash2, Users, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedItemsCard } from "@/components/common/RelatedItemsCard";
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ScopeForm } from "@/components/forms/ScopeForm";
import { scopeService } from "@/api/scopeService";
import { Scope, TableColumn, FilterOption, RelatedItem } from "@/types";

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
    error 
  } = useQuery({
    queryKey: ["scope", id],
    queryFn: () => scopeService.getScope(id as string),
    meta: {
      onError: (err: Error) => {
        toast.error(`Error loading scope details: ${err.message}`);
      }
    }
  });

  if (error) {
    console.error("Error fetching scope details:", error);
  }

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
    }
  });

  // Update scope mutation
  const updateScopeMutation = useMutation({
    mutationFn: (data: any) => scopeService.updateScope(id as string, data),
    onSuccess: () => {
      toast.success("Scope updated successfully");
      queryClient.invalidateQueries({ queryKey: ["scope", id] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update scope: ${error.message}`);
    }
  });

  const handleDeleteScope = () => {
    if (!id) return;
    deleteScopeMutation.mutate(id);
  };

  const handleUpdateScope = async (formData: any) => {
    updateScopeMutation.mutate(formData);
  };

  if (isLoading || !scope) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  // Related items
  const resources = (scope.resources || []).map(resource => ({
    id: resource.id,
    name: resource.name,
    description: `${resource.method} ${resource.route_path}`,
    link: `/resources/${resource.id}`
  }));

  const groups = (scope.groups || []).map(group => ({
    id: group.id,
    name: group.name,
    description: group.description || "",
    link: `/groups/${group.id}`
  }));

  const users = (scope.users || []).map(user => ({
    id: user.id,
    name: `${user.first_name} ${user.middle_name ? user.middle_name + " " : ""}${user.last_name}`,
    description: user.email,
    link: `/users/${user.id}`
  }));

  return (
    <>
      <PageHeader
        title={scope.name}
        description={scope.description || "No description"}
        backLink="/scopes"
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
            <TabsTrigger value="groups">
              Groups ({groups.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              Users ({users.length})
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
                    <div>{scope.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Description</div>
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
                items={resources.slice(0, 5)}
                icon={<Badge className="h-4 w-4 text-admin-500" />}
                emptyMessage="No resources associated with this scope"
                viewAllHref={resources.length > 5 ? "#resources" : undefined}
                viewAllAction={resources.length > 5 ? () => setActiveTab("resources") : undefined}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RelatedItemsCard 
                title="Associated Groups"
                items={groups.slice(0, 5)}
                icon={<Users className="h-4 w-4 text-admin-500" />}
                emptyMessage="No groups associated with this scope"
                viewAllHref={groups.length > 5 ? "#groups" : undefined}
                viewAllAction={groups.length > 5 ? () => setActiveTab("groups") : undefined}
              />

              <RelatedItemsCard 
                title="Associated Users"
                items={users.slice(0, 5)}
                icon={<CheckCircle2 className="h-4 w-4 text-admin-500" />}
                emptyMessage="No users associated with this scope"
                viewAllHref={users.length > 5 ? "#users" : undefined}
                viewAllAction={users.length > 5 ? () => setActiveTab("users") : undefined}
              />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            {/* Resources table here */}
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            {/* Groups table here */}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {/* Users table here */}
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

      <ScopeForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Scope"
        defaultValues={scope}
        onSubmit={handleUpdateScope}
        isLoading={updateScopeMutation.isPending}
      />
    </>
  );
};

export default ScopeDetailsPage;
