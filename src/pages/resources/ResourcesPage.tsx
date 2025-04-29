import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, ExternalLink, Edit2, X, Save } from "lucide-react";
import { Resource, FilterOption } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import { ActionMenu, ActionMenuCol } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceService } from "@/api/resourceService";
import { useForm } from "react-hook-form";
import GenericFilterCard from "@/components/common/GenricFilterCard";
import GenericPagination from "@/components/common/Pagination";
import { DataTableEdit } from "@/components/common/DataTableEdit";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { set } from "date-fns";
import ResourceForm from "@/components/forms/ResourceForm";

const ResourcesPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditResource, setIsEditResource] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [resourcesEdit, setResourcesEdit] = useState<any>({
    name: "",
    method: "",
    route_path: "",
    description: "",
  }); // or however you define it

  const [filters, setFilters] = useState({
    name: "",
    method: "",
  });
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(
    null
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: resourcesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resources", page, pageSize, filters],
    queryFn: () =>
      resourceService.getResources({
        page,
        size: pageSize,
        ...filters,
      }),
    meta: {
      onError: (err: any) => {
        toast.error(`Error loading resources: ${err.message}`);
      },
    },
  });

  if (error) {
    console.error("Error fetching resources:", error);
  }

  const resources = resourcesResponse?.data || [];

  // Update group mutation
  const updateResourceMutation = useMutation({
    mutationFn: (data: any) =>
      resourceService.updateResource({
        resourceId: data?.id,
        resourceData: data,
      }),
    onSuccess: () => {
      toast.success("Resource updated successfully");
      queryClient.invalidateQueries({ queryKey: ["resources", page,pageSize,filters] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update Resource: ${error.message}`);
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) =>
      resourceService.deleteResource(resourceId),
    onSuccess: () => {
      toast.success(
        `Resource "${resourceToDelete?.name}" deleted successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["resources",  page,pageSize,filters] });
      setResourceToDelete(null);
      setConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete resource: ${error.message}`);
      setConfirmDialogOpen(false);
    },
  });

  const handleDeleteResource = (resourceToDelete) => {
    if (!resourceToDelete) return;
    deleteResourceMutation.mutate(resourceToDelete.id);
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (info) => (
        <div className="space-y-1">
          <div className="font-medium">{info.getValue() as string}</div>
          <div className="text-xs text-gray-500 font-mono">
            ID: {info.row.original.id}
          </div>
        </div>
      ),
    },
    {
      header: "Route Path",
      accessorKey: "route_path",
      cell: (info) => (
        <div className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">
          {info.getValue() as string}
        </div>
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
    {
      header: "Description",
      accessorKey: "description",
      cell: (info) => (
        <div className="max-w-xs truncate">
          {(info.getValue() as string) || (
            <span className="text-gray-400 text-xs">No description</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (info) => (   

      
          <ActionMenu
            actions={[
              {
                label: "Edit",
                icon: <Edit2 className="h-4 w-4 mr-2" />,
                onClick: () => {
                  console.log(resourcesEdit)
                  setResourcesEdit({ ...info.row.original });
                  setEditingRowId(info.getValue() as string);
                  setIsEditResource(true) // Start editing
                },
              },
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4 mr-2" />,
                onClick: () => {
                  setResourceToDelete(info.row.original);
                  setConfirmDialogOpen(true);
                },
                variant: "destructive",
              },
            ]}
          />
        
      ),
      enableSorting: false,
    },
  ];

  const filterOptions: FilterOption[] = [
    { field: "name", label: "Name", type: "text" },
    {
      field: "method",
      label: "Method",
      type: "select",
      options: [
        { label: "GET", value: "GET" },
        { label: "POST", value: "POST" },
        { label: "PUT", value: "PUT" },
        { label: "PATCH", value: "PATCH" },
        { label: "DELETE", value: "DELETE" },
        { label: "HEAD", value: "HEAD" },
        { label: "OPTIONS", value: "OPTIONS" },
      ],
    },
  ];

  const filterForm = useForm({
    defaultValues: {
      name: "",
      method: "",
    },
  });

  const clearFilters = () => {
    filterForm.reset({
      name: "",
      method: "",
    });

    setFilters({
      name: "",
      method: "",
    });
    setPage(1);
  };

  const handleUpdateResource = async (formData: any) => {
    updateResourceMutation.mutate(formData);
  };

  return (
    <>
      <PageHeader
        title="Resources"
        description="Manage API resources in the system"
      >
        <Button asChild>
          <Link to="/admin/resources/new">
            <Plus className="h-4 w-4 mr-2" />
            New Resource
          </Link>
        </Button>
      </PageHeader>
      <GenericFilterCard
        columns={filterOptions}
        queryKey="resources"
        setFilters={setFilters}
        filterForm={filterForm}
        clearFilters={clearFilters}
        setPage={setPage}
      />

      <DataTableEdit
        columns={columns}
        data={resources}
        isLoading={isLoading}
        filterOptions={filterOptions}
        searchPlaceholder="Search resources..."
      />
      <GenericPagination
        totalItems={resourcesResponse?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        queryKey="users"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Resource"
        description={`Are you sure you want to delete the resource "${resourceToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => handleDeleteResource(resourceToDelete)}
        variant="destructive"
        isLoading={deleteResourceMutation.isPending}
      />

      <Dialog open={isEditResource} onOpenChange={setIsEditResource}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Scopes to Group</DialogTitle>
          </DialogHeader>
          <ResourceForm
            resource={resourcesEdit}
            onSave={handleUpdateResource}
            isLoading={updateResourceMutation.isPending}
            onCancel={setIsEditResource}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResourcesPage;
