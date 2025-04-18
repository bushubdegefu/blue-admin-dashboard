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
import { DataTable } from "@/components/common/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import StatusBadge from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { GroupForm } from "@/components/forms/GroupForm";
import { groupService } from "@/api/groupService";
import { Group, TableColumn, FilterOption, RelatedItem } from "@/types";

const GroupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch group details
  const { 
    data: groupResponse,
    isLoading,
    error 
  } = useQuery({
    queryKey: ["group", id],
    queryFn: () => groupService.getGroup(id as string),
    meta: {
      onError: (err: Error) => {
        toast.error(`Error loading group details: ${err.message}`);
      }
    }
  });

  if (error) {
    console.error("Error fetching group details:", error);
  }

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
    mutationFn: (data: any) => groupService.updateGroup(id as string, data),
    onSuccess: () => {
      toast.success("Group updated successfully");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update group: ${error.message}`);
    }
  });

  const handleDeleteGroup = () => {
    if (!id) return;
    deleteGroupMutation.mutate(id);
  };

  const handleUpdateGroup = async (formData: any) => {
    updateGroupMutation.mutate(formData);
  };

  if (isLoading || !group) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  // Related items
  const users = (group.users || []).map(user => ({
    id: user.id,
    name: `${user.first_name} ${user.middle_name ? user.middle_name + " " : ""}${user.last_name}`,
    description: user.email,
    link: `/users/${user.id}`
  }));

  const scopes = (group.scopes || []).map(scope => ({
    id: scope.id,
    name: scope.name,
    description: scope.description || "",
    link: `/scopes/${scope.id}`
  }));

  return (
    <>
      <PageHeader
        title={group.name}
        description={group.description || "No description"}
        backLink="/groups"
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
            <TabsTrigger value="users">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="scopes">
              Scopes ({scopes.length})
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
                items={users.slice(0, 5)}
                icon={<Users className="h-4 w-4 text-admin-500" />}
                emptyMessage="No users associated with this group"
                viewAllHref={users.length > 5 ? "#users" : undefined}
                viewAllAction={users.length > 5 ? () => setActiveTab("users") : undefined}
              />
            </div>

            <RelatedItemsCard 
              title="Associated Scopes"
              items={scopes}
              icon={<CheckCircle2 className="h-4 w-4 text-admin-500" />}
              emptyMessage="No scopes associated with this group"
              viewAllHref={scopes.length > 5 ? "#scopes" : undefined}
              viewAllAction={scopes.length > 5 ? () => setActiveTab("scopes") : undefined}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {/* Users table here */}
          </TabsContent>

          <TabsContent value="scopes" className="mt-6">
            {/* Scopes table here */}
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

      <GroupForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Group"
        defaultValues={group}
        onSubmit={handleUpdateGroup}
        isLoading={updateGroupMutation.isPending}
      />
    </>
  );
};

export default GroupDetailsPage;
