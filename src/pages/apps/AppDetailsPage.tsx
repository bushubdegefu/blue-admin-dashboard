
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  AppWindow,
  Users,
  Shield
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InlineEditFormWrapper } from "@/components/common/InlineEditFormWrapper";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PaginatedDataTable } from "@/components/common/PaginatedDataTable";
import { AppForm } from "@/components/forms/AppForm";
import { appService } from "@/api/appService";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

const AppDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupsPage, setGroupsPage] = useState(1);
  const [rolesPage, setRolesPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch app details
  const { 
    data: appResponse,
    isLoading,
    error 
  } = useQuery({
    queryKey: ["app", id],
    queryFn: () => appService.getAppById(id as string),
    enabled: !!id,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          toast.error(`Error loading app: ${(error as any).message}`);
        }
      }
    }
  });

  const app = appResponse?.data;

  // Fetch groups with pagination
  const {
    data: groupsData,
    isLoading: isLoadingGroups
  } = useQuery({
    queryKey: ["app_groups", id, groupsPage, pageSize],
    queryFn: () => appService.getAppGroups(id as string, { page: groupsPage, limit: pageSize }),
    enabled: !!id && activeTab === "groups"
  });

  // Fetch roles with pagination
  const {
    data: rolesData,
    isLoading: isLoadingRoles
  } = useQuery({
    queryKey: ["app_roles", id, rolesPage, pageSize],
    queryFn: () => appService.getAppRoles(id as string, { page: rolesPage, limit: pageSize }),
    enabled: !!id && activeTab === "roles"
  });

  // Delete app mutation
  const deleteAppMutation = useMutation({
    mutationFn: (appId: string) => appService.deleteApp(appId),
    onSuccess: () => {
      toast.success(`App "${app?.name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      navigate("/apps");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete app: ${error.message}`);
      setIsDeleteDialogOpen(false);
    }
  });

  // Update app mutation
  const updateAppMutation = useMutation({
    mutationFn: (data: any) => appService.updateApp({
      appId: id as string,
      appData: data
    }),
    onSuccess: () => {
      toast.success("App updated successfully");
      queryClient.invalidateQueries({ queryKey: ["app", id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update app: ${error.message}`);
    }
  });

  // Update specific field mutation
  const updateFieldMutation = useMutation({
    mutationFn: ({ field, value }: { field: string; value: any }) => {
      const data = { [field]: value };
      return appService.updateApp({
        appId: id as string,
        appData: data
      });
    },
    onSuccess: () => {
      toast.success("Field updated successfully");
      queryClient.invalidateQueries({ queryKey: ["app", id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update field: ${error.message}`);
    }
  });

  const handleDeleteApp = () => {
    if (!id) return;
    deleteAppMutation.mutate(id);
  };

  const handleUpdateApp = async (formData: any) => {
    updateAppMutation.mutate(formData);
    setIsEditDialogOpen(false);
  };

  const handleUpdateField = async (field: string, value: any) => {
    return updateFieldMutation.mutateAsync({ field, value });
  };

  // Table columns
  const groupColumns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const group = row.original;
        return (
          <div className="font-medium">{group.name}</div>
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
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {}}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      }
    }
  ];

  const roleColumns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="font-medium">{role.name}</div>
        );
      }
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {}}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      }
    }
  ];

  if (isLoading || !app) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={app.name} description={app.description || "No description"}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/apps")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Apps
          </Button>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">
            Groups ({groupsData?.meta?.totalItems || 0})
          </TabsTrigger>
          <TabsTrigger value="roles">
            Roles ({rolesData?.meta?.totalItems || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AppWindow className="h-5 w-5 mr-2" />
                  App Information
                </CardTitle>
                <CardDescription>
                  View and edit app details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <InlineEditFormWrapper
                    label="Name"
                    value={app.name}
                    fieldName="name"
                    onSave={(value) => handleUpdateField("name", value)}
                    type="text"
                    isLoading={updateFieldMutation.isPending}
                  />
                  
                  <InlineEditFormWrapper
                    label="Description"
                    value={app.description || ""}
                    fieldName="description"
                    onSave={(value) => handleUpdateField("description", value)}
                    type="textarea"
                    placeholder="No description provided"
                    isLoading={updateFieldMutation.isPending}
                  />
                  
                  <InlineEditFormWrapper
                    label="Status"
                    value={app.active}
                    fieldName="active"
                    onSave={(value) => handleUpdateField("active", value)}
                    type="boolean"
                    isLoading={updateFieldMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">ID</div>
                  <div className="font-mono text-xs">{app.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">UUID</div>
                  <div className="font-mono text-xs">{app.uuid}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Created At</div>
                  <div>{formatDate(app.created_at || "", "PPpp") || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Updated At</div>
                  <div>{formatDate(app.updated_at || "", "PPpp") || "Unknown"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Groups
              </CardTitle>
              <CardDescription>
                Manage groups associated with this app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaginatedDataTable
                columns={groupColumns}
                data={groupsData?.data || []}
                isLoading={isLoadingGroups}
                pageCount={groupsData?.meta?.totalPages || 1}
                totalItems={groupsData?.meta?.totalItems || 0}
                currentPage={groupsPage}
                pageSize={pageSize}
                onPageChange={(page) => setGroupsPage(page)}
                onPageSizeChange={(size) => setPageSize(size)}
                searchPlaceholder="Search groups..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Roles
              </CardTitle>
              <CardDescription>
                Manage roles associated with this app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaginatedDataTable
                columns={roleColumns}
                data={rolesData?.data || []}
                isLoading={isLoadingRoles}
                pageCount={rolesData?.meta?.totalPages || 1}
                totalItems={rolesData?.meta?.totalItems || 0}
                currentPage={rolesPage}
                pageSize={pageSize}
                onPageChange={(page) => setRolesPage(page)}
                onPageSizeChange={(size) => setPageSize(size)}
                searchPlaceholder="Search roles..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete App"
        description={`Are you sure you want to delete the app "${app.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteApp}
        variant="destructive"
        isLoading={deleteAppMutation.isPending}
      />

      {isEditDialogOpen && (
        <AppForm
          app={app}
          onSave={handleUpdateApp}
          isLoading={updateAppMutation.isPending}
        />
      )}
    </>
  );
};

export default AppDetailsPage;
